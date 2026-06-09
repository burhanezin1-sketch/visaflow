-- Eski evrak tablolarını temizle (visa_templates mimarisine geçildi)

TRUNCATE TABLE public.visa_doc_master;

DROP TABLE IF EXISTS public.standard_travel_docs_backup;
DROP TABLE IF EXISTS public.occupation_doc_packages_backup;
DROP TABLE IF EXISTS public.country_specific_docs_backup;
DROP TABLE IF EXISTS public.visa_package_rules_backup;
