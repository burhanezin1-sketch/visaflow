-- ============================================================
-- 20260601_visa_package_rules.sql
-- Kural motoru mimarisine geçiş
--
-- 1. visa_package_rules tablosu + RLS
-- 2. Tüm kuralları tabloya doldur
-- 3. get_visa_documents() yeniden yaz — if/else yok, tablo okuyor
--    Insert sırası: standart → meslek → ülke-özel
--    Dedup önceliği: ülke-özel (son eklenen) > meslek > standart
-- ============================================================


-- ── 1. TABLO ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.visa_package_rules (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  visa_type    text    NOT NULL,
  occupation   text,                   -- NULL = tüm meslekler için geçerli
  package_name text    NOT NULL,       -- 'none' | 'isveren_evraklari' | occupation_doc_packages.occupation
  country      text,                   -- NULL = tüm ülkeler için geçerli
  priority     integer DEFAULT 10,     -- düşük sayı = yüksek öncelik
  is_active    boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_vpr_lookup
  ON public.visa_package_rules (visa_type, occupation)
  WHERE is_active = true;

-- ── 2. RLS ───────────────────────────────────────────────────

ALTER TABLE public.visa_package_rules ENABLE ROW LEVEL SECURITY;

-- Authenticated herkes okuyabilir
CREATE POLICY "vpr_select"
  ON public.visa_package_rules FOR SELECT
  TO authenticated USING (true);

-- Yalnızca superadmin yazabilir
CREATE POLICY "vpr_insert"
  ON public.visa_package_rules FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "vpr_update"
  ON public.visa_package_rules FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "vpr_delete"
  ON public.visa_package_rules FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));


-- ── 3. KURALLAR ───────────────────────────────────────────────
-- Not: 'ev_hanimi' frontend'de kullanılan kod; 'calismiyor'
-- alternatif alias. Her ikisi de aynı pakete yönlendiriliyor.

DELETE FROM public.visa_package_rules;

INSERT INTO public.visa_package_rules (visa_type, occupation, package_name, priority) VALUES

-- ── Eğitim/Öğrenci ───────────────────────────────────────────
('Eğitim/Öğrenci',  NULL,           'ogrenci',          1),

-- ── Transit Vize — hiçbir meslek paketi eklenmez ─────────────
('Transit Vize',    NULL,           'none',             1),

-- ── Çalışma/İş Vizesi ────────────────────────────────────────
('Çalışma/İş Vizesi', 'sirket_sahibi',  'sirket_sahibi',    1),
('Çalışma/İş Vizesi', 'serbest_meslek', 'sirket_sahibi',    1),
('Çalışma/İş Vizesi', 'calisan',        'calisan',          1),
-- calismiyor/ev_hanimi/ogrenci/emekli: kişisel finansal evrak YOK
-- işveren evrakları country_specific_docs'tan gelir
('Çalışma/İş Vizesi', 'calismiyor',     'isveren_evraklari', 1),
('Çalışma/İş Vizesi', 'ev_hanimi',      'isveren_evraklari', 1),
('Çalışma/İş Vizesi', 'ogrenci',        'isveren_evraklari', 1),
('Çalışma/İş Vizesi', 'emekli',         'isveren_evraklari', 1),

-- ── Turistik ─────────────────────────────────────────────────
('Turistik', 'calisan',        'calisan',      1),
('Turistik', 'sirket_sahibi',  'sirket_sahibi',1),
('Turistik', 'serbest_meslek', 'sirket_sahibi',1),
('Turistik', 'emekli',         'emekli',       1),
('Turistik', 'calismiyor',     'ev_hanimi',    1),
('Turistik', 'ev_hanimi',      'ev_hanimi',    1),
('Turistik', 'ogrenci',        'ev_hanimi',    1),

-- ── Aile/Arkadaş Ziyareti ─────────────────────────────────────
('Aile/Arkadaş Ziyareti', 'calisan',        'calisan',      1),
('Aile/Arkadaş Ziyareti', 'sirket_sahibi',  'sirket_sahibi',1),
('Aile/Arkadaş Ziyareti', 'serbest_meslek', 'sirket_sahibi',1),
('Aile/Arkadaş Ziyareti', 'emekli',         'emekli',       1),
('Aile/Arkadaş Ziyareti', 'calismiyor',     'ev_hanimi',    1),
('Aile/Arkadaş Ziyareti', 'ev_hanimi',      'ev_hanimi',    1),
('Aile/Arkadaş Ziyareti', 'ogrenci',        'ev_hanimi',    1),

