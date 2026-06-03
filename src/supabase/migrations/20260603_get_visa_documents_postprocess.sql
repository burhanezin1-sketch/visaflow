-- ============================================================
-- 20260603_get_visa_documents_postprocess.sql
--
-- DEDUP'tan önce 2 post-processing kuralı eklendi:
-- 1. Mükerrer sigorta: "tüm Schengen" varsa generic "Seyahat sağlık
--    sigortası" satırını sil
-- 2. Çalışan/işveren occupation: sponsor/veli evraklarını sil
-- ============================================================

DROP FUNCTION IF EXISTS public.get_visa_documents(uuid, text, text, text);

CREATE FUNCTION public.get_visa_documents(
  p_application_id uuid,
  p_country        text,
  p_visa_type      text,
  p_occupation     text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_package    text;
  non_schengen CONSTANT text[] := ARRAY[
    'Amerika Birleşik Devletleri',
    'Kanada',
    'İngiltere',
    'Japonya',
    'Güney Kore'
  ];
BEGIN
  -- auth.uid() NULL ise RLS korur, kontrolü atla
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM   public.applications a
    JOIN   public.users u ON u.company_id = a.company_id
    WHERE  a.id = p_application_id
      AND  u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Erişim reddedildi: başvuru firmanıza ait değil';
  END IF;

  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id;

  -- Kural tablosundan meslek paketi
  SELECT package_name INTO v_package
  FROM   public.visa_package_rules
  WHERE  visa_type  = p_visa_type
    AND  is_active  = true
    AND  (occupation = p_occupation OR occupation IS NULL)
    AND  (country    = p_country    OR country    IS NULL)
  ORDER BY
    CASE WHEN country    = p_country    THEN 0 ELSE 1 END,
    CASE WHEN occupation = p_occupation THEN 0 ELSE 1 END,
    priority ASC
  LIMIT 1;

  -- ══════════════════════════════════════════════════════════
  -- KATMAN 1: Standart evraklar
  -- Filtre A: Schengen dışı ülkelerde genel "30.000 €" sigortayı atla
  -- Filtre B: Transit Vize'de gidiş-dönüş bilet/uçak evraklarını atla
  -- ══════════════════════════════════════════════════════════
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE
    NOT (p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%')
    AND NOT (p_visa_type = 'Transit Vize'
             AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%'))
  ORDER BY order_num;


  -- ══════════════════════════════════════════════════════════
  -- KATMAN 2: Meslek paketi (occupation_doc_packages)
  -- ══════════════════════════════════════════════════════════
  IF v_package IS NOT NULL
     AND v_package NOT IN ('none', 'isveren_evraklari')
  THEN
    INSERT INTO public.user_submitted_docs
      (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_package
    ORDER  BY order_num;
  END IF;

  -- Öğrenci belgesi: occupation='ogrenci' + paket ogrenci değilse daima ekle
  IF p_occupation = 'ogrenci' AND (v_package IS NULL OR v_package != 'ogrenci') THEN
    INSERT INTO public.user_submitted_docs
      (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = 'ogrenci'
      AND  doc_name   ILIKE '%öğrenci belgesi%'
    ORDER  BY order_num;
  END IF;


  -- ══════════════════════════════════════════════════════════
  -- KATMAN 3: Ülkeye özgü evraklar
  -- occupation kolonu ile data-driven filtre
  -- başvuru formu / davet dedup mantığı korundu
  -- ══════════════════════════════════════════════════════════
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    AND  (occupation IS NULL OR occupation = p_occupation)
    AND NOT (
      visa_type IS NULL
      AND (doc_name ILIKE '%başvuru formu%' OR doc_name ILIKE '%vize formu%')
      AND EXISTS (
        SELECT 1 FROM public.country_specific_docs sub
        WHERE  (sub.country IS NULL OR sub.country = p_country)
          AND  sub.visa_type = p_visa_type
          AND  (sub.doc_name ILIKE '%başvuru formu%' OR sub.doc_name ILIKE '%vize formu%')
      )
    )
    AND NOT (
      country IS NULL
      AND doc_name ILIKE '%davet%'
      AND EXISTS (
        SELECT 1 FROM public.country_specific_docs sub
        WHERE  sub.country   = p_country
          AND  sub.visa_type = p_visa_type
          AND  sub.doc_name  ILIKE '%davet%'
      )
    )
  ORDER BY
    CASE WHEN country   = p_country THEN 0 ELSE 1 END,
    CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
    order_num;


  -- ══════════════════════════════════════════════════════════
  -- POST-PROCESSING
  -- ══════════════════════════════════════════════════════════

  -- 1. Mükerrer sigorta: spesifik "tüm Schengen" versiyonu varsa
  --    generic "Seyahat sağlık sigortası" satırını sil
  IF EXISTS (
    SELECT 1 FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%tüm Schengen%'
  ) THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name = 'Seyahat sağlık sigortası';
  END IF;

  -- 2. Çalışan / işveren meslekleri için sponsor evraklarını sil
  IF p_occupation IN ('sirket_sahibi', 'serbest_meslek', 'calisan') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsor tarafından%'
        OR doc_name ILIKE '%Sponsorun SGK%'
        OR doc_name ILIKE '%Sponsorun İşveren%'
        OR doc_name ILIKE '%Sponsor (eş/veli)%'
        OR doc_name ILIKE '%Sponsor banka%'
        OR doc_name ILIKE '%Aile cüzdanı%'
        OR doc_name ILIKE '%nikah cüzdanı%'
        OR doc_name ILIKE '%masraf taahhütname%'
        OR doc_name ILIKE '%veli/sponsor%'
      );
  END IF;


  -- ══════════════════════════════════════════════════════════
  -- DEDUP: aynı doc_name, ctid küçük olan (ilk eklenen) kalır
  -- ══════════════════════════════════════════════════════════
  DELETE FROM public.user_submitted_docs a
  USING  public.user_submitted_docs b
  WHERE  a.application_id = p_application_id
    AND  b.application_id = p_application_id
    AND  a.doc_name = b.doc_name
    AND  a.ctid > b.ctid;

END;
$$;
