-- ============================================================
-- 20260531_visa_3layer_architecture.sql
-- 3 Katmanlı Vize Evrak Mimarisi
--
-- Layer 1 — standard_travel_docs      : Tüm başvurular için ortak evraklar
-- Layer 2 — occupation_doc_packages   : Mesleğe göre ek evraklar
-- Layer 3 — country_specific_docs     : Ülkeye özgü evraklar + formlar
--          + user_submitted_docs       : Başvuru bazlı evrak takip tablosu
--          + get_visa_documents()      : Şablondan otomatik liste oluşturur
--          + RLS politikaları
--
-- NOT: delivery_type değerleri  →  'digital' | 'physical' | 'firma'
--      'firma' = firmamızın hazırlayıp/basıp teslim ettiği belgeler
-- ============================================================


-- ============================================================
-- BÖLÜM 1: TABLO TANIMLARI
-- ============================================================

-- ── Layer 1: Standart Evraklar ────────────────────────────────
-- Vize başvuru formu BURADA OLMAZ — her ülke kendi formunu
-- country_specific_docs tablosunda taşır.

CREATE TABLE IF NOT EXISTS public.standard_travel_docs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_name      text        NOT NULL,
  delivery_type text        CHECK (delivery_type IN ('digital', 'physical', 'firma')) DEFAULT 'digital',
  order_num     int         DEFAULT 0,
  notes         text
);

-- ── Layer 2: Meslek Evrak Paketleri ──────────────────────────
CREATE TABLE IF NOT EXISTS public.occupation_doc_packages (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  occupation    text        NOT NULL,   -- 'calisan' | 'serbest_meslek' | 'sirket_sahibi' | 'ogrenci' | 'emekli' | 'ev_hanimi'
  doc_name      text        NOT NULL,
  delivery_type text        CHECK (delivery_type IN ('digital', 'physical', 'firma')) DEFAULT 'digital',
  order_num     int         DEFAULT 0,
  notes         text
);

-- ── Layer 3: Ülkeye Özgü Evraklar ────────────────────────────
-- visa_type NULL ise o ülkedeki tüm vize türlerine uygulanır.
CREATE TABLE IF NOT EXISTS public.country_specific_docs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  country       text        NOT NULL,
  visa_type     text,                   -- NULL = tüm vize türleri
  doc_name      text        NOT NULL,
  delivery_type text        CHECK (delivery_type IN ('digital', 'physical', 'firma')) DEFAULT 'digital',
  order_num     int         DEFAULT 0,
  notes         text
);

-- ── Junction: Başvuru Bazlı Evrak Takibi ─────────────────────
CREATE TABLE IF NOT EXISTS public.user_submitted_docs (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid        REFERENCES public.applications(id) ON DELETE CASCADE,
  doc_name       text        NOT NULL,
  file_url       text,
  status         text        CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  updated_at     timestamptz DEFAULT timezone('utc'::text, now())
);


-- ============================================================
-- BÖLÜM 2: SEED — LAYER 1 (Standart Evraklar)
-- ============================================================
-- Vize başvuru formu KASITLI olarak bu listeye dahil edilmemiştir.
-- Her ülkenin formu country_specific_docs tablosunda 'firma' olarak yer alır.

DELETE FROM public.standard_travel_docs;

INSERT INTO public.standard_travel_docs (doc_name, delivery_type, order_num) VALUES
('Pasaportun orijinali (son 10 yıl içinde alınmış, en az 2 boş sayfa)',  'physical', 1),
('Pasaport fotokopisi',                                                    'digital',  2),
('Kimlik fotokopisi',                                                      'digital',  3),
('2 adet biyometrik fotoğraf (35×45 mm, beyaz fon, ICAO standardı)',       'physical', 4),
('İkametgah belgesi (e-devlet, barkodlu)',                                 'digital',  5),
('Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)',                   'digital',  6),
('Gidiş-dönüş uçak bileti rezervasyonu',                                   'digital',  7),
('Seyahat sağlık sigortası (tüm Schengen / hedef ülke geçerli, min. 30.000 €)', 'digital', 8),
('Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', 'digital', 9);


