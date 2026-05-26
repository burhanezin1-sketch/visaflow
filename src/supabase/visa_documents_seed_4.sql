-- visa_documents_seed_4.sql
-- Countries: İsveç, Portekiz, Romanya, Slovakya, Slovenya, Yunanistan
-- No DELETE — additions only

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('İsveç', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('İsveç', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('İsveç', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('İsveç', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İsveç', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('İsveç', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('İsveç', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('İsveç', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('İsveç', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('İsveç', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('İsveç', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('İsveç', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('İsveç', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İsveç', 'Ticari/İş', 'İsveç''teki iş ortağından davet mektubu', 'digital', 9),
('İsveç', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('İsveç', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('İsveç', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('İsveç', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('İsveç', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('İsveç', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('İsveç', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('İsveç', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('İsveç', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İsveç', 'Eğitim/Öğrenci', 'İsveç okul/üniversite kabul belgesi', 'digital', 9),
('İsveç', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('İsveç', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İsveç', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('İsveç', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 9),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('Portekiz', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Portekiz', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Portekiz', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Portekiz', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Portekiz', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Portekiz', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Portekiz', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Portekiz', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Portekiz', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Portekiz', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Portekiz', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Portekiz', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Portekiz', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Portekiz', 'Ticari/İş', 'Portekiz''deki iş ortağından davet mektubu', 'digital', 9),
('Portekiz', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Portekiz', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Portekiz', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Portekiz', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Portekiz', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Portekiz', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Portekiz', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Portekiz', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Portekiz', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Portekiz', 'Eğitim/Öğrenci', 'Portekiz okul/üniversite kabul belgesi', 'digital', 9),
('Portekiz', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Portekiz', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Portekiz', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Portekiz', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 9),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('Romanya', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Romanya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Romanya', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Romanya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Romanya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Romanya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Romanya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Romanya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Romanya', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Romanya', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Romanya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Romanya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Romanya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Romanya', 'Ticari/İş', 'Romanya''daki iş ortağından davet mektubu', 'digital', 9),
('Romanya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Romanya', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Romanya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Romanya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Romanya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Romanya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Romanya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Romanya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Romanya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Romanya', 'Eğitim/Öğrenci', 'Romanya okul/üniversite kabul belgesi', 'digital', 9),
('Romanya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Romanya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Romanya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Romanya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 9),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('Slovakya', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Slovakya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Slovakya', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Slovakya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovakya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Slovakya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Slovakya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Slovakya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Slovakya', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Slovakya', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Slovakya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Slovakya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Slovakya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovakya', 'Ticari/İş', 'Slovakya''daki iş ortağından davet mektubu', 'digital', 9),
('Slovakya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Slovakya', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Slovakya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Slovakya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Slovakya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Slovakya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Slovakya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Slovakya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Slovakya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovakya', 'Eğitim/Öğrenci', 'Slovakya okul/üniversite kabul belgesi', 'digital', 9),
('Slovakya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Slovakya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Slovakya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Slovakya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 9),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('Slovenya', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Slovenya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Slovenya', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Slovenya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovenya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Slovenya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Slovenya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Slovenya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Slovenya', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Slovenya', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Slovenya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Slovenya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Slovenya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovenya', 'Ticari/İş', 'Slovenya''daki iş ortağından davet mektubu', 'digital', 9),
('Slovenya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Slovenya', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Slovenya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Slovenya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Slovenya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Slovenya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Slovenya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Slovenya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Slovenya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovenya', 'Eğitim/Öğrenci', 'Slovenya okul/üniversite kabul belgesi', 'digital', 9),
('Slovenya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Slovenya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Slovenya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Slovenya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 9),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('Yunanistan', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Yunanistan', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Yunanistan', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Yunanistan', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Yunanistan', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Yunanistan', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Yunanistan', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Yunanistan', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Yunanistan', 'Turistik', 'SGK hizmet dökümü', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Yunanistan', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Yunanistan', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Yunanistan', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Yunanistan', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Yunanistan', 'Ticari/İş', 'Yunanistan''daki iş ortağından davet mektubu', 'digital', 9),
('Yunanistan', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Yunanistan', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Yunanistan', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Yunanistan', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Yunanistan', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Yunanistan', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Yunanistan', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Yunanistan', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Yunanistan', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Yunanistan', 'Eğitim/Öğrenci', 'Yunanistan okul/üniversite kabul belgesi', 'digital', 9),
('Yunanistan', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Yunanistan', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Yunanistan', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Yunanistan', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 7),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 9),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);
