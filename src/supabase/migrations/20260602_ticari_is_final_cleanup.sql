-- ============================================================
-- 20260602_ticari_is_final_cleanup.sql
-- 'Ticari/İş' → 'Ticari/İş Gezisi' kesin temizlik (idempotent)
--
-- Sorun: visa_documents (eski tablo) 257 satır 'Ticari/İş' içeriyor.
-- visa-options API artık bu tablodan vize türü okumuyor (son commit),
-- ama veritabanı tutarlılığı için hepsini güncelliyoruz.
-- ============================================================

-- visa_package_rules
UPDATE public.visa_package_rules
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

-- country_specific_docs
UPDATE public.country_specific_docs
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

-- applications (mevcut müşteri kayıtları)
UPDATE public.applications
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

-- visa_documents (eski şablon tablosu — 257 satır)
UPDATE public.visa_documents
SET    visa_type = 'Ticari/İş Gezisi'
WHERE  visa_type = 'Ticari/İş';

-- ── Doğrulama sorguları (çalıştırdıktan sonra kontrol) ───────
-- SELECT DISTINCT visa_type FROM public.visa_package_rules ORDER BY visa_type;
-- SELECT DISTINCT visa_type FROM public.country_specific_docs ORDER BY visa_type;
-- SELECT DISTINCT visa_type FROM public.visa_documents ORDER BY visa_type;
-- → Hiçbirinde 'Ticari/İş' çıkmamalı, sadece 'Ticari/İş Gezisi' olmalı.