-- ============================================================
-- BÖLÜM 3: SEED — LAYER 2 (Meslek Evrak Paketleri)
-- ============================================================

DELETE FROM public.occupation_doc_packages;

-- ── Ücretli Çalışan ──────────────────────────────────────────
INSERT INTO public.occupation_doc_packages (occupation, doc_name, delivery_type, order_num) VALUES
('calisan', 'İşveren İzin/Görev Yazısı — ZORUNLU (ıslak imzalı ve kaşeli; işe başlangıç tarihi, maaş, görev ve izin tarihleri belirtilmeli)', 'digital', 1),
('calisan', 'Maaş bordrosu (son 3 ay)',                                                  'digital', 2),
('calisan', 'SGK İşe Giriş Bildirgesi (e-devlet, barkodlu)',                             'digital', 3),
('calisan', 'SGK Hizmet Dökümü (e-devlet, barkodlu; tüm sigorta geçmişini kapsar)',      'digital', 4);

-- ── Serbest Meslek / Esnaf ────────────────────────────────────
INSERT INTO public.occupation_doc_packages (occupation, doc_name, delivery_type, order_num) VALUES
('serbest_meslek', 'Vergi levhası',                                                                  'digital', 1),
('serbest_meslek', 'Şirket/İşyeri faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)',   'digital', 2),
('serbest_meslek', 'Son 3 aylık banka hesap dökümü — işletme hesabı (banka kaşeli/imzalı)',          'digital', 3),
('serbest_meslek', 'Mesleğe ait ruhsat/lisans belgesi (varsa)',                                       'digital', 4);

-- ── Şirket Sahibi / Ortak / Yönetici ─────────────────────────
INSERT INTO public.occupation_doc_packages (occupation, doc_name, delivery_type, order_num) VALUES
('sirket_sahibi', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)',                                  'digital', 1),
('sirket_sahibi', 'Vergi levhası',                                                                                           'digital', 2),
('sirket_sahibi', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış, tercümeli)',                                            'digital', 3),
('sirket_sahibi', 'İmza sirküleri (Apostilli, tercümeli)',                                                                   'digital', 4),
('sirket_sahibi', 'Son 3 aylık banka hesap dökümü — şirket hesabı (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', 'digital', 5);

-- ── Öğrenci ───────────────────────────────────────────────────
INSERT INTO public.occupation_doc_packages (occupation, doc_name, delivery_type, order_num) VALUES
('ogrenci', 'Öğrenci belgesi (güncel, okul mühürlü)',                                                          'digital', 1),
('ogrenci', 'Transkript / ders dökümü',                                                                        'digital', 2),
('ogrenci', 'Burs belgesi (varsa)',                                                                             'digital', 3),
('ogrenci', 'Veli/sponsor gelir belgesi (maaş bordrosu veya emeklilik belgesi)',                                'digital', 4),
('ogrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı)',                                 'digital', 5),
('ogrenci', 'Aile cüzdanı fotokopisi (velilere bağlı öğrenciler için)',                                        'digital', 6);

-- ── Emekli ────────────────────────────────────────────────────
INSERT INTO public.occupation_doc_packages (occupation, doc_name, delivery_type, order_num) VALUES
('emekli', 'Emeklilik belgesi / SGK emeklilik yazısı',                                                  'digital', 1),
('emekli', 'Emekli maaşı belgesi (son ay, banka kaşeli/imzalı)',                                        'digital', 2),
('emekli', 'SGK Hizmet Dökümü (e-devlet, barkodlu)',                                                    'digital', 3);

