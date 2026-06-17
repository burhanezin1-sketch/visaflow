ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#1e3a5f';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#2563eb';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS accent_color text;
