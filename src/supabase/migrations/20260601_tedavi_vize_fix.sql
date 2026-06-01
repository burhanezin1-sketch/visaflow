-- ============================================================
-- 20260601_tedavi_vize_fix.sql
--
-- 1. visa_package_rules: Tedavi/Sağlık Vizesi meslek bazlı kurallar
-- 2. sirket_sahibi paketi sponsor kontrolü (temiz — ek işlem yok)
-- 3. get_visa_documents(): Layer 1'de sağlık sigortası dedup fix
--    Sorun: standart "...min. 30.000 €..." ile country_specific
--    "Seyahat sağlık sigortası (min. 30.000 €)" farklı isimler →
--    DISTINCT ON yakalayamıyor, ikisi de listeye giriyor.
--    Çözüm: Layer 1 filtresi — country_specific'te aynı vize tipi
--    için sağlık sigortası varsa standart liste'yi atla.
-- ============================================================

-- ── 1. Tedavi/Sağlık Vizesi kuralları ───────────────────────
DELETE FROM public.visa_package_rules
WHERE  visa_type = 'Tedavi/Sağlık Vizesi';

INSERT INTO public.visa_package_rules
  (visa_type, occupation, package_name, priority)
VALUES
  ('Tedavi/Sağlık Vizesi', 'calisan',        'calisan',       1),
  ('Tedavi/Sağlık Vizesi', 'sirket_sahibi',  'sirket_sahibi', 1),
  ('Tedavi/Sağlık Vizesi', 'serbest_meslek', 'sirket_sahibi', 1),
  ('Tedavi/Sağlık Vizesi', 'emekli',         'emekli',        1),
  ('Tedavi/Sağlık Vizesi', 'calismiyor',     'ev_hanimi',     1),
  ('Tedavi/Sağlık Vizesi', 'ev_hanimi',      'ev_hanimi',     1),
  ('Tedavi/Sağlık Vizesi', 'ogrenci',        'ev_hanimi',     1);

-- ── 2. sirket_sahibi paketi — sponsor kontrolü ───────────────
-- Kontrol edildi: paket yalnızca şirket evraklarını içeriyor
-- (Şirket faaliyet belgesi, Vergi levhası, Ticaret sicil,
--  İmza sirküleri, Banka hesap dökümü — şirket hesabı)
-- Sponsor/aile cüzdanı/nikah evrakı bulunmuyor → ek işlem yok.

-- ── 3. get_visa_documents() — sağlık sigortası dedup fix ─────
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
  -- Filtre A: Schengen dışı ülkelerde "min. 30.000 €" sigortasını atla
  -- Filtre B: country_specific'te bu vize tipi için sağlık sigortası
  --           varsa standart sigortayı atla (isim farkından kaynaklanan
  --           duplicate'ı önler — DISTINCT ON isim eşleşmesi yapar,
  --           "Seyahat sağlık sigortası (...)" ≠ "...min. 30.000 €...")
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (
           -- Filtre A
           p_country = ANY(non_schengen)
           AND doc_name ILIKE '%30.000 €%'
         )
    AND  NOT (
           -- Filtre B: aynı vize tipi veya genel (NULL) country_specific
           -- sağlık sigortası kaydı varsa standart'ı ekleme
           doc_name ILIKE '%sağlık sigortası%'
           AND EXISTS (
             SELECT 1
             FROM   public.country_specific_docs csd
             WHERE  (csd.country IS NULL OR csd.country = p_country)
               AND  (csd.visa_type IS NULL OR csd.visa_type = p_visa_type)
               AND  csd.doc_name ILIKE '%sağlık sigortası%'
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
    CASE WHEN country   = p_country  THEN 0 ELSE 1 END,
    CASE WHEN visa_type IS NOT NULL  THEN 0 ELSE 1 END,
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
