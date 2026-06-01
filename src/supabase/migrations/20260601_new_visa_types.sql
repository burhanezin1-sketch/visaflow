-- ============================================================
-- 20260601_new_visa_types.sql
-- 5 yeni vize türü: Transit, Tedavi/Sağlık, Kültürel, Resmi,
-- Aile Birleşimi — kural + evrak ekleme
--
-- NOT: visa_package_rules'ta bu türlerin çoğu zaten
-- 20260601_visa_package_rules.sql ile eklenmişti.
-- INSERT OR IGNORE benzeri davranış için ON CONFLICT yapısı
-- yerine önce DELETE + INSERT kullanıldı (idempotent).
-- ============================================================


-- ── 1. visa_package_rules — yeni kurallar ────────────────────
-- Mevcut kayıtları temizle (idempotent)
DELETE FROM public.visa_package_rules
WHERE visa_type IN (
  'Transit Vize',
  'Tedavi/Sağlık Vizesi',
  'Kültürel Vize',
  'Resmi Vize',
  'Aile Birleşimi Vizesi'
);

INSERT INTO public.visa_package_rules
  (visa_type, occupation, package_name, priority)
VALUES
-- Transit Vize — meslek paketi yok
('Transit Vize',          NULL,             'none',          1),

-- Tedavi/Sağlık Vizesi — tüm meslekler ev_hanimi (finansal evraklar)
('Tedavi/Sağlık Vizesi',  NULL,             'ev_hanimi',     1),

-- Kültürel Vize
('Kültürel Vize',         NULL,             'ev_hanimi',     1),

-- Resmi Vize
('Resmi Vize',            NULL,             'ev_hanimi',     1),

-- Aile Birleşimi Vizesi
('Aile Birleşimi Vizesi', 'calisan',        'calisan',       1),
('Aile Birleşimi Vizesi', 'sirket_sahibi',  'sirket_sahibi', 1),
('Aile Birleşimi Vizesi', 'serbest_meslek', 'sirket_sahibi', 1),
('Aile Birleşimi Vizesi', 'emekli',         'emekli',        1),
('Aile Birleşimi Vizesi', 'calismiyor',     'ev_hanimi',     1),
('Aile Birleşimi Vizesi', 'ev_hanimi',      'ev_hanimi',     1),
('Aile Birleşimi Vizesi', 'ogrenci',        'ev_hanimi',     1),
('Aile Birleşimi Vizesi', NULL,             'ev_hanimi',     2);  -- fallback


-- ── 2. country_specific_docs — yeni evraklar ─────────────────
-- Mevcut kayıtları temizle (idempotent)
DELETE FROM public.country_specific_docs
WHERE visa_type IN (
  'Transit Vize',
  'Tedavi/Sağlık Vizesi',
  'Kültürel Vize',
  'Resmi Vize',
  'Aile Birleşimi Vizesi'
);


-- ── TRANSİT VİZE ─────────────────────────────────────────────

-- Genel (tüm ülkeler)
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  (NULL, 'Transit Vize', 'Transit vize başvuru formu (imzalı)',                     'firma',   1),
  (NULL, 'Transit Vize', 'Bağlantı uçuşu rezervasyonu — giriş ve çıkış biletleri', 'digital', 2),
  (NULL, 'Transit Vize', 'Varış ülkesi için geçerli vize veya oturma izni',         'digital', 3),
  (NULL, 'Transit Vize', 'Seyahat sağlık sigortası',                                'digital', 4);

-- İngiltere — DATV
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('İngiltere', 'Transit Vize', 'DATV başvuru formu (Direct Airside Transit Visa — GOV.UK)', 'firma',   5),
  ('İngiltere', 'Transit Vize', 'Varış ülkesi vizesi veya oturma izni',                      'digital', 6);

-- Amerika — C-1 Transit
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Amerika Birleşik Devletleri', 'Transit Vize', 'DS-160 başvuru formu (C-1 Transit Vize — online)',  'firma',   5),
  ('Amerika Birleşik Devletleri', 'Transit Vize', 'Vize ücreti ödeme makbuzu',                        'digital', 6),
  ('Amerika Birleşik Devletleri', 'Transit Vize', 'Varış ülkesi vizesi veya uçuş bileti',             'digital', 7);


-- ── TEDAVİ / SAĞLIK VİZESİ ───────────────────────────────────

-- Genel (tüm ülkeler)
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  (NULL, 'Tedavi/Sağlık Vizesi', 'Schengen/ülke vize başvuru formu (imzalı)',                        'firma',   1),
  (NULL, 'Tedavi/Sağlık Vizesi', 'Tedavi göreceği hastaneden randevu / davet mektubu (orijinal)',    'digital', 2),
  (NULL, 'Tedavi/Sağlık Vizesi', 'Türk doktordan sevk mektubu (Türkçe + tercümeli)',                 'digital', 3),
  (NULL, 'Tedavi/Sağlık Vizesi', 'Tahmini tedavi maliyet belgesi (hastaneden)',                      'digital', 4),
  (NULL, 'Tedavi/Sağlık Vizesi', 'Seyahat sağlık sigortası (min. 30.000 €)',                         'digital', 5),
  (NULL, 'Tedavi/Sağlık Vizesi', 'Gidiş-dönüş uçak bileti rezervasyonu',                            'digital', 6),
  (NULL, 'Tedavi/Sağlık Vizesi', 'Hastane konaklama belgesi veya otel rezervasyonu',                 'digital', 7);

