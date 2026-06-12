CREATE TABLE IF NOT EXISTS nationality_surcharges (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nationality TEXT NOT NULL,
  surcharge_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, nationality)
);

ALTER TABLE nationality_surcharges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view surcharges"
  ON nationality_surcharges FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Company admins can manage surcharges"
  ON nationality_surcharges FOR ALL
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
