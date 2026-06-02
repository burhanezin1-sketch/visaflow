-- ============================================================
-- 20260602_japonya_tedavi_seyahat_kimlik.sql
--
-- 1. country_specific_docs: Japonya + Tedavi/Sağlık Vizesi
--    order_num=7 Seyahat Programı Taslağı eklendi
-- 2. standard_travel_docs: 'Kimlik fotokopisi'
--    → 'Nüfus Cüzdanı (Kimlik) arkalı önlü fotokopisi'
-- ============================================================

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Japonya', 'Tedavi/Sağlık Vizesi',
   'Gün gün planlanmış resmi Japonya Seyahat Programı Taslağı (Schedule of Stay)',
   'digital', 7)
ON CONFLICT DO NOTHING;

UPDATE public.standard_travel_docs
SET    doc_name = 'Nüfus Cüzdanı (Kimlik) arkalı önlü fotokopisi'
WHERE  doc_name = 'Kimlik fotokopisi';
