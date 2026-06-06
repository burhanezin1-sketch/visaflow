-- ============================================================
-- ADIM 1: visa_doc_master tablosu + indeksler + RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visa_doc_master (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_name            text        NOT NULL,
  description         text,
  delivery_type       text        CHECK (delivery_type IN ('digital', 'physical', 'firma')) DEFAULT 'digital',
  order_num           integer     DEFAULT 50,
  include_countries   text[],
  exclude_countries   text[],
  include_visa_types  text[],
  exclude_visa_types  text[],
  include_occupations text[],
  exclude_occupations text[],
  is_active           boolean     DEFAULT true,
  created_at          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visa_doc_master_countries   ON public.visa_doc_master USING GIN(include_countries);
CREATE INDEX IF NOT EXISTS idx_visa_doc_master_visa_types  ON public.visa_doc_master USING GIN(include_visa_types);
CREATE INDEX IF NOT EXISTS idx_visa_doc_master_occupations ON public.visa_doc_master USING GIN(include_occupations);

ALTER TABLE public.visa_doc_master ENABLE ROW LEVEL SECURITY;

-- Authenticated herkes okuyabilir
CREATE POLICY "vdm_authenticated_read" ON public.visa_doc_master
  FOR SELECT TO authenticated USING (true);

-- Superadmin yazabilir
CREATE POLICY "vdm_superadmin_write" ON public.visa_doc_master
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

-- ============================================================
-- ADIM 2a: standard_travel_docs → visa_doc_master
-- "30.000 €" sigortası Schengen dışı ülkelere gelmesin
-- "seyahat sağlık sigortası" İngiltere/Japonya/GK/Kanada/Amerika'ya gelmesin
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, delivery_type, order_num, exclude_countries)
SELECT
  doc_name,
  delivery_type,
  order_num,
  CASE
    WHEN doc_name ILIKE '%30.000 €%' THEN
      ARRAY['Amerika Birleşik Devletleri','Kanada','İngiltere','Japonya','Güney Kore']
    WHEN doc_name ILIKE '%seyahat sağlık sigortası%'
     AND doc_name NOT ILIKE '%tüm Schengen%' THEN
      ARRAY['İngiltere','Japonya','Güney Kore','Kanada','Amerika Birleşik Devletleri']
    ELSE NULL
  END
FROM public.standard_travel_docs
ORDER BY order_num;

-- ============================================================
-- ADIM 2b: occupation_doc_packages → visa_doc_master
-- SGK/bordro/maaş/şirket evrakları Transit Vize'ye gelmesin
-- Sponsor evrakları Çalışma/İş Vizesi'ne gelmesin
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, delivery_type, order_num, include_occupations, exclude_visa_types)
SELECT
  doc_name,
  delivery_type,
  order_num,
  ARRAY[occupation],
  CASE
    WHEN doc_name ILIKE '%SGK%'
      OR doc_name ILIKE '%bordro%'
      OR doc_name ILIKE '%maaş%'
      OR doc_name ILIKE '%şirket evrak%'
      OR doc_name ILIKE '%faaliyet belgesi%'
      OR doc_name ILIKE '%ticaret sicil%'
      OR doc_name ILIKE '%vergi levhası%'
      OR doc_name ILIKE '%işveren izin%'
      OR doc_name ILIKE '%imza sirkü%'
    THEN ARRAY['Transit Vize']
    WHEN (doc_name ILIKE '%sponsor%' OR doc_name ILIKE '%masraf taahhüt%')
      AND occupation IN ('ev_hanimi','ev_hanimi_meslek','calismiyor','ogrenci')
    THEN ARRAY['Çalışma/İş Vizesi']
    ELSE NULL
  END
FROM public.occupation_doc_packages
ORDER BY occupation, order_num;

-- ============================================================
-- ADIM 2c: country_specific_docs → visa_doc_master
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, delivery_type, order_num,
   include_countries, include_visa_types, include_occupations)
SELECT
  doc_name,
  delivery_type,
  order_num,
  CASE WHEN country   IS NOT NULL THEN ARRAY[country]    ELSE NULL END,
  CASE WHEN visa_type IS NOT NULL THEN ARRAY[visa_type]  ELSE NULL END,
  CASE WHEN occupation IS NOT NULL THEN ARRAY[occupation] ELSE NULL END
FROM public.country_specific_docs
ORDER BY
  CASE WHEN country   IS NOT NULL THEN 0 ELSE 1 END,
  CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
  order_num;

-- ============================================================
-- ADIM 3: Özel kurallar — POST-PROCESSING'den satıra çevrilmiş
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, delivery_type, order_num, include_countries, include_visa_types, include_occupations, exclude_occupations)
VALUES