-- ── Ev Hanımı / Ev Erkeği (Bakmakla Yükümlü) ─────────────────
INSERT INTO public.occupation_doc_packages (occupation, doc_name, delivery_type, order_num) VALUES
('ev_hanimi', 'Aile cüzdanı / nikah cüzdanı fotokopisi (akrabalık ilişkisini gösterir)',                           'digital', 1),
('ev_hanimi', 'Sponsor (eş/veli) gelir belgesi / maaş bordrosu (son 3 ay)',                                        'digital', 2),
('ev_hanimi', 'Sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı)',                                        'digital', 3),
('ev_hanimi', 'Sponsor tarafından yazılmış masraf taahhütnamesi',                                                   'digital', 4),
('ev_hanimi', 'Sponsorun İşveren İzin/Görev Yazısı (ıslak imzalı, kaşeli)',                                       'digital', 5),
('ev_hanimi', 'Sponsorun SGK Hizmet Dökümü (e-devlet, barkodlu)',                                                  'digital', 6);


-- ============================================================
-- BÖLÜM 4: SEED — LAYER 3 (Ülkeye Özgü Evraklar)
-- Genel "Vize başvuru formu" KALDIRILDI.
-- Her ülke kendi formunu 'firma' delivery_type ile taşır.
-- ============================================================

DELETE FROM public.country_specific_docs;

-- ──────────────────────────────────────────────────────────────
-- BAŞVURU FORMLARI (delivery_type = 'firma', visa_type = NULL → tüm türler)
-- ──────────────────────────────────────────────────────────────

-- Almanya — Videx (Schengen C + Ulusal D)
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Almanya', NULL, 'Videx başvuru formu (imzalı, 2 nüsha — konsolosluk sisteminden çıktı)', 'firma', 1);

-- Fransa
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', NULL, 'Fransa vize başvuru formu (imzalı)', 'firma', 1);

-- İtalya
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', NULL, 'İtalya vize başvuru formu (imzalı)', 'firma', 1);

-- İspanya
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', NULL, 'İspanya vize başvuru formu (imzalı)', 'firma', 1);

-- Hollanda
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', NULL, 'Hollanda vize başvuru formu (imzalı)', 'firma', 1);

-- Polonya
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', NULL, 'Polonya vize başvuru formu (imzalı)', 'firma', 1);

-- İngiltere (Schengen değil)
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', NULL, 'UK Standard Visitor Visa formu — GOV.UK online (online doldurulur, firma tarafından yönetilir)', 'firma', 1);

-- Amerika (Schengen değil)
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Amerika Birleşik Devletleri', NULL, 'DS-160 başvuru formu — online (barkodlu onay sayfası çıktısı firma tarafından hazırlanır)', 'firma', 1);

-- Kanada (Schengen değil)
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', NULL, 'IMM 5257 formu — online (firma tarafından doldurulur, imzalanır)', 'firma', 1);

-- Japonya (Schengen değil)
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', NULL, 'Japonya konsolosluk vize başvuru formu (imzalı)', 'firma', 1);

-- Güney Kore (Schengen değil)
INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', NULL, 'HiKorea Form No.17 — Vize Başvuru Formu (firma tarafından hazırlanır, imzalanır)', 'firma', 1);

-- ──────────────────────────────────────────────────────────────
-- DİĞER SCHENGEN ÜLKELERİ → Schengen vize başvuru formu
-- ──────────────────────────────────────────────────────────────

