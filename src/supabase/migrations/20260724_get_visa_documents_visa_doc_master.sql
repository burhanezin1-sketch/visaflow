-- get_visa_documents() fonksiyonunu visa_doc_master mimarisine geçir

CREATE OR REPLACE FUNCTION public.get_visa_documents(
  p_application_id uuid,
  p_country        text,
  p_visa_type      text,
  p_occupation     text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM   public.applications a
    JOIN   public.users u ON u.company_id = a.company_id
    WHERE  a.id = p_application_id
      AND  u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Erişim reddedildi';
  END IF;

  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id;

  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.visa_doc_master
  WHERE  is_active = true
    AND  (include_countries   IS NULL OR p_country     = ANY(include_countries))
    AND  (exclude_countries   IS NULL OR p_country    != ALL(exclude_countries))
    AND  (include_visa_types  IS NULL OR p_visa_type   = ANY(include_visa_types))
    AND  (exclude_visa_types  IS NULL OR p_visa_type  != ALL(exclude_visa_types))
    AND  (include_occupations IS NULL OR p_occupation  = ANY(include_occupations))
    AND  (exclude_occupations IS NULL OR p_occupation != ALL(exclude_occupations))
  ORDER BY order_num;

  -- DEDUP: aynı doc_name, ctid küçük olan (ilk eklenen) kalır
  DELETE FROM public.user_submitted_docs a
  USING  public.user_submitted_docs b
  WHERE  a.application_id = p_application_id
    AND  b.application_id = p_application_id
    AND  a.doc_name = b.doc_name
    AND  a.ctid > b.ctid;
END;
$$;