-- Schengen Turistik: gidiş-dönüş uçak
('Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 60,
 ARRAY['Almanya','Avusturya','Belçika','Çekya','Danimarka','Estonya',
       'Finlandiya','Fransa','Hollanda','İspanya','İsveç','İsviçre',
       'İtalya','İzlanda','Letonya','Liechtenstein','Litvanya',
       'Lüksemburg','Macaristan','Malta','Norveç','Polonya','Portekiz',
       'Slovakya','Slovenya','Yunanistan'],
 ARRAY['Turistik'], NULL, NULL),

-- Schengen Turistik: otel / konaklama
('Otel / konaklama rezervasyonu (seyahat tarihleri ile uyumlu)', 'digital', 61,
 ARRAY['Almanya','Avusturya','Belçika','Çekya','Danimarka','Estonya',
       'Finlandiya','Fransa','Hollanda','İspanya','İsveç','İsviçre',
       'İtalya','İzlanda','Letonya','Liechtenstein','Litvanya',
       'Lüksemburg','Macaristan','Malta','Norveç','Polonya','Portekiz',
       'Slovakya','Slovenya','Yunanistan'],
 ARRAY['Turistik'], NULL, NULL),

-- Japonya Turistik: konaklama + Schedule of Stay
('Otel / konaklama rezervasyonu (uçuş tarihleri ve seyahat planı ile uyumlu İngilizce belge)',
 'digital', 60, ARRAY['Japonya'], ARRAY['Turistik'], NULL, NULL),
('Resmi Japonya seyahat planı formu (Schedule of Stay — gün gün konaklama, aktivite ve iletişim bilgilerini içeren resmi şablon)',
 'digital', 61, ARRAY['Japonya'], ARRAY['Turistik'], NULL, NULL),

-- Güney Kore Turistik: konaklama + Travel Itinerary
('Otel / konaklama rezervasyonu (başvuru formundaki adres ile eşleşen İngilizce rezervasyon)',
 'digital', 60, ARRAY['Güney Kore'], ARRAY['Turistik'], NULL, NULL),
('Günlük seyahat planı (Korede gezilecek yerleri gün gün detaylandıran İngilizce Travel Itinerary)',
 'digital', 61, ARRAY['Güney Kore'], ARRAY['Turistik'], NULL, NULL),

-- İngiltere Turistik: konaklama
('Otel / konaklama rezervasyonu (seyahat tarihleri ile uyumlu İngilizce belge)',
 'digital', 60, ARRAY['İngiltere'], ARRAY['Turistik'], NULL, NULL),

-- Kanada Turistik: IRCC portal formu + gidiş-dönüş + otel
('Kanada yeni IRCC portal online başvuru formu (portal üzerinden dinamik doldurulur)',
 'firma', 55, ARRAY['Kanada'], ARRAY['Turistik'], NULL, NULL),
('Gidiş-dönüş uçak bileti rezervasyonu',
 'digital', 60, ARRAY['Kanada'], ARRAY['Turistik'], NULL, NULL),
('Otel / konaklama rezervasyonu (seyahat tarihleri ile uyumlu)',
 'digital', 61, ARRAY['Kanada'], ARRAY['Turistik'], NULL, NULL),

-- Amerika Turistik: randevu + MRV
('Randevu onay belgesi (Visa Appointment Confirmation sayfası çıktısı)',
 'firma', 55, ARRAY['Amerika Birleşik Devletleri'], ARRAY['Turistik'], NULL, NULL),
('Vize ücreti ödeme dekontu (MRV makbuzu)',
 'firma', 56, ARRAY['Amerika Birleşik Devletleri'], ARRAY['Turistik'], NULL, NULL),

-- Amerika: DS-160 (tüm vize türleri)
('DS-160 Başvuru Formu Onay Sayfası (barkodlu online çıktı — ceac.state.gov adresinden doldurulur)',
 'digital', 57, ARRAY['Amerika Birleşik Devletleri'], NULL, NULL, NULL),

-- Amerika: özel fotoğraf standardı
('2 adet Amerika vizesine uygun biyometrik fotoğraf (50x50 mm, kare, beyaz fon)',
 'digital', 3, ARRAY['Amerika Birleşik Devletleri'], NULL, NULL, NULL),

-- Almanya Çalışma/İş Vizesi: Arbeitsvertrag paketi
('Almanya iş sözleşmesi (Arbeitsvertrag) — aslı ve 2 adet fotokopisi',
 'physical', 70, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),
('Somut iş teklifi formu (Erklärung zum Beschäftigungsverhältnis) — işveren tarafından doldurulmuş',
 'digital', 71, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),
('Diploma veya mesleki eğitim sertifikası (Almanca tercümesi ve varsa denklik belgesi / Anabin çıktısı ile)',
 'physical', 72, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),
('Ulusal (D Tipi) Vize Başvuru Formu (Videx) — el yazısı ile imzalanmış, 2 nüsha',
 'digital', 50, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),