INSERT INTO public.country_specific_docs (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Avusturya',        NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Belçika',          NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Bulgaristan',      NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Letonya',          NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Danimarka',        NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Finlandiya',       NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Estonya',          NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Hırvatistan',      NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Çek Cumhuriyeti',  NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Yunanistan',       NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Macaristan',       NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('İzlanda',          NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Lihtenştayn',      NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Litvanya',         NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Lüksemburg',       NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Malta',            NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Norveç',           NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Portekiz',         NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Romanya',          NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Slovakya',         NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('Slovenya',         NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('İsveç',            NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1),
('İsviçre',          NULL, 'Schengen vize başvuru formu (imzalı)',  'firma', 1);


-- ============================================================
-- BÖLÜM 5: get_visa_documents() FONKSİYONU
-- Verilen başvuru için 3 katmandan evrak listesini birleştirip
-- user_submitted_docs tablosuna otomatik INSERT eder.
--
-- Parametreler:
--   p_application_id  : başvuru uuid'si
--   p_country         : ülke adı (country_specific_docs.country ile eşleşir)
--   p_visa_type       : vize türü (country_specific_docs.visa_type ile eşleşir)
--   p_occupation      : meslek kodu (NULL = Layer 2 atlanır)
--
-- Aynı başvuru için tekrar çağrıldığında mevcut kayıtları temizler (idempotent).
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
BEGIN
  -- Yetki kontrolü: başvuru çağıranın firmasına ait olmalı
  IF NOT EXISTS (
    SELECT 1
    FROM   public.applications a
    JOIN   public.users u ON u.company_id = a.company_id
    WHERE  a.id = p_application_id
      AND  u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Erişim reddedildi: başvuru firmanıza ait değil';
  END IF;

  -- Önceki kayıtları temizle (yeniden çağrılabilirlik)
  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id;

  -- Layer 1: Standart evraklar
  INSERT INTO public.user_submitted_docs (application_id, doc_name, status)
  SELECT p_application_id, doc_name, 'pending'
  FROM   public.standard_travel_docs
  ORDER  BY order_num;

  -- Layer 2: Mesleğe göre ek evraklar
  IF p_occupation IS NOT NULL THEN
    INSERT INTO public.user_submitted_docs (application_id, doc_name, status)
    SELECT p_application_id, doc_name, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = p_occupation
    ORDER  BY order_num;
  END IF;

  -- Layer 3: Ülkeye özgü evraklar (form dahil)
  INSERT INTO public.user_submitted_docs (application_id, doc_name, status)
  SELECT p_application_id, doc_name, 'pending'
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


-- ============================================================
-- BÖLÜM 6: RLS POLİTİKALARI
-- ============================================================

-- ── Global şablon tabloları (standard / occupation / country) ─
-- Kimlik doğrulanmış herkes okur; yalnızca superadmin yazar.

ALTER TABLE public.standard_travel_docs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupation_doc_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_specific_docs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_submitted_docs     ENABLE ROW LEVEL SECURITY;

-- standard_travel_docs
CREATE POLICY "std_docs_select"
  ON public.standard_travel_docs FOR SELECT TO authenticated USING (true);

CREATE POLICY "std_docs_insert"
  ON public.standard_travel_docs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "std_docs_update"
  ON public.standard_travel_docs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "std_docs_delete"
  ON public.standard_travel_docs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

-- occupation_doc_packages
CREATE POLICY "occ_docs_select"
  ON public.occupation_doc_packages FOR SELECT TO authenticated USING (true);

CREATE POLICY "occ_docs_insert"
  ON public.occupation_doc_packages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "occ_docs_update"
  ON public.occupation_doc_packages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "occ_docs_delete"
  ON public.occupation_doc_packages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

-- country_specific_docs
CREATE POLICY "country_docs_select"
  ON public.country_specific_docs FOR SELECT TO authenticated USING (true);

CREATE POLICY "country_docs_insert"
  ON public.country_specific_docs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "country_docs_update"
  ON public.country_specific_docs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

CREATE POLICY "country_docs_delete"
  ON public.country_specific_docs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

-- ── user_submitted_docs — company_id bazlı izolasyon ─────────
-- applications tablosu üzerinden company_id kontrolü yapılır.

CREATE POLICY "user_submitted_docs_select"
  ON public.user_submitted_docs FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM public.applications
      WHERE  company_id = public.get_my_company_id()
    )
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "user_submitted_docs_insert"
  ON public.user_submitted_docs FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM public.applications
      WHERE  company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "user_submitted_docs_update"
  ON public.user_submitted_docs FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM public.applications
      WHERE  company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "user_submitted_docs_delete"
  ON public.user_submitted_docs FOR DELETE
  USING (
    application_id IN (
      SELECT id FROM public.applications
      WHERE  company_id = public.get_my_company_id()
    )
  );
