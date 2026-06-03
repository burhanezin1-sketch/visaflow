-- ============================================================
-- 20260603_almanya_sirket_override.sql
--
-- 1. country_specific_docs: Almanya genel (visa_type=NULL)
--    Ticaret sicil gazetesi — tercümesiz, Almanya'ya özel override
-- 2. country_specific_docs: Almanya + Turistik
--    Şirket antetli vize talep dilekçesi
-- ============================================================

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Almanya', NULL,       'Ticaret sicil gazetesi',                                                               'digital', 103),
  ('Almanya', 'Turistik', 'Şirket antetli kağıdına yazılmış vize talep dilekçesi (imzalı ve kaşeli)',            'digital', 201)
ON CONFLICT DO NOTHING;
