-- ============================================================
-- 20260602_resmi_vize_banka_devlet_memuru.sql
--
-- 1. Resmi Vize duplicate banka dökümü fix:
--    country_specific_docs (country=NULL, visa_type='Resmi Vize')
--    banka satırı silindi — standard_travel_docs zaten kapsar
-- 2. visa_package_rules: Resmi Vize + devlet_memuru → 'none'
-- ============================================================

-- 1. Duplicate banka dökümü sil
DELETE FROM public.country_specific_docs
WHERE  country   IS NULL
  AND  visa_type = 'Resmi Vize'
  AND  doc_name  ILIKE '%banka%';

-- 2. devlet_memuru kuralı ekle
INSERT INTO public.visa_package_rules
  (visa_type, occupation, package_name, priority, is_active)
VALUES
  ('Resmi Vize', 'devlet_memuru', 'none', 1, true)
ON CONFLICT DO NOTHING;
