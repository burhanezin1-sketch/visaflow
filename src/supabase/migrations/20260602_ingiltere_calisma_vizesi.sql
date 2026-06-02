-- ============================================================
-- 20260602_ingiltere_calisma_vizesi.sql
--
-- 1. İngiltere + Çalışma/İş Vizesi: country_specific_docs tam sıfırla
-- 2. Doğru evrak listesini ekle (CoS, GOV.UK formu, IELTS, IHS vb.)
-- 3. get_visa_documents(): İngiltere + Çalışma/İş Vizesi'nde
--    standart evraklardan yalnızca pasaport / kimlik / fotoğraf kalsın
-- ============================================================

-- ── 1 + 2. Evrak listesi sıfırla ve yeniden yükle ────────────
DELETE FROM public.country_specific_docs
WHERE  country   = 'İngiltere'
  AND  visa_type = 'Çalışma/İş Vizesi';

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('İngiltere', 'Çalışma/İş Vizesi', 'CoS (Certificate of Sponsorship) belgesi / referans numarası — İngiltere''deki işverenden', 'digital', 1),
  ('İngiltere', 'Çalışma/İş Vizesi', 'Ulusal (D Tipi) UK Work Visa başvuru formu (GOV.UK online)',                                   'firma',   2),
  ('İngiltere', 'Çalışma/İş Vizesi', 'İş sözleşmesi / iş teklif mektubu (İngiltere''deki işverenden)',                               'digital', 3),
  ('İngiltere', 'Çalışma/İş Vizesi', 'İngilizce dil yeterlilik belgesi (IELTS UKVI veya eşdeğeri — B1 min.)',                        'digital', 4),
  ('İngiltere', 'Çalışma/İş Vizesi', 'IHS (Immigration Health Surcharge) ödeme makbuzu',                                             'digital', 5),
  ('İngiltere', 'Çalışma/İş Vizesi', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı)',                                         'digital', 6),
  ('İngiltere', 'Çalışma/İş Vizesi', 'Diploma ve mesleki yeterlilik belgeleri (tercümeli)',                                           'digital', 7),
  ('İngiltere', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce)',                                                                    'digital', 8);


-- ── 3. get_visa_documents() güncelle ─────────────────────────
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
  -- Filtre A: Schengen dışı + "30.000 €" sigorta
  -- Filtre B: Transit Vize + uçak/bilet
  -- Filtre C: İngiltere + Çalışma/İş Vizesi → sadece pasaport/kimlik/fotoğraf
  --   (ikametgah, nüfus kayıt, sigorta, bilet, banka dökümü UK için
  --    country_specific_docs'tan geliyor)
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE
    NOT (p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%')
    AND NOT (p_visa_type = 'Transit Vize'
             AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%'))
    AND NOT (
      -- İngiltere Çalışma/İş Vizesi: pasaport + kimlik + fotoğraf dışındaki
      -- standart evraklar atlanır; gerisi country_specific_docs'tan gelir
      p_country   = 'İngiltere'
      AND p_visa_type = 'Çalışma/İş Vizesi'
      AND doc_name NOT ILIKE '%pasaport%'
      AND doc_name NOT ILIKE '%kimlik%'
      AND doc_name NOT ILIKE '%fotoğraf%'
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
