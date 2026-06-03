-- ============================================================
-- 20260603_applications_occupation_backfill.sql
--
-- Occupation alanı boş olan mevcut başvurulara 'calisan' ata.
-- Yeni başvurularda occupation form'dan geliyor (zaten doğru).
-- ============================================================

UPDATE public.applications
SET    occupation = 'calisan'
WHERE  occupation IS NULL;
