DELETE FROM visa_documents;

-- ALMANYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Almanya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Almanya', 'Turistik', 'Pasaport fotokopisi (kimlik sayfası)', 'digital', 2),
('Almanya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Almanya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Almanya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Almanya', 'Turistik', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 6),
('Almanya', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Almanya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Almanya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Almanya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Almanya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Almanya', 'Turistik', 'SGK hizmet dökümü veya işveren yazısı', 'digital', 12),
('Almanya', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 13);

-- ALMANYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Almanya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Almanya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Almanya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Almanya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Almanya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Almanya', 'Ticari/İş', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 6),
('Almanya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 7),
('Almanya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Almanya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 9),
('Almanya', 'Ticari/İş', 'Almanya''daki iş ortağından davet mektubu', 'digital', 10),
('Almanya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 11),
('Almanya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Almanya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 13),
('Almanya', 'Ticari/İş', 'İmza sirküleri', 'digital', 14),
('Almanya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 15),
('Almanya', 'Ticari/İş', 'Maaş bordrosu (son 3 ay)', 'digital', 16),
('Almanya', 'Ticari/İş', 'İşveren görev yazısı (izin tarihleri dahil)', 'digital', 17);

-- ALMANYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Almanya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Almanya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Almanya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Almanya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Almanya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Almanya', 'Eğitim/Öğrenci', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 6),
('Almanya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 7),
('Almanya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Almanya', 'Eğitim/Öğrenci', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 9),
('Almanya', 'Eğitim/Öğrenci', 'Okul/üniversite kabul belgesi veya davet yazısı', 'digital', 10),
('Almanya', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 11),
('Almanya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 12),
('Almanya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 13),
('Almanya', 'Eğitim/Öğrenci', 'Veli gelir belgesi / maaş bordrosu', 'digital', 14);

-- ALMANYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Almanya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Almanya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 6),
('Almanya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 7),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 9),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Almanya''daki ev sahibinden davet mektubu (Verpflichtungserklärung)', 'digital', 10),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Akrabalık ilişkisini gösteren belge', 'digital', 12),
('Almanya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 13);

-- FRANSA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Fransa', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Fransa', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Fransa', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Fransa', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Fransa', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Fransa', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 12),
('Fransa', 'Turistik', 'SGK hizmet dökümü veya işveren yazısı', 'digital', 13);

-- FRANSA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Fransa', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Fransa', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Fransa', 'Ticari/İş', 'Fransa''daki iş ortağından davet mektubu', 'digital', 9),
('Fransa', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Fransa', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Fransa', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Fransa', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Fransa', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

-- FRANSA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Fransa', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Fransa', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Fransa', 'Eğitim/Öğrenci', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 9),
('Fransa', 'Eğitim/Öğrenci', 'Fransız okul/üniversite kabul belgesi', 'digital', 10),
('Fransa', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 11),
('Fransa', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 12),
('Fransa', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 13);

-- FRANSA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Attestation d''accueil (belediyeden onaylı kabul belgesi)', 'digital', 9),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 10),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

-- İTALYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Turistik', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 6),
('İtalya', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('İtalya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İtalya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('İtalya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('İtalya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('İtalya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('İtalya', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

-- İTALYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('İtalya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('İtalya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İtalya', 'Ticari/İş', 'İtalya''daki iş ortağından davet mektubu', 'digital', 9),
('İtalya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('İtalya', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('İtalya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('İtalya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('İtalya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

-- İTALYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('İtalya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('İtalya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İtalya', 'Eğitim/Öğrenci', 'İtalyan okul/üniversite kabul belgesi', 'digital', 9),
('İtalya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('İtalya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İtalya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

-- İTALYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 9),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 10),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

-- İSPANYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('İspanya', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('İspanya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İspanya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('İspanya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('İspanya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('İspanya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('İspanya', 'Turistik', 'SGK hizmet dökümü veya işveren izin yazısı', 'digital', 13);

-- İSPANYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('İspanya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('İspanya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İspanya', 'Ticari/İş', 'İspanya''daki iş ortağından davet mektubu', 'digital', 9),
('İspanya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('İspanya', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('İspanya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('İspanya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('İspanya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

-- İSPANYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('İspanya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('İspanya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İspanya', 'Eğitim/Öğrenci', 'İspanyol okul/üniversite kabul belgesi', 'digital', 9),
('İspanya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('İspanya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İspanya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

-- İSPANYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Carta de invitación (belediyeden onaylı davet mektubu)', 'digital', 9),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 10),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

-- HOLLANDA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Hollanda', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Hollanda', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Hollanda', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Hollanda', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Hollanda', 'Turistik', 'Son 3 aylık banka hesap dökümü (günlük min. 34 €)', 'digital', 11),
('Hollanda', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Hollanda', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

-- HOLLANDA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Hollanda', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Hollanda', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Hollanda', 'Ticari/İş', 'Hollanda''daki iş ortağından davet mektubu', 'digital', 9),
('Hollanda', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Hollanda', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Hollanda', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Hollanda', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Hollanda', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

-- HOLLANDA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Hollanda', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Hollanda', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Hollanda', 'Eğitim/Öğrenci', 'Hollanda okul/üniversite kabul belgesi', 'digital', 9),
('Hollanda', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Hollanda', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Hollanda', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

-- HOLLANDA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Hollanda''daki ev sahibinden davet mektubu', 'digital', 9),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 10),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

-- POLONYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Turistik', 'İkametgah belgesi', 'digital', 6),
('Polonya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Polonya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 8),
('Polonya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 9),
('Polonya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 10),
('Polonya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Polonya', 'Turistik', 'SGK hizmet dökümü', 'digital', 12);

-- POLONYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Polonya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Polonya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Polonya', 'Ticari/İş', 'Polonya''daki iş ortağından davet mektubu', 'digital', 9),
('Polonya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Polonya', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Polonya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Polonya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Polonya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

-- POLONYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Polonya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Polonya', 'Eğitim/Öğrenci', 'Polonya okul/üniversite kabul belgesi (Erasmus dahil)', 'digital', 8),
('Polonya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 9),
('Polonya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 10),
('Polonya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 11);

-- POLONYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Polonya''daki ev sahibinden davet mektubu', 'digital', 9),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 10),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);