-- ── Ticari/İş Gezisi (+ Ticari/İş alias) ─────────────────────
('Ticari/İş Gezisi', 'calisan',        'calisan',      1),
('Ticari/İş Gezisi', 'sirket_sahibi',  'sirket_sahibi',1),
('Ticari/İş Gezisi', 'serbest_meslek', 'sirket_sahibi',1),
('Ticari/İş Gezisi', 'emekli',         'ev_hanimi',    1),
('Ticari/İş Gezisi', 'calismiyor',     'ev_hanimi',    1),
('Ticari/İş Gezisi', 'ev_hanimi',      'ev_hanimi',    1),
('Ticari/İş Gezisi', 'ogrenci',        'ev_hanimi',    1),
('Ticari/İş',        'calisan',        'calisan',      1),
('Ticari/İş',        'sirket_sahibi',  'sirket_sahibi',1),
('Ticari/İş',        'serbest_meslek', 'sirket_sahibi',1),
('Ticari/İş',        'emekli',         'ev_hanimi',    1),
('Ticari/İş',        'calismiyor',     'ev_hanimi',    1),
('Ticari/İş',        'ev_hanimi',      'ev_hanimi',    1),
('Ticari/İş',        'ogrenci',        'ev_hanimi',    1),

-- ── Özel Vize Tipleri ─────────────────────────────────────────
('Tedavi/Sağlık Vizesi', NULL, 'ev_hanimi', 1),
('Kültürel Vize',        NULL, 'ev_hanimi', 1),
('Resmi Vize',           NULL, 'ev_hanimi', 1),

-- ── Aile Birleşimi Vizesi ─────────────────────────────────────
('Aile Birleşimi Vizesi', 'calisan',        'calisan',      1),
('Aile Birleşimi Vizesi', 'sirket_sahibi',  'sirket_sahibi',1),
('Aile Birleşimi Vizesi', 'serbest_meslek', 'sirket_sahibi',1),
('Aile Birleşimi Vizesi', 'emekli',         'emekli',       1),
('Aile Birleşimi Vizesi', 'calismiyor',     'ev_hanimi',    1),
('Aile Birleşimi Vizesi', 'ev_hanimi',      'ev_hanimi',    1),
('Aile Birleşimi Vizesi', 'ogrenci',        'ev_hanimi',    1),
('Aile Birleşimi Vizesi', NULL,             'ev_hanimi',    2); -- fallback


-- ── 4. get_visa_documents() — TABLO TABANLI YENİ VERSİYON ────
--
-- Akış:
--   1. Kural tablosundan paket adını bul
--   2. Layer 1: standart evrakları ekle (Schengen dışı → €30.000 filtre)
--   3. Layer 2: meslek paketini ekle ('none'/'isveren_evraklari' → atla)
--   4. Layer 3: ülkeye özgü evrakları ekle (forma özel: genel formu atla)
--   5. Dedup: son eklenen (ülke-özel) kazanır → DELETE id NOT IN DISTINCT ON (doc_name) id DESC
--
-- Dedup önceliği: ülke-özel (Layer 3, yüksek id) > meslek (Layer 2) > standart (Layer 1)

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
  -- Öncelik: ülke-özel > genel, meslek-özel > NULL (fallback)
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
  -- Schengen dışı ülkelerde "min. 30.000 €" sigortasını atla
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (
    p_country = ANY(non_schengen)
    AND doc_name ILIKE '%30.000 €%'
  )
  ORDER BY order_num;

  -- ── Layer 2: Meslek paketi ──────────────────────────────────
  -- 'none' veya 'isveren_evraklari' → hiç ekleme
  IF v_package IS NOT NULL
     AND v_package NOT IN ('none', 'isveren_evraklari')
  THEN
    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_package
    ORDER  BY order_num;
  END IF;

  -- ── Layer 3: Ülkeye özgü evraklar ──────────────────────────
  -- Genel (NULL visa_type) form, aynı ülke+vize için özel form varsa atlanır
  -- → Almanya Çalışma vizesinde "Videx formu" değil "Ulusal D-Tipi Form" gelir
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  country = p_country
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    AND  NOT (
           visa_type IS NULL
           AND (doc_name ILIKE '%başvuru formu%' OR doc_name ILIKE '%vize formu%')
           AND EXISTS (
             SELECT 1
             FROM   public.country_specific_docs sub
             WHERE  sub.country   = p_country
               AND  sub.visa_type = p_visa_type
               AND  (sub.doc_name ILIKE '%başvuru formu%' OR sub.doc_name ILIKE '%vize formu%')
           )
         )
  ORDER BY
    CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
    order_num;

  -- ── Dedup: son eklenen (Layer 3 / ülke-özel) kazanır ───────
  -- ORDER BY id DESC → en yüksek id (son eklenen = Layer 3) tutulur
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
