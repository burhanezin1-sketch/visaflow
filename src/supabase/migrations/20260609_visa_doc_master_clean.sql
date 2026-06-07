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

CREATE POLICY "vdm_authenticated_read" ON public.visa_doc_master
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "vdm_superadmin_write" ON public.visa_doc_master
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid()));

-- ============================================================
-- ADIM 2a: standard_travel_docs → visa_doc_master
-- FIX 6: parantez içi açıklamayı description kolonuna taşı
-- FIX: sigortalar Schengen dışı ülkelere gelmesin
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, description, delivery_type, order_num, exclude_countries)
SELECT
  TRIM(REGEXP_REPLACE(doc_name, '\s*\([^()]*\)\s*$', ''))      AS doc_name,
  NULLIF(TRIM(SUBSTRING(doc_name FROM '\(([^()]*)\)\s*$')), '') AS description,
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

-- FIX 4: Standart banka satırı (universal — tüm meslek/ülke/vize)
INSERT INTO public.visa_doc_master
  (doc_name, description, delivery_type, order_num)
VALUES (
  'Son 3 aylık şahsi aktif banka hesap dökümü',
  'En az 50.000 TL bakiyeli, banka kaşeli, ıslak imzalı ve banka imza sirküleri ile birlikte',
  'digital',
  17
);

-- ============================================================
-- ADIM 2b: occupation_doc_packages → visa_doc_master
-- FIX 6: parantez içi açıklamayı description kolonuna taşı
-- FIX: Transit Vize'de SGK/bordro/maaş gelmesin
-- FIX: Çalışma Vizesi'nde sponsor evrakları gelmesin
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, description, delivery_type, order_num, include_occupations, exclude_visa_types)
SELECT
  TRIM(REGEXP_REPLACE(doc_name, '\s*\([^()]*\)\s*$', ''))      AS doc_name,
  NULLIF(TRIM(SUBSTRING(doc_name FROM '\(([^()]*)\)\s*$')), '') AS description,
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

-- FIX 4: Mesleğe özgü şahsi banka satırlarını sil — universal satır yeterli
DELETE FROM public.visa_doc_master
WHERE (include_occupations && ARRAY['calisan','emekli','devlet_memuru','sirket_sahibi'])
  AND doc_name ILIKE '%şahsi banka%';

-- ============================================================
-- ADIM 2c: country_specific_docs → visa_doc_master
-- FIX 6: parantez içi açıklamayı description kolonuna taşı
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, description, delivery_type, order_num,
   include_countries, include_visa_types, include_occupations)
SELECT
  TRIM(REGEXP_REPLACE(doc_name, '\s*\([^()]*\)\s*$', ''))      AS doc_name,
  NULLIF(TRIM(SUBSTRING(doc_name FROM '\(([^()]*)\)\s*$')), '') AS description,
  delivery_type,
  order_num,
  CASE WHEN country    IS NOT NULL THEN ARRAY[country]    ELSE NULL END,
  CASE WHEN visa_type  IS NOT NULL THEN ARRAY[visa_type]  ELSE NULL END,
  CASE WHEN occupation IS NOT NULL THEN ARRAY[occupation] ELSE NULL END
FROM public.country_specific_docs
ORDER BY
  CASE WHEN country   IS NOT NULL THEN 0 ELSE 1 END,
  CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
  order_num;

