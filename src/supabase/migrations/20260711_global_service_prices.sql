-- Global hizmet fiyatları — superadmin yönetir, danışmanlar görüntüler
CREATE TABLE IF NOT EXISTS global_service_prices (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name text        NOT NULL,
  price        numeric     NOT NULL,
  currency     text        DEFAULT 'TL' CHECK (currency IN ('TL', 'EUR')),
  nationality  text        DEFAULT 'Türkiye Cumhuriyeti',
  description  text,
  is_active    boolean     DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE global_service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_all_gsp" ON global_service_prices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "authenticated_read_gsp" ON global_service_prices
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
