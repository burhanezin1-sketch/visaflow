-- ============================================================
-- 20260531_visa_3layer_dedup_elden.sql
-- 1. user_submitted_docs.status constraint'ine 'elden' ekle
-- 2. get_visa_documents() sonunda doc_name tekrarlarını temizle
-- ============================================================

-- ── 1. Status constraint güncelle ────────────────────────────
DO $$
DECLARE
  v_con text;
BEGIN
  SELECT conname INTO v_con
  FROM   pg_constraint
  WHERE  conrelid = 'public.user_submitted_docs'::regclass
    AND  contype  = 'c'
    AND  conname  LIKE '%status%';

  IF v_con IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.user_submitted_docs DROP CONSTRAINT %I', v_con);
  END IF;
END;
$$;

ALTER TABLE public.user_submitted_docs
  ADD CONSTRAINT user_submitted_docs_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'elden'));

-- ── 2. get_visa_documents: son adımda doc_name deduplicate ───
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
DECLARE
  v_occ        text;
  v_add_sirket boolean := false;
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

  -- Layer 2: Vize tipine + mesleğe göre paket seçimi
  IF p_occupation IS NOT NULL THEN
    IF p_visa_type = 'Eğitim/Öğrenci' THEN
      v_occ := 'ogrenci';
    ELSIF p_visa_type IN ('Turistik', 'Aile/Arkadaş Ziyareti') THEN
      CASE p_occupation
        WHEN 'calisan'       THEN v_occ := 'calisan';
        WHEN 'sirket_sahibi' THEN v_occ := 'sirket_sahibi';
        WHEN 'emekli'        THEN v_occ := 'emekli';
        WHEN 'ev_hanimi'     THEN v_occ := 'ev_hanimi';
        WHEN 'ogrenci'       THEN v_occ := 'ev_hanimi';
        ELSE                      v_occ := p_occupation;
      END CASE;
    ELSIF p_visa_type = 'Ticari/İş' THEN
      CASE p_occupation
        WHEN 'calisan'       THEN v_occ := 'calisan'; v_add_sirket := true;
        WHEN 'sirket_sahibi' THEN v_occ := 'sirket_sahibi';
        ELSE                      v_occ := 'ev_hanimi';
      END CASE;
    ELSIF p_visa_type = 'Çalışma/İş Vizesi' THEN
      v_occ := 'sirket_sahibi';
    ELSE
      v_occ := p_occupation;
    END IF;

    IF v_occ IS NOT NULL THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      SELECT p_application_id, doc_name, delivery_type, 'pending'
      FROM   public.occupation_doc_packages
      WHERE  occupation = v_occ
      ORDER  BY order_num;
    END IF;

    IF v_add_sirket THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      SELECT p_application_id, doc_name, delivery_type, 'pending'
      FROM   public.occupation_doc_packages
      WHERE  occupation = 'sirket_sahibi'
      ORDER  BY order_num;
    END IF;
  END IF;

  -- Layer 3: Ülkeye özgü evraklar
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  country = p_country
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
  ORDER  BY order_num;

  -- Deduplicate: aynı doc_name'den birden fazla varsa en erken eklenenini tut
  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
    AND  id NOT IN (
      SELECT DISTINCT ON (doc_name) id
      FROM   public.user_submitted_docs
      WHERE  application_id = p_application_id
      ORDER  BY doc_name, id
    );

  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
