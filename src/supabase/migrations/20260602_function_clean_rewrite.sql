-- ============================================================
-- 20260602_function_clean_rewrite.sql
-- get_visa_documents() temiz 3-katmanlı yeniden yazım
--
-- KATMAN 1 → standard_travel_docs  (en düşük öncelik)
-- KATMAN 2 → occupation_doc_packages
-- KATMAN 3 → country_specific_docs (en yüksek öncelik)
--
-- Dedup: DISTINCT ON (doc_name) ORDER BY doc_name, id DESC
--   Son eklenen (Layer 3, yüksek id) kazanır.
--   Aynı doc_name = exact match dedup; farklı isimler ayrı kalır.
--   "Şirket banka" ≠ "şahsi banka" → her ikisi de korunur.
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

  -- ── Kural tablosundan meslek paketi ──────────────────────────
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
    -- Schengen dışı ülkeler için "30.000 €" sigortayı atla
    NOT (p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%')
    -- Transit Vize için gidiş-dönüş uçak bileti evrakını atla
    AND NOT (p_visa_type = 'Transit Vize'
             AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%'))
  ORDER BY order_num;


  -- ══════════════════════════════════════════════════════════
  -- KATMAN 2: Meslek paketi
  -- ══════════════════════════════════════════════════════════
  -- 'none' veya 'isveren_evraklari' ise Layer 2 tamamen atlanır
  IF v_package IS NOT NULL
     AND v_package NOT IN ('none', 'isveren_evraklari')
  THEN
    INSERT INTO public.user_submitted_docs
      (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_package
      -- sirket_sahibi paketinde sponsor evrakları kesinlikle gelmesin
      AND NOT (v_package = 'sirket_sahibi'
               AND (doc_name ILIKE '%sponsor%' OR doc_name ILIKE '%taahhütname%'))
    ORDER  BY order_num;
  END IF;

  -- Öğrenci belgesi her zaman: occupation='ogrenci' ise
  -- hangi paket seçilmiş olursa olsun Öğrenci belgesi eklenir.
  -- (Eğitim/Öğrenci → tam paket; diğerleri → ev_hanimi + öğrenci belgesi)
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
  -- ══════════════════════════════════════════════════════════
  -- Sıralama: ülkeye özel (country=p_country) > genel (country IS NULL)
  --           vize tipine özel (visa_type=p_visa_type) > genel (visa_type IS NULL)
  --           order_num (Ticari davetiye order_num=1 → grup içinde ilk)
  --
  -- Form exclusion: genel (NULL visa_type) form varken aynı ülke+vize
  -- için özel form da varsa, genel formu ekleme.
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    -- Form exclusion: genel başvuru formu, spesifik form varsa atla
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
    -- Davetiye exclusion: genel davetiye, ülkeye özel davetiye varsa atla
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
  -- DEDUP: exact doc_name, son eklenen (Layer 3) kazanır
  -- ══════════════════════════════════════════════════════════
  -- "Şirket banka hesap dökümü" ≠ "Son 3 aylık banka hesap dökümü"
  -- → farklı isimler, ikisi de korunur (birebir eşleşme yok)
  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
    AND  id NOT IN (
           SELECT DISTINCT ON (doc_name) id
           FROM   public.user_submitted_docs
           WHERE  application_id = p_application_id
           ORDER  BY doc_name, id DESC   -- yüksek id = son eklenen = Layer 3 öncelikli
         );

  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
