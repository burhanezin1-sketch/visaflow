-- ============================================================
-- 20260531_visa_3layer_fix_occupation_logic.sql
-- get_visa_documents() Layer 2 meslek mantığını vize tipine göre düzelt
--
-- Kural tablosu:
--
--  Vize tipi            Meslek           Paket(ler)
--  ───────────────────  ───────────────  ───────────────────────────────
--  Eğitim/Öğrenci       (hepsi)          ogrenci
--  Turistik /           calisan          calisan
--  Aile/Arkadaş         sirket_sahibi    sirket_sahibi
--  Ziyareti             emekli           emekli
--                       ev_hanimi        ev_hanimi
--                       ogrenci          ev_hanimi  (sponsor evrakları yeterli)
--  Ticari/İş            calisan          calisan + sirket_sahibi
--                       sirket_sahibi    sirket_sahibi
--                       diğerleri        ev_hanimi
--  Çalışma/İş Vizesi    (hepsi)          sirket_sahibi
--  Diğer / NULL         (meslek)         p_occupation olduğu gibi
-- ============================================================

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
  -- Yetki kontrolü
  IF NOT EXISTS (
    SELECT 1
    FROM   public.applications a
    JOIN   public.users u ON u.company_id = a.company_id
    WHERE  a.id = p_application_id
      AND  u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Erişim reddedildi: başvuru firmanıza ait değil';
  END IF;

  -- Önceki kayıtları temizle (idempotent)
  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id;

  -- ── Layer 1: Standart evraklar ────────────────────────────
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  ORDER  BY order_num;

  -- ── Layer 2: Vize tipine ve mesleğe göre evrak paketi ─────
  IF p_occupation IS NOT NULL THEN

    -- Vize tipine göre efektif meslek paketini belirle
    IF p_visa_type = 'Eğitim/Öğrenci' THEN
      v_occ := 'ogrenci';

    ELSIF p_visa_type IN ('Turistik', 'Aile/Arkadaş Ziyareti') THEN
      CASE p_occupation
        WHEN 'calisan'       THEN v_occ := 'calisan';
        WHEN 'sirket_sahibi' THEN v_occ := 'sirket_sahibi';
        WHEN 'emekli'        THEN v_occ := 'emekli';
        WHEN 'ev_hanimi'     THEN v_occ := 'ev_hanimi';
        WHEN 'ogrenci'       THEN v_occ := 'ev_hanimi';  -- kendi geliri yok, sponsor paketi
        ELSE                      v_occ := p_occupation;
      END CASE;

    ELSIF p_visa_type = 'Ticari/İş' THEN
      CASE p_occupation
        WHEN 'calisan'       THEN v_occ := 'calisan';  v_add_sirket := true;
        WHEN 'sirket_sahibi' THEN v_occ := 'sirket_sahibi';
        ELSE                      v_occ := 'ev_hanimi';
      END CASE;

    ELSIF p_visa_type = 'Çalışma/İş Vizesi' THEN
      v_occ := 'sirket_sahibi';

    ELSE
      -- Bilinmeyen vize tipi: mesleği olduğu gibi kullan
      v_occ := p_occupation;
    END IF;

    -- Birincil meslek paketini ekle
    IF v_occ IS NOT NULL THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      SELECT p_application_id, doc_name, delivery_type, 'pending'
      FROM   public.occupation_doc_packages
      WHERE  occupation = v_occ
      ORDER  BY order_num;
    END IF;

    -- Ticari/İş + çalışan: şirket evraklarını da ekle
    IF v_add_sirket THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      SELECT p_application_id, doc_name, delivery_type, 'pending'
      FROM   public.occupation_doc_packages
      WHERE  occupation = 'sirket_sahibi'
      ORDER  BY order_num;
    END IF;

  END IF;

  -- ── Layer 3: Ülkeye özgü evraklar ────────────────────────
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
