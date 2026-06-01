-- ============================================================
-- 20260601_visa_3layer_fixes.sql
-- 3 kritik düzeltme:
--
-- SORUN 1: Meslek paketi — sirket_sahibi yalnızca sirket_sahibi
--          mesleklisi için gelsin; v_add_sirket kaldırıldı.
--
-- SORUN 2: Schengen dışı ülkelerde (Amerika, Kanada, İngiltere,
--          Japonya, Güney Kore) "min. 30.000 €" sigortası
--          standard_travel_docs'tan filtreleniyor; bu ülkelere
--          country_specific_docs'ta genel sigorta eklendi.
--
-- SORUN 3: Dedup — her ekleme adımında aynı doc_name varsa ilk
--          eklenen (Layer 1 öncelikli) tutulur, fazlası silinir.
-- ============================================================

-- ── SORUN 2: Schengen dışı ülkeler için genel sigorta kaydı ──

DELETE FROM public.country_specific_docs
WHERE country IN (
  'Amerika Birleşik Devletleri', 'Kanada',
  'İngiltere', 'Japonya', 'Güney Kore'
)
AND doc_name ILIKE '%Seyahat sağlık sigortası%'
AND visa_type IS NULL;

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Amerika Birleşik Devletleri', NULL, 'Seyahat sağlık sigortası (ABD için geçerli poliçe)', 'digital', 10),
  ('Kanada',                      NULL, 'Seyahat sağlık sigortası (Kanada için geçerli poliçe)', 'digital', 10),
  ('İngiltere',                   NULL, 'Seyahat sağlık sigortası (İngiltere için geçerli poliçe)', 'digital', 10),
  ('Japonya',                     NULL, 'Seyahat sağlık sigortası (Japonya için geçerli poliçe)', 'digital', 10),
  ('Güney Kore',                  NULL, 'Seyahat sağlık sigortası (Güney Kore için geçerli poliçe)', 'digital', 10);

-- ── get_visa_documents() güncel versiyon ─────────────────────

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
  non_schengen CONSTANT text[] := ARRAY[
    'Amerika Birleşik Devletleri',
    'Kanada',
    'İngiltere',
    'Japonya',
    'Güney Kore'
  ];
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

  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id;

  -- ── Layer 1: Standart evraklar ──────────────────────────────
  -- Schengen dışı ülkeler için "min. 30.000 €" sigortasını atla;
  -- o ülkelere ait sigorta country_specific_docs'tan gelecek.
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE  NOT (
           p_country = ANY(non_schengen)
           AND doc_name ILIKE '%30.000 €%'
         )
  ORDER  BY order_num;

  -- ── Layer 2: Mesleğe göre evrak paketi ─────────────────────
  --
  -- Basitleştirilmiş kural tablosu:
  --   Eğitim/Öğrenci vizesi  → her zaman ogrenci paketi
  --   Diğer vizeler:
  --     calisan               → calisan
  --     sirket_sahibi         → sirket_sahibi
  --     serbest_meslek        → sirket_sahibi
  --     ogrenci               → ev_hanimi (kendi geliri yok, sponsor)
  --     emekli                → emekli
  --     ev_hanimi / calismiyor → ev_hanimi
  --     bilinmeyen / NULL     → ev_hanimi (güvenli varsayılan)
  --
  -- NOT: 'sirket_sahibi' paketi, meslek 'sirket_sahibi' veya
  -- 'serbest_meslek' olmadıkça HİÇBİR ŞEKİLDE eklenmez.

  IF p_occupation IS NOT NULL THEN
    IF p_visa_type = 'Eğitim/Öğrenci' THEN
      v_occ := 'ogrenci';

    ELSIF p_occupation = 'calisan' THEN
      v_occ := 'calisan';

    ELSIF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
      v_occ := 'sirket_sahibi';

    ELSIF p_occupation = 'emekli' THEN
      v_occ := 'emekli';

    ELSE
      -- ogrenci (Eğitim/Öğrenci dışı), ev_hanimi, calismiyor,
      -- bilinmeyen → sponsor / bağımlı evrak paketi
      v_occ := 'ev_hanimi';
    END IF;

    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_occ
    ORDER  BY order_num;
  END IF;

  -- ── Layer 3: Ülkeye özgü evraklar ──────────────────────────
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  country = p_country
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
  ORDER  BY order_num;

  -- ── Deduplicate: aynı doc_name'den birden fazla varsa ───────
  -- İlk eklenen (en düşük id = Layer 1 öncelikli) saklanır.
  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
    AND  id NOT IN (
           SELECT DISTINCT ON (doc_name) id
           FROM   public.user_submitted_docs
           WHERE  application_id = p_application_id
           ORDER  BY doc_name, id ASC
         );

  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
