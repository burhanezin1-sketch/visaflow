-- ============================================================
-- 20260602_amerika_transit_vize_excl.sql
--
-- 1. country_specific_docs: Amerika + Transit Vize temizlik
--    "Varış ülkesi vizesi veya uçuş bileti" (yanlış isim) silinir;
--    doğru evraklar zaten country=NULL Transit Vize satırlarında mevcut.
-- 2. visa_package_rules: Amerika + Transit Vize + calisan →
--    'calisan' paketi (SGK, bordro, işveren izni)
-- 3. get_visa_documents(): Amerika + Transit Vize exclusion array
--    tüm 3 katmana eklendi (usa_transit_excl CONSTANT)
-- ============================================================


-- ── 1. country_specific_docs temizlik ────────────────────────
DELETE FROM public.country_specific_docs
WHERE  country   = 'Amerika Birleşik Devletleri'
  AND  visa_type = 'Transit Vize'
  AND  doc_name NOT IN (
         'DS-160 başvuru formu (C-1 Transit Vize — online)',
         'Vize ücreti ödeme makbuzu',
         'Varış ülkesi için geçerli vize veya oturma izni',
         'Bağlantı uçuşu rezervasyonu — giriş ve çıkış biletleri'
       );


-- ── 2. visa_package_rules: Amerika + Transit Vize + calisan ──
INSERT INTO public.visa_package_rules
  (visa_type, country, occupation, package_name, priority, is_active)
VALUES
  ('Transit Vize', 'Amerika Birleşik Devletleri', 'calisan', 'calisan', 0, true)
ON CONFLICT DO NOTHING;


-- ── 3. get_visa_documents() güncelleme ───────────────────────
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
    'Seyahat sağlık sigortası',
    'Gidiş-dönüş uçak bileti rezervasyonu'
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
    -- Filtre A: Schengen dışı + "30.000 €" sigorta
    NOT (p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%')
    -- Filtre B: Transit Vize + uçak/bilet
    AND NOT (p_visa_type = 'Transit Vize'
             AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%'))
    -- Filtre C: İngiltere + Çalışma/İş Vizesi → sadece pasaport/kimlik/fotoğraf
    AND NOT (
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND doc_name NOT ILIKE '%pasaport%'
      AND doc_name NOT ILIKE '%kimlik%'
      AND doc_name NOT ILIKE '%fotoğraf%'
    )
    -- Filtre C-ext: İngiltere + Çalışma/İş Vizesi → ILIKE blacklist
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
    -- Filtre C-hard: İngiltere + Çalışma/İş Vizesi → exact exclusion
    AND NOT (
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND doc_name = ANY(uk_calisma_excl)
    )
    -- Filtre D: Amerika + Transit Vize → exact exclusion
    AND NOT (
      p_country   = 'Amerika Birleşik Devletleri'
      AND p_visa_type = 'Transit Vize'
      AND doc_name = ANY(usa_transit_excl)
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
      -- İngiltere + Çalışma/İş Vizesi: ILIKE + exact blacklist
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
      -- Amerika + Transit Vize: exact exclusion
      AND NOT (
        p_country   = 'Amerika Birleşik Devletleri'
        AND p_visa_type = 'Transit Vize'
        AND doc_name = ANY(usa_transit_excl)
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
    -- İngiltere + Çalışma/İş Vizesi exact exclusion
    AND NOT (
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND doc_name = ANY(uk_calisma_excl)
    )
    -- Amerika + Transit Vize exact exclusion
    AND NOT (
      p_country   = 'Amerika Birleşik Devletleri'
      AND p_visa_type = 'Transit Vize'
      AND doc_name = ANY(usa_transit_excl)
    )
  ORDER BY
    CASE WHEN country   = p_country THEN 0 ELSE 1 END,
    CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
    order_num;


  -- ══════════════════════════════════════════════════════════
  -- DEDUP: exact doc_name, son eklenen (Layer 3) kazanır
  -- ══════════════════════════════════════════════════════════
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
