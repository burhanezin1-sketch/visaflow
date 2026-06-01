-- ============================================================
-- 20260601_visa_3layer_complete_rewrite.sql
-- get_visa_documents() tam yeniden yazım
--
-- Değişiklikler:
--   • Tüm vize tipi / meslek kombinasyonları kesin kurallara bağlandı
--   • Çalışma vizesinde calismiyor/ogrenci/emekli → meslek paketi YOK
--   • Sponsor evrakları Çalışma/İş Vizesinde KESİNLİKLE gelmez
--   • 3 katman tek INSERT'ta birleştirildi (CTE + DISTINCT ON)
--   • Dedup önceliği: country_specific(1) > occupation(2) > standard(3)
--   • Schengen dışı ülkelerde "min. 30.000 €" standarddan filtrelenir
--   • Çalışma vizesinde genel form (NULL) spesifik form (D-Tipi) varsa gelmez
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
  -- Meslek paketi kodu; NULL = Layer 2 hiç eklenmez
  v_occ text := NULL;

  -- Schengen dışı ülkeler: standard'daki "min. 30.000 €" sigortası bu ülkeler için atlanır
  non_schengen CONSTANT text[] := ARRAY[
    'Amerika Birleşik Devletleri',
    'Kanada',
    'İngiltere',
    'Japonya',
    'Güney Kore'
  ];
