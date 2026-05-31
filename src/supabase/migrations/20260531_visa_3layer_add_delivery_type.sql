-- ============================================================
-- 20260531_visa_3layer_add_delivery_type.sql
-- user_submitted_docs'a delivery_type kolonu ekle
-- applications'a occupation kolonu ekle
-- get_visa_documents fonksiyonunu delivery_type dahil edecek şekilde güncelle
-- ============================================================

ALTER TABLE public.user_submitted_docs
  ADD COLUMN IF NOT EXISTS delivery_type text
  CHECK (delivery_type IN ('digital', 'physical', 'firma')) DEFAULT 'digital';

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS occupation text;

-- get_visa_documents: delivery_type artık kaynaklardan taşınıyor
CREATE OR REPLACE FUNCTION public.get_visa_documents(
  p_application_id uuid,
  p_country        text,
  p_visa_type      text,
  p_occupation     text DEFAULT NULL
)
RETURNS SETOF public.user_submitted_docs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   public.applications a
    JOIN   public.users u ON u.company_id = a.company_id
    WHERE  a.id = p_application_id
      AND  u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Erişim reddedildi: başvuru firmanıza ait değil';
  END IF;

  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id;

  -- Layer 1: Standart evraklar
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  ORDER  BY order_num;

  -- Layer 2: Mesleğe göre evraklar
  IF p_occupation IS NOT NULL THEN
    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = p_occupation
    ORDER  BY order_num;
  END IF;

  -- Layer 3: Ülkeye özgü evraklar
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  country = p_country
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
  ORDER  BY order_num;

  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