-- Amerika — B-2 Medical
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Amerika Birleşik Devletleri', 'Tedavi/Sağlık Vizesi', 'DS-160 başvuru formu (B-2 Medical — online)', 'firma',   8),
  ('Amerika Birleşik Devletleri', 'Tedavi/Sağlık Vizesi', 'Vize ücreti ödeme makbuzu (185 USD)',          'digital', 9);

-- İngiltere — Standard Visitor Medical
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('İngiltere', 'Tedavi/Sağlık Vizesi', 'UK Standard Visitor Visa formu (Medical — GOV.UK)', 'firma', 8);


-- ── KÜLTÜREL VİZE ─────────────────────────────────────────────

-- Genel (tüm ülkeler)
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  (NULL, 'Kültürel Vize', 'Schengen vize başvuru formu (imzalı)',                         'firma',   1),
  (NULL, 'Kültürel Vize', 'Davet eden kurum / organizasyondan resmi davet mektubu',        'digital', 2),
  (NULL, 'Kültürel Vize', 'Etkinlik / festival / sergi davetiyesi veya katılım belgesi',   'digital', 3),
  (NULL, 'Kültürel Vize', 'CV / Özgeçmiş (sanatçı, sporcu veya akademisyen)',             'digital', 4),
  (NULL, 'Kültürel Vize', 'Portfolyo veya performans belgeleri (varsa)',                   'digital', 5),
  (NULL, 'Kültürel Vize', 'Seyahat sağlık sigortası (min. 30.000 €)',                     'digital', 6),
  (NULL, 'Kültürel Vize', 'Gidiş-dönüş uçak bileti rezervasyonu',                        'digital', 7),
  (NULL, 'Kültürel Vize', 'Otel / konaklama rezervasyonu',                                'digital', 8);


-- ── RESMİ VİZE ───────────────────────────────────────────────

-- Genel (tüm ülkeler)
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  (NULL, 'Resmi Vize', 'Resmi vize başvuru formu (imzalı)',                           'firma',   1),
  (NULL, 'Resmi Vize', 'Görev / misyon belgesi (kurumdan imzalı ve mühürlü)',         'digital', 2),
  (NULL, 'Resmi Vize', 'Davet eden ülkenin kurumundan resmi davet yazısı',            'digital', 3),
  (NULL, 'Resmi Vize', 'Gidiş-dönüş uçak bileti rezervasyonu',                       'digital', 4),
  (NULL, 'Resmi Vize', 'Görev süresi ve amacını açıklayan yazı',                      'digital', 5);


-- ── AİLE BİRLEŞİMİ VİZESİ ────────────────────────────────────

-- Genel (tüm ülkeler — D tipi uzun süreli)
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  (NULL, 'Aile Birleşimi Vizesi', 'Ulusal (D Tipi) Vize Başvuru Formu (imzalı)',                            'firma',   1),
  (NULL, 'Aile Birleşimi Vizesi', 'Uluslararası evlenme kayıt örneği (Apostilli + tercümeli)',               'digital', 2),
  (NULL, 'Aile Birleşimi Vizesi', 'Eşin pasaport fotokopisi',                                               'digital', 3),
  (NULL, 'Aile Birleşimi Vizesi', 'Eşin oturma izni / vatandaşlık belgesi fotokopisi',                      'digital', 4),
  (NULL, 'Aile Birleşimi Vizesi', 'Eşin gelir belgesi / maaş bordrosu (yurt dışındaki)',                    'digital', 5),
  (NULL, 'Aile Birleşimi Vizesi', 'Eşin kira sözleşmesi veya tapu belgesi (yeterli konut kanıtı)',          'digital', 6),
  (NULL, 'Aile Birleşimi Vizesi', 'Adli sicil kaydı (Apostilli + tercümeli)',                               'digital', 7),
  (NULL, 'Aile Birleşimi Vizesi', 'Seyahat sağlık sigortası (min. 30.000 €)',                               'digital', 8);

-- Almanya — A1 dil şartı + biyometri
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Almanya', 'Aile Birleşimi Vizesi', 'Almanca dil yeterlilik belgesi A1 seviye (Goethe / TELC / ÖSD)', 'digital',  9),
  ('Almanya', 'Aile Birleşimi Vizesi', 'Biyometrik veri kayıt belgesi',                                  'physical', 10);

-- Fransa — A1-A2 dil şartı
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('Fransa', 'Aile Birleşimi Vizesi', 'Fransızca dil yeterlilik belgesi A1-A2 (DELF/TCF)', 'digital', 9);

-- İngiltere — UK Family Visa + İngilizce
INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  ('İngiltere', 'Aile Birleşimi Vizesi', 'UK Family Visa başvuru formu (GOV.UK online)',    'firma',   0),
  ('İngiltere', 'Aile Birleşimi Vizesi', 'İngilizce dil yeterlilik belgesi (IELTS A1 seviye)', 'digital', 9);
