ALTER TABLE user_submitted_docs ADD COLUMN IF NOT EXISTS marked_physical_at timestamptz;
ALTER TABLE user_submitted_docs ADD COLUMN IF NOT EXISTS physical_delivery_confirmed boolean DEFAULT false;
ALTER TABLE user_submitted_docs ADD COLUMN IF NOT EXISTS physical_delivery_confirmed_at timestamptz;
ALTER TABLE user_submitted_docs ADD COLUMN IF NOT EXISTS physical_delivery_confirmed_by uuid REFERENCES users(id);

-- Mevcut fiziksel evraklar için marked_physical_at = created_at
UPDATE user_submitted_docs
SET marked_physical_at = created_at
WHERE delivery_type = 'physical' AND marked_physical_at IS NULL;

-- Yeni insert'lerde otomatik set et
CREATE OR REPLACE FUNCTION set_marked_physical_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivery_type = 'physical' AND NEW.marked_physical_at IS NULL THEN
    NEW.marked_physical_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_marked_physical_at ON user_submitted_docs;
CREATE TRIGGER trg_set_marked_physical_at
BEFORE INSERT ON user_submitted_docs
FOR EACH ROW EXECUTE FUNCTION set_marked_physical_at();
