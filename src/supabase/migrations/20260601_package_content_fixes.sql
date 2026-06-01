-- ============================================================
-- 20260601_package_content_fixes.sql
--
-- KURAL 1: emekli paketi — doğru evraklarla sıfırla
-- KURAL 2: sirket_sahibi paketi — sponsor temizle, doğru evraklar
-- KURAL 3: Resmi Vize — package_name='none', sponsor temizle
-- KURAL 4: Transit Vize — uçak bileti filtresi (fonksiyon güncelleme)
-- KURAL 5: Aile/Arkadaş Ziyareti davetiye evrakları (idempotent)
-- ============================================================


-- ── KURAL 1: emekli paketi ────────────────────────────────────
DELETE FROM public.occupation_doc_packages
WHERE  occupation = 'emekli';

INSERT INTO public.occupation_doc_packages
  (occupation, doc_name, delivery_type, order_num)
VALUES
  ('emekli', 'Emeklilik belgesi (e-devlet, barkodlu)',                                        'digital', 1),
  ('emekli', 'Emekli maaşının yattığı son 3 aylık banka hesap dökümü (banka kaşeli/imzalı)', 'digital', 2);


-- ── KURAL 2: sirket_sahibi paketi ─────────────────────────────
-- Mevcut tüm kayıtları temizle (eski isimler + olası sponsor varsa)
DELETE FROM public.occupation_doc_packages
WHERE  occupation = 'sirket_sahibi';

INSERT INTO public.occupation_doc_packages
  (occupation, doc_name, delivery_type, order_num)
VALUES
  ('sirket_sahibi', 'Vergi levhası (güncel, barkodlu)',                                       'digital', 101),
  ('sirket_sahibi', 'Şirket faaliyet belgesi (son 7 gün içinde alınmış, kaşeli/imzalı)',     'digital', 102),
  ('sirket_sahibi', 'Ticaret sicil gazetesi (tercümeli)',                                     'digital', 103),
  ('sirket_sahibi', 'İmza sirküleri (noter onaylı)',                                          'digital', 104),
  ('sirket_sahibi', 'Şirket banka hesap dökümü (son 3 ay, banka kaşeli/imzalı)',             'digital', 105);


-- ── KURAL 3: Resmi Vize ───────────────────────────────────────
UPDATE public.visa_package_rules
SET    package_name = 'none'
WHERE  visa_type = 'Resmi Vize';

DELETE FROM public.country_specific_docs
WHERE  visa_type = 'Resmi Vize'
  AND  (
         doc_name ILIKE '%sponsor%'
      OR doc_name ILIKE '%aile cüzdanı%'
      OR doc_name ILIKE '%nikah%'
      OR doc_name ILIKE '%akrabalık%'
       );


-- ── KURAL 5: Aile/Arkadaş Ziyareti davetiye evrakları ─────────
-- Yalnızca mevcut değilse ekle
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
SELECT NULL, 'Aile/Arkadaş Ziyareti', v.doc_name, v.delivery_type, v.order_num
FROM (VALUES
  ('Davet eden kişiden davet mektubu / resmi davetiye',                    'digital', 1),
  ('Davet eden kişinin pasaport / oturma izni fotokopisi',                 'digital', 2),
  ('Akrabalık ilişkisini gösteren belge (nüfus kayıt, nikah cüzdanı vb.)','digital', 3)
) AS v(doc_name, delivery_type, order_num)
WHERE NOT EXISTS (
  SELECT 1
  FROM   public.country_specific_docs x
  WHERE  x.country   IS NULL
    AND  x.visa_type  = 'Aile/Arkadaş Ziyareti'
    AND  x.doc_name   = v.doc_name
);


-- ── KURAL 4: get_visa_documents() — tüm filtreler aktif ───────
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
  -- Filtre A: Schengen dışı ülke + "30.000 €" sigorta
  -- Filtre B: country_specific'te bu vize için sigorta varsa standart'ı atla
  -- Filtre C: Transit Vize'de uçak/bilet içeren standart evrak gelmesin
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
