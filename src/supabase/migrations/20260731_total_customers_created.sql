-- Toplam oluşturulan müşteri sayacı (silinse bile azalmaz)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS total_customers_created integer DEFAULT 0;

-- Mevcut firmalar için backfill
UPDATE companies c
SET total_customers_created = (
  SELECT COUNT(*) FROM clients WHERE company_id = c.id
);

-- Trigger: yeni client eklenince counter +1 (silme azaltmaz)
CREATE OR REPLACE FUNCTION increment_total_customers()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies
  SET total_customers_created = total_customers_created + 1
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_increment_total_customers ON clients;
CREATE TRIGGER trg_increment_total_customers
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION increment_total_customers();
