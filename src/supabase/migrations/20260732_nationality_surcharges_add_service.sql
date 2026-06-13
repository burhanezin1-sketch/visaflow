-- Uyruk ek ücretlerine hizmet bazlı alan ekleme
ALTER TABLE nationality_surcharges ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE nationality_surcharges ADD COLUMN IF NOT EXISTS visa_type text;

-- Eski unique constraint'i kaldır
ALTER TABLE nationality_surcharges
  DROP CONSTRAINT IF EXISTS nationality_surcharges_company_id_nationality_key;

-- Yeni unique: aynı firma için aynı hizmet+uyruk kombinasyonu tek olmalı
ALTER TABLE nationality_surcharges
  ADD CONSTRAINT nationality_surcharges_unique
  UNIQUE(company_id, nationality, country, visa_type);
