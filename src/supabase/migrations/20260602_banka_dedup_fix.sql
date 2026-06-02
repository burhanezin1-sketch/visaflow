-- ============================================================
-- 20260602_banka_dedup_fix.sql
--
-- "Banka hesap dökümü" duplicate sorunu:
--
-- Sorun: Meslek paketindeki banka dökümü ile standard_travel_docs'taki
-- banka dökümü farklı doc_name'e sahip → DISTINCT ON yakalayamıyor.
--   Örnek: emekli paketi  → "Emekli maaşının yattığı son 3 aylık banka dökümü"
--          standard       → "Son 3 aylık banka hesap dökümü (...)"
-- Her ikisi de farklı isim, her ikisi de listeye giriyor = duplicate.
--
-- Çözüm — Filtre D (Layer 1):
--   Meslek paketinde "banka" içeren VE "şirket" İÇERMEYEN bir evrak
--   varsa (= şahsi/kişisel banka dökümü), standard_travel_docs'tan
--   "banka hesap" içeren evrakı ekleme.
--
-- Neden şirket istisnası?
--   sirket_sahibi paketi → "Şirket banka hesap dökümü" (şirket hesabı)
--   standard             → "Son 3 aylık banka hesap dökümü" (kişisel)
--   Bu ikisi FARKLI belgeler; sirket_sahibi için her ikisi de gelmeli.
--   Filter D'deki "NOT ILIKE '%şirket%'" koşulu bunu korur.
--
-- Sonuç:
--   emekli    → emekli paketi bankası gelir, standard atlanır       ✓
--   ev_hanimi → sponsor banka gelir, standard atlanır               ✓
--   sirket_sahibi → şirket bankası (paket) + kişisel (standard)    ✓
--   calisan   → kişisel (standard, paket banka yok)                 ✓
-- ============================================================

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
  -- Filtre D: Meslek paketinde şahsi banka dökümü varsa standard'ı atla
  --           (şirket bankası içeren paketlerde standard kişisel banka KALIR)
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (
           -- Filtre A
           p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%'
         )
    AND  NOT (
           -- Filtre B: country_specific'te bu vize+ülke için sigorta varsa atla
           doc_name ILIKE '%sağlık sigortası%'
           AND EXISTS (
             SELECT 1 FROM public.country_specific_docs csd
             WHERE  (csd.country IS NULL OR csd.country = p_country)
               AND  (csd.visa_type IS NULL OR csd.visa_type = p_visa_type)
               AND  csd.doc_name ILIKE '%sağlık sigortası%'
           )
         )
    AND  NOT (
           -- Filtre C: Transit Vize'de gidiş-dönüş uçak bileti gelmesin
           p_visa_type = 'Transit Vize'
           AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%')
         )
    AND  NOT (
           -- Filtre D: Meslek paketinde şahsi banka dökümü varsa standard'ı atla
           -- "şirket" bankası olan paketlerde (sirket_sahibi) bu filtre devreye GİRMEZ;
           -- hem kişisel (standard) hem şirket (paket) birlikte gelir.
           doc_name ILIKE '%banka hesap%'
           AND NOT doc_name ILIKE '%şirket%'
           AND v_package IS NOT NULL
           AND v_package NOT IN ('none', 'isveren_evraklari')
           AND EXISTS (
             SELECT 1 FROM public.occupation_doc_packages odp
             WHERE  odp.occupation = v_package
               AND  odp.doc_name  ILIKE '%banka%'
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
