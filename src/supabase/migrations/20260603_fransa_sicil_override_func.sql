-- ============================================================
-- 20260603_fransa_sicil_override_func.sql
--
-- 1. country_specific_docs: Fransa overrides (idempotent)
--    - Ticaret sicil gazetesi (visa_type=NULL, order_num=103)
--    - Ticari/İş Gezisi dilekçesi (order_num=201)
-- 2. get_visa_documents(): KATMAN 2'ye Fransa filtresi eklendi —
--    occupation paketindeki "%tercüm%" ticaret sicil gazetesi atlanır
-- ============================================================

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Fransa', NULL,               'Ticaret sicil gazetesi',                                                                                         'digital', 103),
  ('Fransa', 'Ticari/İş Gezisi', 'Şirket antetli kağıdına yazılmış İngilizce veya Fransızca ticari vize talep dilekçesi (imzalı ve kaşeli)',       'digital', 201)
ON CONFLICT DO NOTHING;


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
  v_package         text;
  non_schengen      CONSTANT text[] := ARRAY[
    'Amerika Birleşik Devletleri',
    'Kanada',
    'İngiltere',
    'Japonya',
    'Güney Kore'
  ];
  uk_calisma_excl   CONSTANT text[] := ARRAY[
    'UK Standard Visitor Visa formu — GOV.UK online (online doldurulur, firma tarafından yönetilir)',
    'Seyahat sağlık sigortası (İngiltere için geçerli poliçe)',
    'SGK İşe Giriş Bildirgesi (e-devlet, barkodlu)',
    'Maaş bordrosu (son 3 ay)',
    'İşveren izin yazısı (kaşeli, imzalı)',
    'Seyahat sağlık sigortası (tüm Schengen / hedef ülke geçerli, min. 30.000 €)'
  ];
  usa_transit_excl  CONSTANT text[] := ARRAY[
    'Transit vize başvuru formu (imzalı)',
    'Seyahat sağlık sigortası (tüm Schengen / hedef ülke geçerli, min. 30.000 €)',
    'Seyahat sağlık sigortası (Amerika için geçerli poliçe)',
    'Seyahat sağlık sigortası (ABD için geçerli poliçe)',
    'Seyahat sağlık sigortası',
    'Gidiş-dönüş uçak bileti rezervasyonu'
  ];
  jp_tedavi_excl    CONSTANT text[] := ARRAY[
    'Seyahat sağlık sigortası (tüm Schengen / hedef ülke geçerli, min. 30.000 €)',
    'Schengen/ülke vize başvuru formu (imzalı)',
    'Seyahat sağlık sigortası (Japonya için geçerli poliçe)',
    'Seyahat sağlık sigortası',
    'Seyahat sağlık sigortası (min. 30.000 €)'
  ];
  resmi_vize_excl   CONSTANT text[] := ARRAY[
    'Son 3 aylık banka hesap dökümü',
    'Seyahat sağlık sigortası'
  ];
  -- Ülkeler: occupation paketinden tercümeli ticaret sicil gazetesini atla
  sicil_override_countries CONSTANT text[] := ARRAY['Almanya', 'Fransa'];
