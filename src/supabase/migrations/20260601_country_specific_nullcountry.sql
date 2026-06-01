-- ============================================================
-- 20260601_country_specific_nullcountry.sql
--
-- 1. country_specific_docs.country NOT NULL kısıtını kaldır
--    (NULL = tüm ülkeler için geçerli genel kayıt)
--
-- 2. Aile/Arkadaş Ziyareti için tüm ülkelerde geçerli davetiye evrakları ekle
--
-- 3. occupation_doc_packages: sirket_sahibi paketini order_num ile grupla
--
-- 4. get_visa_documents(): Layer 3 sorgusunu NULL ülke desteği için güncelle
-- ============================================================


-- ── 1. NOT NULL kısıtını kaldır ──────────────────────────────
ALTER TABLE public.country_specific_docs
  ALTER COLUMN country DROP NOT NULL;


-- ── 2. Aile/Arkadaş Ziyareti — tüm ülkeler için davetiye evrakları ──
-- Daha önce eklenmiş olabilir; idempotent silme + yeniden ekleme
DELETE FROM public.country_specific_docs
WHERE country IS NULL
  AND visa_type = 'Aile/Arkadaş Ziyareti'
  AND doc_name IN (
    'Davet eden kişiden davet mektubu / resmi davetiye',
    'Davet eden kişinin pasaport / oturma izni fotokopisi',
    'Akrabalık ilişkisini gösteren belge (nüfus kayıt, nikah cüzdanı vb.)'
  );

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  (NULL, 'Aile/Arkadaş Ziyareti', 'Davet eden kişiden davet mektubu / resmi davetiye',                   'digital', 1),
  (NULL, 'Aile/Arkadaş Ziyareti', 'Davet eden kişinin pasaport / oturma izni fotokopisi',                'digital', 2),
  (NULL, 'Aile/Arkadaş Ziyareti', 'Akrabalık ilişkisini gösteren belge (nüfus kayıt, nikah cüzdanı vb.)','digital', 3);


-- ── 3. sirket_sahibi paketi — order_num gruplandırması ────────
-- Şirket evrakları ardışık sırayla gelsin (101–105)
UPDATE public.occupation_doc_packages
  SET order_num = 101
WHERE occupation = 'sirket_sahibi' AND doc_name ILIKE '%Vergi levhası%';

UPDATE public.occupation_doc_packages
  SET order_num = 102
WHERE occupation = 'sirket_sahibi' AND doc_name ILIKE '%faaliyet belgesi%';

UPDATE public.occupation_doc_packages
  SET order_num = 103
WHERE occupation = 'sirket_sahibi' AND doc_name ILIKE '%Ticaret sicil%';

UPDATE public.occupation_doc_packages
  SET order_num = 104
WHERE occupation = 'sirket_sahibi' AND doc_name ILIKE '%İmza sirküleri%';

UPDATE public.occupation_doc_packages
  SET order_num = 105
WHERE occupation = 'sirket_sahibi' AND doc_name ILIKE '%banka hesap%';


-- ── 4. get_visa_documents() — Layer 3 NULL ülke desteği ──────
--
-- Değişiklik: Layer 3 sorgusu artık hem ülkeye özel (country = p_country)
-- hem de tüm ülkeler için geçerli (country IS NULL) kayıtları döndürür.
-- EXISTS form-exclusion kontrolü de buna göre güncellendi.

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

  -- Önceki kayıtları temizle (idempotent)
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
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (
    p_country = ANY(non_schengen)
    AND doc_name ILIKE '%30.000 €%'
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
  --
  -- country IS NULL  → tüm ülkeler için geçerli (ör. davetiye evrakları)
  -- country = p_country → sadece bu ülke için geçerli
  --
  -- Sıralama önceliği:
  --   1. ülke-özel + vize tipi-özel (country & visa_type eşleşir)
  --   2. ülke-özel + genel (country eşleşir, visa_type NULL)
  --   3. tüm ülkeler + vize tipi-özel (country NULL, visa_type eşleşir)
  --   4. tüm ülkeler + genel (country NULL, visa_type NULL)
  --
  -- Form kaydı (başvuru formu / vize formu): aynı ülke+vize için
  -- özel form varsa genel form atlanır.
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    AND  NOT (
           -- Genel (NULL) form kaydını özel form varsa atla
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
    -- ülke-özel önce, tüm-ülkeler sonra
    CASE WHEN country = p_country THEN 0 ELSE 1 END,
    -- vize tipi-özel önce, genel sonra
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
