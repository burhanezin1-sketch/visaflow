-- ============================================================
-- 20260601_visa_3layer_calisma_vizesi.sql
--
-- SORUN 1: Çalışma/İş Vizesinde meslek ne olursa olsun
--          sirket_sahibi paketi gelsin (ev_hanimi/sponsor YOK).
--
-- SORUN 2: Schengen ülkeleri + Çalışma/İş Vizesi için
--          "Schengen vize başvuru formu" yerine
--          "Ulusal (D Tipi) Vize Başvuru Formu" gelsin.
-- ============================================================

-- ── SORUN 2 — country_specific_docs düzeltmesi ───────────────

-- Schengen ülkeleri listesi
-- Adım 1: Çalışma/İş Vizesi için mevcut Schengen form kayıtlarını sil
DELETE FROM public.country_specific_docs
WHERE visa_type = 'Çalışma/İş Vizesi'
  AND doc_name ILIKE '%Schengen vize başvuru formu%'
  AND country IN (
    'Almanya','Fransa','İtalya','İspanya','Hollanda','Polonya',
    'Belçika','Avusturya','Yunanistan','Portekiz','İsveç','Danimarka',
    'Finlandiya','İsviçre','Çekya','Macaristan','Romanya','Bulgaristan',
    'Hırvatistan','Slovakya','Slovenya','Estonya','Letonya','Litvanya',
    'Malta','Lüksemburg'
  );

-- Adım 2: Aynı ülkeler için Ulusal D-Tipi formu ekle
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Almanya',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu (Videx — imzalı, 2 nüsha)', 'firma', 1),
  ('Fransa',     'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('İtalya',     'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('İspanya',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Hollanda',   'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Polonya',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Belçika',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Avusturya',  'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu (Kırmızı-Beyaz-Kırmızı Kart başvurusu)', 'firma', 1),
  ('Yunanistan', 'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Portekiz',   'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('İsveç',      'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Danimarka',  'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Finlandiya', 'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('İsviçre',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Çekya',      'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Macaristan', 'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Romanya',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Bulgaristan','Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Hırvatistan','Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Slovakya',   'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Slovenya',   'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Estonya',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Letonya',    'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Litvanya',   'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Malta',      'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1),
  ('Lüksemburg', 'Çalışma/İş Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu', 'firma', 1);

-- ── SORUN 1 + 2 — get_visa_documents() güncel versiyon ───────

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
  -- Schengen dışı ülkelerde "min. 30.000 €" sigortası atlanır;
  -- o ülkelere ait sigorta country_specific_docs'tan gelir.
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
  -- Kural tablosu:
  --
  --  Vize tipi              Meslek              Paket
  --  ─────────────────────  ──────────────────  ────────────────
  --  Eğitim/Öğrenci         (hepsi)             ogrenci
  --  Çalışma/İş Vizesi      (hepsi)             sirket_sahibi
  --    → Çalışma vizesinde her zaman işveren evrakları gelir;
  --      meslek calisan/calismiyor/ogrenci olsa bile geçerli.
  --  Diğer vizeler:
  --    calisan                                   calisan
  --    sirket_sahibi / serbest_meslek            sirket_sahibi
  --    emekli                                    emekli
  --    ogrenci / ev_hanimi / calismiyor /        ev_hanimi
  --    bilinmeyen
  --
  -- KESİN KURAL: 'sirket_sahibi' paketi yalnızca
  --   a) p_visa_type = 'Çalışma/İş Vizesi' (her meslekte), VEYA
  --   b) p_occupation IN ('sirket_sahibi','serbest_meslek')
  --   durumlarında eklenir. Başka hiçbir koşulda gelmez.

  IF p_occupation IS NOT NULL THEN
    IF p_visa_type = 'Eğitim/Öğrenci' THEN
      v_occ := 'ogrenci';

    ELSIF p_visa_type = 'Çalışma/İş Vizesi' THEN
      -- Meslek ne olursa olsun işveren/employer tarafı evrakları
      v_occ := 'sirket_sahibi';

    ELSIF p_occupation = 'calisan' THEN
      v_occ := 'calisan';

    ELSIF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
      v_occ := 'sirket_sahibi';

    ELSIF p_occupation = 'emekli' THEN
      v_occ := 'emekli';

    ELSE
      -- ogrenci (Eğitim/Öğrenci dışı), ev_hanimi, calismiyor,
      -- bilinmeyen → bağımlı / sponsor evrak paketi
      v_occ := 'ev_hanimi';
    END IF;

    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_occ
    ORDER  BY order_num;
  END IF;

  -- ── Layer 3: Ülkeye özgü evraklar ──────────────────────────
  -- Schengen ülkeleri + Çalışma/İş Vizesi → D-Tipi form
  -- (country_specific_docs'ta visa_type='Çalışma/İş Vizesi' kaydı
  --  önce, visa_type=NULL (genel Schengen formu) sonra gelir;
  --  dedup adımı genel formu sileceği için D-Tipi korunur)
  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  country = p_country
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
  ORDER  BY
    -- visa_type eşleşmesi önce gelsin; genel (NULL) kayıtlar sonra
    CASE WHEN visa_type = p_visa_type THEN 0 ELSE 1 END,
    order_num;

  -- ── Deduplicate ─────────────────────────────────────────────
  -- Aynı doc_name'den birden fazla varsa en düşük id (Layer 1
  -- öncelikli, ardından Layer 3'te spesifik visa_type kaydı)
  -- korunur, kopyalar silinir.
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