BEGIN
  -- ── Yetki kontrolü ─────────────────────────────────────────
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

  -- ── Meslek paketi (v_occ) belirleme ────────────────────────
  --
  --  Vize tipi               Meslek                 v_occ
  --  ──────────────────────  ─────────────────────  ─────────────
  --  Eğitim/Öğrenci          (hepsi)                ogrenci
  --  Transit Vize            (hepsi)                NULL (hiç ekleme)
  --  Çalışma/İş Vizesi       sirket_sahibi/serbest  sirket_sahibi
  --                          calisan                calisan
  --                          calismiyor/ogr/emekli  NULL ← sponsor/kişisel finansal evrak GELMEMELİ;
  --                                                       işveren evrakları country_specific'ten gelir
  --  Turistik / Aile         calisan                calisan
  --                          sirket_sahibi/serbest  sirket_sahibi
  --                          emekli                 emekli
  --                          calismiyor/ogr/bilinm  ev_hanimi
  --  Ticari/İş (Gezisi)      calisan                calisan (sirket_sahibi eklenmez)
  --                          sirket_sahibi/serbest  sirket_sahibi
  --                          emekli/calismiyor/ogr  ev_hanimi
  --  Tedavi/Sağlık           (hepsi)                ev_hanimi
  --  Kültürel / Resmi        (hepsi)                ev_hanimi
  --  Aile Birleşimi          calisan                calisan
  --                          sirket_sahibi/serbest  sirket_sahibi
  --                          diğerleri              ev_hanimi
  --  Bilinmeyen vize tipi    calisan                calisan
  --                          sirket_sahibi/serbest  sirket_sahibi
  --                          emekli                 emekli
  --                          diğerleri              ev_hanimi

  IF p_occupation IS NOT NULL THEN

    IF p_visa_type = 'Eğitim/Öğrenci' THEN
      v_occ := 'ogrenci';

    ELSIF p_visa_type = 'Transit Vize' THEN
      v_occ := NULL;

    ELSIF p_visa_type = 'Çalışma/İş Vizesi' THEN
      IF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
        v_occ := 'sirket_sahibi';
      ELSIF p_occupation = 'calisan' THEN
        v_occ := 'calisan';
      ELSE
        -- calismiyor, ogrenci, emekli:
        -- kişisel finansal / sponsor evrakları KESİNLİKLE gelmesin
        v_occ := NULL;
      END IF;

    ELSIF p_visa_type IN ('Turistik', 'Aile/Arkadaş Ziyareti') THEN
      IF p_occupation = 'calisan' THEN
        v_occ := 'calisan';
      ELSIF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
        v_occ := 'sirket_sahibi';
      ELSIF p_occupation = 'emekli' THEN
        v_occ := 'emekli';
      ELSE
        v_occ := 'ev_hanimi';
      END IF;

    ELSIF p_visa_type IN ('Ticari/İş', 'Ticari/İş Gezisi') THEN
      IF p_occupation = 'calisan' THEN
        -- SADECE calisan paketi; sirket_sahibi ikinci paket olarak GELMEZ
        v_occ := 'calisan';
      ELSIF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
        v_occ := 'sirket_sahibi';
      ELSE
        v_occ := 'ev_hanimi';
      END IF;

    ELSIF p_visa_type IN ('Tedavi/Sağlık Vizesi', 'Kültürel Vize', 'Resmi Vize') THEN
      v_occ := 'ev_hanimi';

    ELSIF p_visa_type = 'Aile Birleşimi Vizesi' THEN
      IF p_occupation = 'calisan' THEN
        v_occ := 'calisan';
      ELSIF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
        v_occ := 'sirket_sahibi';
      ELSE
        v_occ := 'ev_hanimi';
      END IF;

    ELSE
      -- Bilinmeyen vize tipi — genel meslek mapping
      IF p_occupation = 'calisan' THEN
        v_occ := 'calisan';
      ELSIF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
        v_occ := 'sirket_sahibi';
      ELSIF p_occupation = 'emekli' THEN
        v_occ := 'emekli';
      ELSE
        v_occ := 'ev_hanimi';
      END IF;
    END IF;

  END IF;

  -- ── 3 katmanı birleştir, dedup uygula, ekle ────────────────
  --
  --  src_layer = 1 → country_specific (en yüksek öncelik)
  --  src_layer = 2 → occupation
  --  src_layer = 3 → standard (en düşük öncelik)
  --
  --  DISTINCT ON (doc_name) ORDER BY doc_name, src_layer ASC
  --  → aynı isimli evrak varsa düşük src_layer olanı (country_specific) kazanır
  --
  --  display_ord:
  --    1–99   → standard evraklar (pasaport, fotoğraf, banka, vb.)
  --    100–199 → meslek evrakları (maaş, SGK, şirket belgeleri)
  --    200–249 → ülkeye özgü vize tipine özel evraklar (D-Tipi form vb.)
  --    250–299 → ülkeye özgü genel evraklar (başvuru formları, ülke sigortası)

  INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM (
    SELECT DISTINCT ON (doc_name)
      doc_name,
      delivery_type,
      display_ord
    FROM (

      -- ── Layer 1: Standart evraklar ─────────────────────────
      SELECT
        doc_name,
        delivery_type,
        3               AS src_layer,
        order_num       AS display_ord
      FROM public.standard_travel_docs
      WHERE NOT (
        -- Schengen dışı ülkelerde "min. 30.000 €" sigortasını atla
        p_country = ANY(non_schengen)
        AND doc_name ILIKE '%30.000 €%'
      )

      UNION ALL

      -- ── Layer 2: Meslek paketi ─────────────────────────────
      SELECT
        doc_name,
        delivery_type,
        2               AS src_layer,
        100 + order_num AS display_ord
      FROM public.occupation_doc_packages
      WHERE v_occ IS NOT NULL
        AND occupation = v_occ

      UNION ALL

      -- ── Layer 3: Ülkeye özgü evraklar ─────────────────────
      --
      -- Aynı konuda (başvuru formu) hem visa_type-özel hem de genel (NULL)
      -- kayıt varsa, genel kayıt atlanır; böylece çalışma vizesinde
      -- "Videx başvuru formu" yerine "Ulusal D-Tipi Form" gelir.
      SELECT
        doc_name,
        delivery_type,
        1 AS src_layer,
        CASE WHEN visa_type IS NOT NULL THEN 200 ELSE 250 END + order_num AS display_ord
      FROM public.country_specific_docs
      WHERE country = p_country
        AND (visa_type IS NULL OR visa_type = p_visa_type)
        -- Genel (NULL) form kaydını, aynı ülke+vize için özel form varsa atla
        AND NOT (
          visa_type IS NULL
          AND (doc_name ILIKE '%başvuru formu%' OR doc_name ILIKE '%vize formu%')
          AND EXISTS (
            SELECT 1
            FROM   public.country_specific_docs sub
            WHERE  sub.country   = p_country
              AND  sub.visa_type = p_visa_type
              AND  (sub.doc_name ILIKE '%başvuru formu%' OR sub.doc_name ILIKE '%vize formu%')
          )
        )

    ) all_docs
    -- Aynı doc_name için src_layer=1 (country_specific) kazanır
    ORDER BY doc_name, src_layer ASC
  ) deduped
  ORDER BY display_ord;

  -- Nihai listeyi döndür
  RETURN QUERY
  SELECT * FROM public.user_submitted_docs
  WHERE  application_id = p_application_id
  ORDER  BY id;
END;
$$;