-- Almanya Eğitim/Öğrenci: CV + motivasyon + Sperrkonto
('İngilizce veya Almanca özgeçmiş (CV)',
 'digital', 70, ARRAY['Almanya'], ARRAY['Eğitim/Öğrenci'], NULL, NULL),
('Motivasyon mektubu (Almanyada eğitim alma amacını detaylandıran Almanca veya İngilizce imzalı mektup)',
 'digital', 71, ARRAY['Almanya'], ARRAY['Eğitim/Öğrenci'], NULL, NULL),
('Almanya bloke hesap (Sperrkonto) onay belgesi (tam burs yoksa konsolosluğun belirlediği yıllık tutarın bloke edildiğine dair resmi onay)',
 'digital', 72, ARRAY['Almanya'], ARRAY['Eğitim/Öğrenci'], NULL, NULL),

-- Emekli: emeklilik belgesi + şahsi dilekçe
('Emeklilik Belgesi (e-Devlet barkodlu emekli aylık bilgisi belgesi)',
 'digital', 70, NULL, NULL, ARRAY['emekli'], NULL),
('Şahsi Vize Talep Dilekçesi (konsolosluğa hitaben yazılmış, seyahat amacını ve dönüş taahhüdünü belirten ıslak imzalı dilekçe)',
 'digital', 71, NULL, NULL, ARRAY['emekli'], NULL),

-- Devlet memuru: görev belgesi + resmi izin
('Çalışma Belgesi / Görev Belgesi (e-Devletten barkodlu veya kurumdan ıslak imzalı/mühürlü)',
 'digital', 70, NULL, NULL, ARRAY['devlet_memuru'], NULL),
('Resmi İzin Belgesi (bağlı bulunulan kurumdan mühürlü ve ıslak imzalı seyahat izin yazısı)',
 'digital', 71, NULL, NULL, ARRAY['devlet_memuru'], NULL),

-- Öğrenci: sponsor dilekçesi (çalışma vizesi hariç)
('Sponsor Dilekçesi ve Sponsorun Mesleki/Finansal Evrakları (anne, baba veya velinin gelir belgesi ve taahhütnamesi)',
 'digital', 70, NULL, NULL, ARRAY['ogrenci'],
 ARRAY['Çalışma/İş Vizesi']),

-- Ev hanımı / çalışmıyor: sponsorluk yazısı
('Sponsorluk Yazısı ve Masrafları Karşılayacak Birinci Derece Yakının Tüm Finansal Evrakları (maaş/emekli bordrosu, banka dökümü, vergi levhası)',
 'digital', 70, NULL, NULL,
 ARRAY['ev_hanimi','ev_hanimi_meslek','calismiyor'], NULL),

-- Kanada Eğitim/Öğrenci + ogrenci: finansal evraklar
('Sponsor veya şahsın son 3 aylık şahsi banka hesap dökümü (banka kaşeli ve ıslak imzalı, Kanada için yeterli bakiye gösteren)',
 'digital', 73, ARRAY['Kanada'], ARRAY['Eğitim/Öğrenci'], ARRAY['ogrenci'], NULL),
('Sponsorun gelir / işyeri belgeleri (maaş bordrosu, vergi levhası veya emeklilik belgesi)',
 'digital', 74, ARRAY['Kanada'], ARRAY['Eğitim/Öğrenci'], ARRAY['ogrenci'], NULL),

-- Amerika + ogrenci: sponsorluk taahhütnamesi
('Sponsorluk taahhütnamesi (anne, baba veya velinin öğrencinin seyahat ve eğitim masraflarını karşılayacağını belirten ıslak imzalı dilekçesi)',
 'digital', 70, ARRAY['Amerika Birleşik Devletleri'], NULL, ARRAY['ogrenci'], NULL),

-- Amerika + sirket_sahibi: 4B/Bağkur
('4B / Bağkur tescil ve SGK hizmet dökümü (e-devlet, barkodlu)',
 'digital', 75, ARRAY['Amerika Birleşik Devletleri'], NULL, ARRAY['sirket_sahibi'], NULL);

-- ============================================================
-- ADIM 4: Yeni get_visa_documents() fonksiyonu
-- ============================================================

DROP FUNCTION IF EXISTS public.get_visa_documents(uuid, text, text, text);

CREATE FUNCTION public.get_visa_documents(
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
    RAISE EXCEPTION 'Erişim reddedildi: başvuru firmanıza ait değil';
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

-- ============================================================
-- ADIM 5: Eski tabloları yedekle (silme, backup olarak kalsın)
-- ============================================================

ALTER TABLE public.standard_travel_docs   RENAME TO standard_travel_docs_backup;
ALTER TABLE public.occupation_doc_packages RENAME TO occupation_doc_packages_backup;
ALTER TABLE public.country_specific_docs   RENAME TO country_specific_docs_backup;
ALTER TABLE public.visa_package_rules      RENAME TO visa_package_rules_backup;
