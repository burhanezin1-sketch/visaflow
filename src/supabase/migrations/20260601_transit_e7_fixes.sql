-- ============================================================
-- 20260601_transit_e7_fixes.sql
--
-- 1. Transit Vize — meslek paketi kuralları eklendi
-- 2. Transit Vize — uçak bileti duplicate: get_visa_documents()
--    Layer 1'e filtre B2 eklendi (Transit Vize'de "uçak" içeren
--    standart evrakı atla, country_specific'ten geliyor)
-- 3. E-7 isim hatası — Güney Kore dışındaki kayıtlar
--    'Çalışma/İş Vizesi' olarak düzeltildi
-- ============================================================


-- ── 1. Transit Vize meslek kuralları ─────────────────────────
DELETE FROM public.visa_package_rules
WHERE  visa_type = 'Transit Vize';

INSERT INTO public.visa_package_rules
  (visa_type, occupation, package_name, priority)
VALUES
  ('Transit Vize', 'calisan',        'calisan',       1),
  ('Transit Vize', 'sirket_sahibi',  'sirket_sahibi', 1),
  ('Transit Vize', 'serbest_meslek', 'sirket_sahibi', 1),
  ('Transit Vize', 'emekli',         'emekli',        1),
  ('Transit Vize', 'calismiyor',     'ev_hanimi',     1),
  ('Transit Vize', 'ev_hanimi',      'ev_hanimi',     1),
  ('Transit Vize', 'ogrenci',        'ev_hanimi',     1);


-- ── 3. E-7 isim hatası ───────────────────────────────────────
-- Güney Kore'nin E-7 vizesi olduğu gibi kalır;
-- diğer ülkelerdeki yanlış E-7 adlandırmaları düzeltilir.

UPDATE public.country_specific_docs
SET    visa_type = 'Çalışma/İş Vizesi'
WHERE  visa_type LIKE '%E-7%'
  AND  (country IS NULL OR country != 'Güney Kore');

UPDATE public.visa_package_rules
SET    visa_type = 'Çalışma/İş Vizesi'
WHERE  visa_type LIKE '%E-7%'
  AND  (country IS NULL OR country != 'Güney Kore');


-- ── 2. get_visa_documents() — Transit Vize uçak bileti fix ───
-- + Önceki sağlık sigortası duplicate fix korunuyor
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
  -- Yetki kontrolü
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

  -- ── Kural tablosundan paket adını bul ────────────────────────
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
  -- Filtre A: Schengen dışı ülkelerde "min. 30.000 €" sigortası
  -- Filtre B: country_specific'te sağlık sigortası varsa standart'ı atla
  -- Filtre C: Transit Vize'de "uçak" içeren standart evrakı atla
  --           (country_specific'te "Bağlantı uçuşu rezervasyonu" var)
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (
           -- Filtre A
           p_country = ANY(non_schengen)
           AND doc_name ILIKE '%30.000 €%'
         )
    AND  NOT (
           -- Filtre B: country_specific'te bu vize+ülke için sigorta varsa atla
           doc_name ILIKE '%sağlık sigortası%'
           AND EXISTS (
             SELECT 1
             FROM   public.country_specific_docs csd
             WHERE  (csd.country IS NULL OR csd.country = p_country)
               AND  (csd.visa_type IS NULL OR csd.visa_type = p_visa_type)
               AND  csd.doc_name ILIKE '%sağlık sigortası%'
           )
         )
    AND  NOT (
           -- Filtre C: Transit Vize'de gidiş-dönüş uçak bileti standart'tan gelmesin
           -- (country_specific'teki "Bağlantı uçuşu rezervasyonu" daha doğru)
           p_visa_type = 'Transit Vize'
           AND doc_name ILIKE '%uçak%'
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

  -- ── Layer 3: Ülkeye özgü + tüm ülkeler için geçerli evraklar ──
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    AND  NOT (
           visa_type IS NULL
           AND (doc_name ILIKE '%başvuru formu%' OR doc_name ILIKE '%vize formu%')
           AND EXISTS (
             SELECT 1
             FROM   public.country_specific_docs sub
             WHERE  (sub.country IS NULL OR sub.country = p_country)
               AND  sub.visa_type = p_visa_type
               AND  (sub.doc_name ILIKE '%başvuru formu%' OR sub.doc_name ILIKE '%vize formu%')
           )
         )
  ORDER BY
    CASE WHEN country   = p_country THEN 0 ELSE 1 END,
    CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
    order_num;

  -- ── Dedup: son eklenen (Layer 3) kazanır ───────────────────
  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
    AND  id NOT IN (
           SELECT DISTINCT ON (doc_name) id
           FROM   public.user_submitted_docs
           WHERE  application_id = p_application_id
           ORDER  BY doc_name, id DESC
         );

  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
