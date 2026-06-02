-- ============================================================
-- 20260602_ticari_davetiye_banka_dedup.sql
--
-- 1. Ticari/İş Gezisi: her ülkeye özel davetiye + genel fallback
--    Layer 3'e "davet" exclusion eklendi:
--    ülkeye özel davetiye varsa NULL-ülke genel davetiye atlanır.
--
-- 2. Banka dökümü semantic dedup:
--    DISTINCT ON (doc_name) exact match yerine dedup_key kullanılıyor:
--      "%şirket% + %banka%"  → 'sirket_banka::<id>'  (her satır benzersiz, silinmez)
--      "%banka%" (şirket yok) → 'sahsi_banka'         (hepsi bir, son=occupation kalır)
--      diğerleri              → doc_name               (exact match, önceki gibi)
-- ============================================================


-- ── 1a. Ülkeye özel Ticari/İş Gezisi davetiye ─────────────────
-- country_specific_docs'ta kayıtlı her ülke için: yoksa ekle
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
SELECT DISTINCT
  c.country,
  'Ticari/İş Gezisi',
  c.country || '''deki iş ortağından kaşeli/imzalı ticari davetiye',
  'digital',
  1
FROM public.country_specific_docs c
WHERE c.country IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.country_specific_docs x
    WHERE x.country   = c.country
      AND x.visa_type = 'Ticari/İş Gezisi'
      AND x.doc_name ILIKE '%davetiye%'
  );

-- ── 1b. Genel fallback (tüm ülkeler) ─────────────────────────
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
SELECT NULL, 'Ticari/İş Gezisi',
  'Yurt dışındaki iş ortağından kaşeli/imzalı ticari davetiye',
  'digital', 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.country_specific_docs x
  WHERE x.country   IS NULL
    AND x.visa_type  = 'Ticari/İş Gezisi'
    AND x.doc_name  ILIKE '%davetiye%'
);


-- ── 2. get_visa_documents() ───────────────────────────────────
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
  -- Filtre A: Schengen dışı + "30.000 €" sigorta
  -- Filtre B: country_specific'te bu vize için sigorta varsa atla
  -- Filtre C: Transit Vize'de uçak/bilet evrakı
  -- Filtre D: Meslek paketinde şahsi banka varsa standard banka'yı atla
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (
           p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%'
         )
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

  -- ── Layer 3: Ülkeye özgü + tüm ülkeler ──────────────────────
  -- Exclusion 1 (form): visa_type=NULL form; ülke+vize için özel form varsa atla
  -- Exclusion 2 (davet): country=NULL davetiye; ülkeye özel varsa genel atla
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    -- Exclusion 1: genel form → ülke+vize özel form varsa atla
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
    -- Exclusion 2: genel (NULL) davetiye → ülkeye özel davetiye varsa atla
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
  -- Dedup anahtarı (dedup_key):
  --   "%şirket% + %banka%" → benzersiz anahtar (her satır korunur)
  --   "%banka%" (şirket yok) → 'sahsi_banka' (tümü tek bucket; son eklenen = occupation kalır)
  --   diğerleri             → doc_name (exact match, önceki davranış)
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
             ORDER BY dedup_key, id DESC  -- son eklenen (Layer 3 > 2 > 1) kazanır
           ) kept
         );

  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
