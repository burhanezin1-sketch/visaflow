-- get_visa_documents() fonksiyonunu visa_doc_master yerine visa_templates kullanacak şekilde güncelle

CREATE OR REPLACE FUNCTION public.get_visa_documents(
  p_application_id uuid,
  p_country text,
  p_visa_type text,
  p_occupation text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_docs jsonb;
  v_company_id uuid;
BEGIN
  SELECT company_id INTO v_company_id
  FROM applications WHERE id = p_application_id;

  -- Önce firma şablonu ara
  SELECT docs INTO v_docs
  FROM visa_templates
  WHERE LOWER(country) = LOWER(p_country)
    AND LOWER(visa_type) = LOWER(p_visa_type)
    AND LOWER(occupation) = LOWER(COALESCE(p_occupation, ''))
    AND company_id = v_company_id
    AND status = 'approved'
  LIMIT 1;

  -- Yoksa global şablon ara
  IF v_docs IS NULL THEN
    SELECT docs INTO v_docs
    FROM visa_templates
    WHERE LOWER(country) = LOWER(p_country)
      AND LOWER(visa_type) = LOWER(p_visa_type)
      AND LOWER(occupation) = LOWER(COALESCE(p_occupation, ''))
      AND is_global = true
      AND status = 'approved'
    LIMIT 1;
  END IF;

  -- Şablon bulunduysa evrakları yaz
  IF v_docs IS NOT NULL THEN
    DELETE FROM user_submitted_docs WHERE application_id = p_application_id;

    INSERT INTO user_submitted_docs (application_id, doc_name, delivery_type, description, status)
    SELECT
      p_application_id,
      (doc->>'doc_name'),
      (doc->>'delivery_type'),
      (doc->>'description'),
      'pending'
    FROM jsonb_array_elements(v_docs) AS doc;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
