-- 1. Mevcut duplicate kayıtları temizle
-- Aynı telefon + company_id çiftinde birden fazla kayıt varsa
-- lexicografik olarak büyük UUID'liler silinir (daha küçük UUID tutulur)
DELETE FROM clients a
USING clients b
WHERE a.id > b.id
  AND a.phone = b.phone
  AND a.company_id = b.company_id
  AND a.phone IS NOT NULL
  AND a.phone != '';

-- 2. Telefon numarası dolu olan kayıtlar için unique constraint
-- NULL ve boş string'ler kapsam dışı (WHERE ile partial index)
-- PostgreSQL'de NULL != NULL olduğu için constraint bunu zaten atlar,
-- ama boş string '' için partial index gerekli
CREATE UNIQUE INDEX IF NOT EXISTS clients_phone_company_unique
  ON clients (phone, company_id)
  WHERE phone IS NOT NULL AND phone != '';
