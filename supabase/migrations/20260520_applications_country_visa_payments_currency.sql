ALTER TABLE applications ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS visa_type text;

ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency text DEFAULT 'TRY';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes text;
