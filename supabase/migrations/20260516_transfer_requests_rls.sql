-- transfer_requests tablosu RLS ve yapısal düzeltmeler

-- Tablo yoksa oluştur
CREATE TABLE IF NOT EXISTS transfer_requests (
  id         UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID        REFERENCES companies(id) ON DELETE CASCADE,
  client_id  UUID        REFERENCES clients(id) ON DELETE CASCADE,
  from_user  UUID        REFERENCES users(id) ON DELETE SET NULL,
  to_user    UUID        REFERENCES users(id) ON DELETE SET NULL,
  note       TEXT,
  status     TEXT        NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CHECK constraint güncelle (eski varsa düşür)
ALTER TABLE transfer_requests
  DROP CONSTRAINT IF EXISTS transfer_requests_status_check;
ALTER TABLE transfer_requests
  ADD CONSTRAINT transfer_requests_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Performans için index
CREATE INDEX IF NOT EXISTS idx_transfer_requests_to_user_status
  ON transfer_requests (to_user, status);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_client_id
  ON transfer_requests (client_id);

-- RLS aç
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- Eski policy'leri temizle
DROP POLICY IF EXISTS "transfer_requests_select"  ON transfer_requests;
DROP POLICY IF EXISTS "transfer_requests_insert"  ON transfer_requests;
DROP POLICY IF EXISTS "transfer_requests_update"  ON transfer_requests;
DROP POLICY IF EXISTS "Users can see transfers they're involved in" ON transfer_requests;
DROP POLICY IF EXISTS "Users can create transfer requests"          ON transfer_requests;
DROP POLICY IF EXISTS "Users can update transfers they're involved in" ON transfer_requests;

-- SELECT: gönderen, alan veya aynı firmadaki herkes görebilir
CREATE POLICY "transfer_requests_select" ON transfer_requests
  FOR SELECT USING (
    from_user = auth.uid()
    OR to_user = auth.uid()
    OR company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- INSERT: kendi adına, kendi firması için oluşturabilir
CREATE POLICY "transfer_requests_insert" ON transfer_requests
  FOR INSERT WITH CHECK (
    from_user = auth.uid()
    AND company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- UPDATE: gönderen veya alan güncelleyebilir
CREATE POLICY "transfer_requests_update" ON transfer_requests
  FOR UPDATE USING (
    from_user = auth.uid()
    OR to_user = auth.uid()
  );
