-- ============================================================
-- 20260602_visa_type_rename.sql
--
-- 1. 'Ticari/İş' → 'Ticari/İş Gezisi' birleştirmesi
--    (visa_package_rules, country_specific_docs, applications,
--     visa_documents eski tablo da güncelleniyor)
--
-- 2. E-7 vizesi: Güney Kore dışında 'Çalışma/İş Vizesi' yap
-- ============================================================

-- ── 1. Ticari/İş isim birleştirmesi ─────────────────────────
UPDATE public.visa_package_rules
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

UPDATE public.country_specific_docs
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

UPDATE public.applications
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

-- Eski visa_documents tablosunu da güncelle (visa-options API hâlâ ülke listesi için okuyor)
UPDATE public.visa_documents
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

-- ── 2. E-7 düzeltmesi (Güney Kore dışı) ─────────────────────
UPDATE public.country_specific_docs
SET    visa_type = 'Çalışma/İş Vizesi'
WHERE  visa_type ILIKE '%E-7%'
  AND  (country IS NULL OR country != 'Güney Kore');

UPDATE public.visa_package_rules
SET    visa_type = 'Çalışma/İş Vizesi'
WHERE  visa_type ILIKE '%E-7%'
  AND  (country IS NULL OR country != 'Güney Kore');

UPDATE public.applications
SET    visa_type = 'Çalışma/İş Vizesi'
WHERE  visa_type ILIKE '%E-7%'
  AND  country != 'Güney Kore';