BEGIN
  -- auth.uid() NULL ise RLS zaten koruma sağlar, kontrolü atla
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
  -- ══════════════════════════════════════════════════════════
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE
    NOT (p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%')
    AND NOT (p_visa_type = 'Transit Vize'
             AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%'))
    AND NOT (
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND doc_name NOT ILIKE '%pasaport%'
      AND doc_name NOT ILIKE '%kimlik%'
      AND doc_name NOT ILIKE '%fotoğraf%'
    )
    AND NOT (
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND (
        doc_name ILIKE '%Standard Visitor%'
        OR doc_name ILIKE '%visitor visa%'
        OR doc_name ILIKE '%seyahat sağlık sigortası%'
        OR doc_name ILIKE '%30.000%'
        OR doc_name ILIKE '%işveren izin%'
        OR doc_name ILIKE '%görev yazısı%'
      )
    )
    AND NOT (
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND doc_name = ANY(uk_calisma_excl)
    )
    AND NOT (
      p_country   = 'Amerika Birleşik Devletleri'
      AND p_visa_type = 'Transit Vize'
      AND doc_name = ANY(usa_transit_excl)
    )
    AND NOT (
      p_country   = 'Japonya'
      AND p_visa_type = 'Tedavi/Sağlık Vizesi'
      AND doc_name = ANY(jp_tedavi_excl)
    )
    AND NOT (
      p_visa_type = 'Resmi Vize'
      AND doc_name = ANY(resmi_vize_excl)
    )
  ORDER BY order_num;


  -- ══════════════════════════════════════════════════════════
  -- KATMAN 2: Meslek paketi
  -- ══════════════════════════════════════════════════════════
  IF v_package IS NOT NULL
     AND v_package NOT IN ('none', 'isveren_evraklari')
  THEN
    INSERT INTO public.user_submitted_docs
      (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_package
      AND NOT (v_package = 'sirket_sahibi'
               AND (doc_name ILIKE '%sponsor%' OR doc_name ILIKE '%taahhütname%'))
      -- Almanya / Fransa: occupation paketindeki tercümeli ticaret sicil gazetesini atla
      AND NOT (
        p_country = ANY(sicil_override_countries)
        AND doc_name ILIKE '%ticaret sicil gazetesi%'
        AND doc_name ILIKE '%tercüm%'
      )
      AND NOT (
        p_country   = 'İngiltere'
        AND p_visa_type = 'Çalışma/İş Vizesi'
        AND (
          doc_name ILIKE '%Standard Visitor%'
          OR doc_name ILIKE '%visitor visa%'
          OR doc_name ILIKE '%seyahat sağlık sigortası%'
          OR doc_name ILIKE '%30.000%'
          OR doc_name ILIKE '%işveren izin%'
          OR doc_name ILIKE '%görev yazısı%'
        )
      )
      AND NOT (
        p_country   = 'İngiltere'
        AND p_visa_type = 'Çalışma/İş Vizesi'
        AND doc_name = ANY(uk_calisma_excl)
      )
      AND NOT (
        p_country   = 'Amerika Birleşik Devletleri'
        AND p_visa_type = 'Transit Vize'
        AND doc_name = ANY(usa_transit_excl)
      )
      AND NOT (
        p_country   = 'Japonya'
        AND p_visa_type = 'Tedavi/Sağlık Vizesi'
        AND doc_name = ANY(jp_tedavi_excl)
      )
      AND NOT (
        p_visa_type = 'Resmi Vize'
        AND doc_name = ANY(resmi_vize_excl)
      )
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
      AND NOT (
        p_country   = 'İngiltere'
        AND p_visa_type = 'Çalışma/İş Vizesi'
        AND doc_name = ANY(uk_calisma_excl)
      )
      AND NOT (
        p_country   = 'Amerika Birleşik Devletleri'
        AND p_visa_type = 'Transit Vize'
        AND doc_name = ANY(usa_transit_excl)
      )
      AND NOT (
        p_country   = 'Japonya'
        AND p_visa_type = 'Tedavi/Sağlık Vizesi'
        AND doc_name = ANY(jp_tedavi_excl)
      )
      AND NOT (
        p_visa_type = 'Resmi Vize'
        AND doc_name = ANY(resmi_vize_excl)
      )
    ORDER  BY order_num;
  END IF;


  -- ══════════════════════════════════════════════════════════
  -- KATMAN 3: Ülkeye özgü evraklar
  -- ══════════════════════════════════════════════════════════
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
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
    AND NOT (
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND doc_name = ANY(uk_calisma_excl)
    )
    AND NOT (
      p_country   = 'Amerika Birleşik Devletleri'
      AND p_visa_type = 'Transit Vize'
      AND doc_name = ANY(usa_transit_excl)
    )
    AND NOT (
      p_country   = 'Japonya'
      AND p_visa_type = 'Tedavi/Sağlık Vizesi'
      AND doc_name = ANY(jp_tedavi_excl)
    )
    AND NOT (
      p_visa_type = 'Resmi Vize'
      AND doc_name = ANY(resmi_vize_excl)
    )
  ORDER BY
    CASE WHEN country   = p_country THEN 0 ELSE 1 END,
    CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
    order_num;


  -- ══════════════════════════════════════════════════════════
  -- POST-INSERT TEMİZLİK
  -- ══════════════════════════════════════════════════════════

  -- Resmi Vize: banka ve sigorta evraklarını sil
  IF p_visa_type = 'Resmi Vize' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%banka hesap dökümü%'
        OR doc_name ILIKE '%seyahat sağlık sigortası%'
        OR doc_name ILIKE '%30.000%'
      );
  END IF;

  -- Kültürel Vize + calisan: sponsor/veli/taahhütname evraklarını sil
  IF p_visa_type = 'Kültürel Vize' AND p_occupation = 'calisan' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%sponsor%'
        OR doc_name ILIKE '%veli%'
        OR doc_name ILIKE '%taahhütname%'
      );
  END IF;

  -- Kültürel Vize + calisan: duplicate seyahat sağlık sigortası (ctid)
  IF p_visa_type = 'Kültürel Vize' AND p_occupation = 'calisan' THEN
    DELETE FROM public.user_submitted_docs a
    USING  public.user_submitted_docs b
    WHERE  a.application_id = p_application_id
      AND  b.application_id = p_application_id
      AND  a.doc_name ILIKE '%seyahat sağlık sigortası%'
      AND  b.doc_name ILIKE '%seyahat sağlık sigortası%'
      AND  a.ctid > b.ctid;
  END IF;

  -- Tüm vize türleri: duplicate seyahat sağlık sigortası (ctid)
  DELETE FROM public.user_submitted_docs a
  USING  public.user_submitted_docs b
  WHERE  a.application_id = p_application_id
    AND  b.application_id = p_application_id
    AND  a.doc_name ILIKE '%seyahat sağlık sigortası%'
    AND  b.doc_name ILIKE '%seyahat sağlık sigortası%'
    AND  a.ctid > b.ctid;


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
