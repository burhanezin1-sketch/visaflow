-- ============================================================
-- 20260602_ogrenci_kulturel_fix.sql
--
-- 1. ogrenci paketine "Öğrenci belgesi" ekle (yoksa)
--    get_visa_documents(): occupation='ogrenci' ise paket ne olursa
--    olsun 'Öğrenci belgesi' daima eklenir.
--    (Turistik+ogrenci → ev_hanimi paketi gelir ama öğrenci belgesi
--     de eklenir; Eğitim/Öğrenci+ogrenci → zaten tam paket gelir)
--
-- 2. Kültürel Vize duplicate davetiye evraklarını temizle + birleştir
-- ============================================================


-- ── 1. ogrenci paketi: Öğrenci belgesi (yoksa ekle) ──────────
INSERT INTO public.occupation_doc_packages
  (occupation, doc_name, delivery_type, order_num)
SELECT 'ogrenci', 'Öğrenci belgesi (e-devlet, barkodlu)', 'digital', 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.occupation_doc_packages
  WHERE occupation = 'ogrenci'
    AND doc_name ILIKE '%öğrenci belgesi%'
);


-- ── 2. Kültürel Vize: davetiye duplicate temizle ─────────────
DELETE FROM public.country_specific_docs
WHERE  visa_type = 'Kültürel Vize'
  AND  country   IS NULL
  AND  (
         doc_name ILIKE '%davet%'
      OR doc_name ILIKE '%katılım belgesi%'
      OR doc_name ILIKE '%davetiye%'
       );

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
SELECT NULL, 'Kültürel Vize',
  'Davet eden kurumdan resmi davet mektubu / etkinlik katılım belgesi',
  'digital', 2
WHERE NOT EXISTS (
  SELECT 1 FROM public.country_specific_docs
  WHERE  country   IS NULL
    AND  visa_type  = 'Kültürel Vize'
    AND  doc_name  ILIKE '%davet%'
);


-- ── 3. get_visa_documents(): occupation='ogrenci' özel kuralı ─
CREATE OR REPLACE FUNCTION public.get_visa_documents(
  p_application_id uuid,
  p_country        text,
  p_visa_type      text,
  p_occupation     text DEFAULT NULL
)
RETURNS SETOF public.user_submitted_docs
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
  IF NOT EXISTS (
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

  -- Kural tablosundan paket
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

  -- ── Layer 1: Standart evraklar ──────────────────────────────
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%')
    AND  NOT (
           doc_name ILIKE '%sağlık sigortası%'
           AND EXISTS (
             SELECT 1 FROM public.country_specific_docs csd
             WHERE  (csd.country IS NULL OR csd.country = p_country)
               AND  (csd.visa_type IS NULL OR csd.visa_type = p_visa_type)
               AND  csd.doc_name ILIKE '%sağlık sigortası%'
           )
         )
    AND  NOT (
           p_visa_type = 'Transit Vize'
           AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%')
         )
    AND  NOT (
           doc_name ILIKE '%banka hesap%'
           AND NOT doc_name ILIKE '%şirket%'
           AND v_package IS NOT NULL
           AND v_package NOT IN ('none', 'isveren_evraklari')
           AND EXISTS (
             SELECT 1 FROM public.occupation_doc_packages odp
             WHERE  odp.occupation = v_package
               AND  odp.doc_name ILIKE '%banka%'
               AND  NOT odp.doc_name ILIKE '%şirket%'
           )
         )
  ORDER BY order_num;

  -- ── Layer 2: Meslek paketi ──────────────────────────────────
  IF v_package IS NOT NULL
     AND v_package NOT IN ('none', 'isveren_evraklari')
  THEN
    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_package
    ORDER  BY order_num;
  END IF;

  -- ── Layer 2b: Öğrenci belgesi — her zaman, paket ne olursa ──
  -- occupation='ogrenci' seçilmişse, hangi paket gelirse gelsin
  -- "Öğrenci belgesi" daima eklenir.
  -- Örnek: Turistik+ogrenci → ev_hanimi paketi + öğrenci belgesi
  IF p_occupation = 'ogrenci' AND v_package != 'ogrenci' THEN
    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = 'ogrenci'
      AND  doc_name   ILIKE '%öğrenci belgesi%'
    ORDER  BY order_num;
  END IF;

  -- ── Layer 3: Ülkeye özgü + tüm ülkeler ──────────────────────
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    AND  NOT (
           visa_type IS NULL
           AND (doc_name ILIKE '%başvuru formu%' OR doc_name ILIKE '%vize formu%')
           AND EXISTS (
             SELECT 1 FROM public.country_specific_docs sub
             WHERE  (sub.country IS NULL OR sub.country = p_country)
               AND  sub.visa_type = p_visa_type
               AND  (sub.doc_name ILIKE '%başvuru formu%' OR sub.doc_name ILIKE '%vize formu%')
           )
         )
    AND  NOT (
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

  -- ── Semantic dedup ──────────────────────────────────────────
  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
    AND  id NOT IN (
           SELECT id
           FROM (
             SELECT DISTINCT ON (dedup_key) id
             FROM (
               SELECT id,
                 CASE
                   WHEN doc_name ILIKE '%şirket%' AND doc_name ILIKE '%banka%'
                     THEN 'sirket_banka::' || id::text
                   WHEN doc_name ILIKE '%banka%'
                     THEN 'sahsi_banka'
                   ELSE doc_name
                 END AS dedup_key
               FROM public.user_submitted_docs
               WHERE application_id = p_application_id
             ) keyed
             ORDER BY dedup_key, id DESC
           ) kept
         );

  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
