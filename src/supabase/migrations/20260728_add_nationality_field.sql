-- Add nationality to visa_templates
ALTER TABLE visa_templates ADD COLUMN IF NOT EXISTS nationality text;
UPDATE visa_templates SET nationality = 'Türkiye Cumhuriyeti' WHERE nationality IS NULL;

-- Add nationality to applications (müşterinin uyruğu)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Türkiye Cumhuriyeti';
UPDATE applications SET nationality = 'Türkiye Cumhuriyeti' WHERE nationality IS NULL;
