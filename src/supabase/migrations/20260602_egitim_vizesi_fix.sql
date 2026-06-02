-- ============================================================
-- 20260602_egitim_vizesi_fix.sql
--
-- Eğitim/Öğrenci Vizesi meslek-paket mantığı:
--   Çalışan    → calisan paketi (maaş bordrosu, SGK, işveren yazısı)
--                + eğitim evrakları (Layer 3'ten kabul mektubu vb.)
--   Diğerleri  → ogrenci paketi (öğrenci belgesi, transkript)
--                priority=2 fallback olarak kalır
--
-- ogrenci paketinden sponsor/veli/aile cüzdanı evrakları temizlendi
-- → bu evraklar zaten ev_hanimi paketinde; öğrenci paketi
--   yalnızca akademik evrakları içermeli.
-- ============================================================

-- ── 1. Eğitim/Öğrenci + Çalışan → calisan paketi ─────────────
INSERT INTO public.visa_package_rules
  (visa_type, occupation, package_name, priority)
SELECT 'Eğitim/Öğrenci', 'calisan', 'calisan', 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.visa_package_rules
  WHERE visa_type  = 'Eğitim/Öğrenci'
    AND occupation = 'calisan'
);

-- Mevcut NULL kural → fallback olarak priority=2
UPDATE public.visa_package_rules
SET    priority = 2
WHERE  visa_type  = 'Eğitim/Öğrenci'
  AND  occupation IS NULL;


-- ── 2. Eğitim/Öğrenci kabul mektubu (tüm ülkeler) ────────────
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
SELECT NULL, 'Eğitim/Öğrenci',
  'Yurt dışındaki okuldan / üniversiteden resmi kabul mektubu (Letter of Acceptance)',
  'digital', 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.country_specific_docs
  WHERE  country   IS NULL
    AND  visa_type  = 'Eğitim/Öğrenci'
    AND  doc_name  ILIKE '%kabul mektubu%'
);


-- ── 3. ogrenci paketinden sponsor/veli/aile evraklarını temizle ─
-- Bu evraklar ev_hanimi paketine ait; ogrenci paketi yalnızca
-- akademik evrakları (öğrenci belgesi, transkript) içermeli.
DELETE FROM public.occupation_doc_packages
WHERE  occupation = 'ogrenci'
  AND  (
         doc_name ILIKE '%sponsor%'
      OR doc_name ILIKE '%veli%'
      OR doc_name ILIKE '%aile cüzdanı%'
       );