-- FIX 3: İngiltere fotoğraf satırını sil (country_specific_docs'tan gelmiş olabilir)
DELETE FROM public.visa_doc_master
WHERE include_countries @> ARRAY['İngiltere']
  AND include_countries = ARRAY['İngiltere']
  AND doc_name ILIKE '%fotoğraf%';

-- ============================================================
-- ADIM 3: Özel kurallar — clean + description ayrıştırılmış
-- FIX 1: Kanada Turistik uçak + otel YOK
-- FIX 2: Amerika Bağkur YOK
-- FIX 5: Schengen listesi 27 ülke (kullanıcının listesi)
-- FIX 6: doc_name sade, description ayrı
-- ============================================================

INSERT INTO public.visa_doc_master
  (doc_name, description, delivery_type, order_num,
   include_countries, include_visa_types, include_occupations, exclude_occupations)
VALUES

-- FIX 5: Schengen Turistik — gidiş-dönüş uçak
('Gidiş-dönüş uçak bileti rezervasyonu',
 NULL,
 'digital', 60,
 ARRAY['Almanya','Avusturya','Belçika','Fransa','Hollanda','İspanya','İsveç','İtalya',
       'Yunanistan','Polonya','Malta','Macaristan','Çekya','Lüksemburg','Danimarka',
       'Finlandiya','Portekiz','Slovakya','Slovenya','Estonya','Letonya','Litvanya',
       'İsviçre','Hırvatistan','Romanya','Bulgaristan','İrlanda'],
 ARRAY['Turistik'], NULL, NULL),

-- FIX 5: Schengen Turistik — otel / konaklama
('Otel / konaklama rezervasyonu',
 'Seyahat tarihleri ile uyumlu',
 'digital', 61,
 ARRAY['Almanya','Avusturya','Belçika','Fransa','Hollanda','İspanya','İsveç','İtalya',
       'Yunanistan','Polonya','Malta','Macaristan','Çekya','Lüksemburg','Danimarka',
       'Finlandiya','Portekiz','Slovakya','Slovenya','Estonya','Letonya','Litvanya',
       'İsviçre','Hırvatistan','Romanya','Bulgaristan','İrlanda'],
 ARRAY['Turistik'], NULL, NULL),

-- Japonya Turistik: konaklama
('Otel / konaklama rezervasyonu',
 'Uçuş tarihleri ve seyahat planı ile uyumlu İngilizce belge',
 'digital', 60, ARRAY['Japonya'], ARRAY['Turistik'], NULL, NULL),

-- Japonya Turistik: Schedule of Stay
('Resmi Japonya seyahat planı formu',
 'Schedule of Stay — gün gün konaklama, aktivite ve iletişim bilgilerini içeren resmi şablon',
 'digital', 61, ARRAY['Japonya'], ARRAY['Turistik'], NULL, NULL),

-- Güney Kore Turistik: konaklama
('Otel / konaklama rezervasyonu',
 'Başvuru formundaki adres ile eşleşen İngilizce rezervasyon',
 'digital', 60, ARRAY['Güney Kore'], ARRAY['Turistik'], NULL, NULL),

-- Güney Kore Turistik: Travel Itinerary
('Günlük seyahat planı',
 'Korede gezilecek yerleri gün gün detaylandıran İngilizce Travel Itinerary',
 'digital', 61, ARRAY['Güney Kore'], ARRAY['Turistik'], NULL, NULL),

-- İngiltere Turistik: konaklama
('Otel / konaklama rezervasyonu',
 'Seyahat tarihleri ile uyumlu İngilizce belge',
 'digital', 60, ARRAY['İngiltere'], ARRAY['Turistik'], NULL, NULL),

-- Kanada Turistik: IRCC portal — FIX 1: uçak + otel YOK
('Kanada yeni IRCC portal online başvuru formu',
 'Portal üzerinden dinamik doldurulur',
 'firma', 55, ARRAY['Kanada'], ARRAY['Turistik'], NULL, NULL),

-- Amerika Turistik: randevu onay belgesi
('Randevu onay belgesi',
 'Visa Appointment Confirmation sayfası çıktısı',
 'firma', 55, ARRAY['Amerika Birleşik Devletleri'], ARRAY['Turistik'], NULL, NULL),

-- Amerika Turistik: MRV makbuzu
('Vize ücreti ödeme dekontu',
 'MRV makbuzu',
 'firma', 56, ARRAY['Amerika Birleşik Devletleri'], ARRAY['Turistik'], NULL, NULL),

-- Amerika: DS-160 (tüm vize türleri)
('DS-160 Başvuru Formu Onay Sayfası',
 'Barkodlu online çıktı — ceac.state.gov adresinden doldurulur',
 'digital', 57, ARRAY['Amerika Birleşik Devletleri'], NULL, NULL, NULL),

-- Amerika: 50x50 fotoğraf standardı
('2 adet Amerika vizesine uygun biyometrik fotoğraf',
 '50x50 mm, kare, beyaz fon',
 'digital', 3, ARRAY['Amerika Birleşik Devletleri'], NULL, NULL, NULL),

-- Almanya Çalışma/İş Vizesi: Arbeitsvertrag
('Almanya iş sözleşmesi (Arbeitsvertrag)',
 'Aslı ve 2 adet fotokopisi',
 'physical', 70, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),

-- Almanya Çalışma/İş Vizesi: Erklärung
('Somut iş teklifi formu (Erklärung zum Beschäftigungsverhältnis)',
 'İşveren tarafından doldurulmuş',
 'digital', 71, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),

-- Almanya Çalışma/İş Vizesi: Diploma
('Diploma veya mesleki eğitim sertifikası',
 'Almanca tercümesi ve varsa denklik belgesi / Anabin çıktısı ile',
 'physical', 72, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),

-- Almanya Çalışma/İş Vizesi: Videx
('Ulusal (D Tipi) Vize Başvuru Formu (Videx)',
 'El yazısı ile imzalanmış, 2 nüsha',
 'digital', 50, ARRAY['Almanya'], ARRAY['Çalışma/İş Vizesi'], NULL, NULL),

-- Almanya Eğitim/Öğrenci: CV
('Özgeçmiş',
 'İngilizce veya Almanca olarak hazırlanmış',
 'digital', 70, ARRAY['Almanya'], ARRAY['Eğitim/Öğrenci'], NULL, NULL),

-- Almanya Eğitim/Öğrenci: motivasyon mektubu
('Motivasyon mektubu',
 'Almanyada eğitim alma amacını detaylandıran Almanca veya İngilizce imzalı mektup',
 'digital', 71, ARRAY['Almanya'], ARRAY['Eğitim/Öğrenci'], NULL, NULL),

-- Almanya Eğitim/Öğrenci: Sperrkonto
('Almanya bloke hesap (Sperrkonto) onay belgesi',
 'Tam burs yoksa konsolosluğun belirlediği yıllık tutarın bloke edildiğine dair resmi onay',
 'digital', 72, ARRAY['Almanya'], ARRAY['Eğitim/Öğrenci'], NULL, NULL),

-- Emekli: emeklilik belgesi
('Emeklilik Belgesi',
 'E-Devlet barkodlu emekli aylık bilgisi belgesi',
 'digital', 70, NULL, NULL, ARRAY['emekli'], NULL),

-- Emekli: şahsi dilekçe
('Şahsi Vize Talep Dilekçesi',
 'Konsolosluğa hitaben yazılmış, seyahat amacını ve dönüş taahhüdünü belirten ıslak imzalı dilekçe',
 'digital', 71, NULL, NULL, ARRAY['emekli'], NULL),

-- Devlet memuru: görev belgesi
('Çalışma Belgesi / Görev Belgesi',
 'E-Devletten barkodlu veya kurumdan ıslak imzalı/mühürlü',
 'digital', 70, NULL, NULL, ARRAY['devlet_memuru'], NULL),

-- Devlet memuru: resmi izin belgesi
('Resmi İzin Belgesi',
 'Bağlı bulunulan kurumdan mühürlü ve ıslak imzalı seyahat izin yazısı',
 'digital', 71, NULL, NULL, ARRAY['devlet_memuru'], NULL),

-- Öğrenci: sponsor dilekçesi (çalışma vizesi hariç)
('Sponsor Dilekçesi ve Sponsorun Mesleki/Finansal Evrakları',
 'Anne, baba veya velinin gelir belgesi ve taahhütnamesi',
 'digital', 70, NULL, NULL, ARRAY['ogrenci'],
 ARRAY['Çalışma/İş Vizesi']),

-- Ev hanımı / çalışmıyor: sponsorluk yazısı
('Sponsorluk Yazısı ve Birinci Derece Yakının Finansal Evrakları',
 'Maaş/emekli bordrosu, banka dökümü, vergi levhası',
 'digital', 70, NULL, NULL,
 ARRAY['ev_hanimi','ev_hanimi_meslek','calismiyor'], NULL),

-- Kanada Eğitim/Öğrenci + ogrenci: şahsi banka
('Sponsor veya şahsın son 3 aylık şahsi banka hesap dökümü',
 'Banka kaşeli ve ıslak imzalı, Kanada için yeterli bakiye gösteren',
 'digital', 73, ARRAY['Kanada'], ARRAY['Eğitim/Öğrenci'], ARRAY['ogrenci'], NULL),

-- Kanada Eğitim/Öğrenci + ogrenci: gelir belgesi
('Sponsorun gelir / işyeri belgeleri',
 'Maaş bordrosu, vergi levhası veya emeklilik belgesi',
 'digital', 74, ARRAY['Kanada'], ARRAY['Eğitim/Öğrenci'], ARRAY['ogrenci'], NULL),

-- Amerika + ogrenci: sponsorluk taahhütnamesi
('Sponsorluk taahhütnamesi',
 'Anne, baba veya velinin öğrencinin seyahat ve eğitim masraflarını karşılayacağını belirten ıslak imzalı dilekçe',
 'digital', 70, ARRAY['Amerika Birleşik Devletleri'], NULL, ARRAY['ogrenci'], NULL);

-- FIX 2: Amerika + sirket_sahibi Bağkur satırı YOK — occupation_doc_packages'tan gelecek

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

ALTER TABLE public.standard_travel_docs    RENAME TO standard_travel_docs_backup;
ALTER TABLE public.occupation_doc_packages RENAME TO occupation_doc_packages_backup;
ALTER TABLE public.country_specific_docs   RENAME TO country_specific_docs_backup;
ALTER TABLE public.visa_package_rules      RENAME TO visa_package_rules_backup;
