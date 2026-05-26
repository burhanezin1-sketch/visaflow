-- visa_documents_seed_6.sql
-- Countries: Letonya, Litvanya, Lüksemburg, Macaristan, Malta, Polonya, Portekiz, Romanya, Slovakya, Slovenya, Yunanistan, Çekya, İngiltere
-- No DELETE — additions only

-- LETONYA
-- ============================================================

-- LETONYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Letonya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Letonya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Letonya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Letonya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- LETONYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Letonya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Letonya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Letonya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Letonya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Letonya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Letonya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Letonya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Letonya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Letonya', 'Eğitim/Öğrenci', 'Letonya okul/üniversite kabul belgesi', 'digital', 9),
('Letonya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Letonya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Letonya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- LETONYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Letonya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Letonya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Letonya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Letonya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Letonya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Letonya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Letonya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Letonya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Letonya', 'Ticari/İş', 'Letonya''daki iş ortağından davet mektubu', 'digital', 9),
('Letonya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Letonya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Letonya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Letonya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Letonya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- LETONYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Letonya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Letonya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Letonya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Letonya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Letonya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Letonya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Letonya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Letonya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Letonya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Letonya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Letonya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Letonya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Letonya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- LETONYA - Çalışma/İş Vizesi (D Tipi İkamet ve Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Letonya', 'Çalışma/İş Vizesi', 'Ulusal D Vize Başvuru Formu (Online EPV — e-migration.gov.lv portalı)', 'company', 1),
('Letonya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Letonya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Letonya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Letonya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Letonya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Letonca/İngilizce tercümeli)', 'digital', 6),
('Letonya', 'Çalışma/İş Vizesi', 'OCMA (Pilsonības un migrācijas lietu pārvalde) Onaylı Davetiye Mektubu (işverenin Letonya''da onaylattığı resmi sponsorluk davetiyesi)', 'digital', 7),
('Letonya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Letonya ortalama brüt maaş sınırının altında kalmayan ücret — 2026 asgari ücret: brüt 700 €/ay)', 'digital', 8),
('Letonya', 'Çalışma/İş Vizesi', 'Diploma (Letonya''da tanınmış AIC/AIKNC onaylı denklik belgesi)', 'digital', 9),
('Letonya', 'Çalışma/İş Vizesi', 'Mesleki yeterlilik ve deneyim belgeleri (tercümeli, Apostilli)', 'digital', 10),
('Letonya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli, tercümeli)', 'digital', 11),
('Letonya', 'Çalışma/İş Vizesi', 'Konaklama belgesi (kira sözleşmesi veya konaklama adresi beyanı)', 'digital', 12),
('Letonya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Letonya', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Letonya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş', 'digital', 15);

-- ============================================================
-- LİTVANYA
-- ============================================================

-- LİTVANYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Litvanya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Litvanya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- LİTVANYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Litvanya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Litvanya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Litvanya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Litvanya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Litvanya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Litvanya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Litvanya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Litvanya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Litvanya', 'Eğitim/Öğrenci', 'Litvanya okul/üniversite kabul belgesi', 'digital', 9),
('Litvanya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Litvanya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Litvanya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- LİTVANYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Litvanya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Litvanya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Litvanya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Litvanya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Litvanya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Litvanya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Litvanya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Litvanya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Litvanya', 'Ticari/İş', 'Litvanya''daki iş ortağından davet mektubu', 'digital', 9),
('Litvanya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Litvanya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Litvanya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Litvanya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Litvanya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- LİTVANYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Litvanya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Litvanya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Litvanya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Litvanya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Litvanya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Litvanya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Litvanya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Litvanya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Litvanya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Litvanya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Litvanya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Litvanya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Litvanya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- LİTVANYA - Çalışma/İş Vizesi (MIGRIS — Çalışma İzni ve Ulusal Vize)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Litvanya', 'Çalışma/İş Vizesi', 'MIGRIS Portalı üzerinden Elektronik Başvuru Formu (migris.lt)', 'company', 1),
('Litvanya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Litvanya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Litvanya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Litvanya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Litvanya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Litvanca/İngilizce tercümeli)', 'digital', 6),
('Litvanya', 'Çalışma/İş Vizesi', 'Litvanya İstihdam Hizmetleri (Užimtumo tarnyba) Onay Belgesi (yabancının istihdamına izin veren resmi karar yazısı)', 'digital', 7),
('Litvanya', 'Çalışma/İş Vizesi', 'İşverenin Taahhüt Mektubu (çalışanın asgari ücret standartlarında istihdam edileceğini onaylar — 2026 brüt asgari ücret: 1.038 €/ay)', 'digital', 8),
('Litvanya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (tercümeli)', 'digital', 9),
('Litvanya', 'Çalışma/İş Vizesi', 'Mesleki yeterlilik belgeleri (son 2-5 yıla ait iş deneyimi ve diploma tercümeleri — Apostilli)', 'digital', 10),
('Litvanya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli, tercümeli)', 'digital', 11),
('Litvanya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Litvanya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Litvanya', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Litvanya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş', 'digital', 15);

-- ============================================================
-- LÜKSEMBURG
-- ============================================================

-- LÜKSEMBURG - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Lüksemburg', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- LÜKSEMBURG - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Lüksemburg', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Lüksemburg', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Lüksemburg', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Lüksemburg', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Lüksemburg', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Lüksemburg', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Lüksemburg', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Lüksemburg', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Lüksemburg', 'Eğitim/Öğrenci', 'Lüksemburg okul/üniversite kabul belgesi', 'digital', 9),
('Lüksemburg', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Lüksemburg', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Lüksemburg', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- LÜKSEMBURG - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Lüksemburg', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Lüksemburg', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Lüksemburg', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Lüksemburg', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Lüksemburg', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Lüksemburg', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Lüksemburg', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Lüksemburg', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Lüksemburg', 'Ticari/İş', 'Lüksemburg''daki iş ortağından davet mektubu', 'digital', 9),
('Lüksemburg', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Lüksemburg', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Lüksemburg', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Lüksemburg', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Lüksemburg', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- LÜKSEMBURG - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Lüksemburg', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Lüksemburg', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Lüksemburg', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Lüksemburg', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Lüksemburg', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Lüksemburg', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Lüksemburg', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Lüksemburg', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Lüksemburg', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Lüksemburg', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Lüksemburg', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Lüksemburg', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Lüksemburg', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- LÜKSEMBURG - Çalışma/İş Vizesi (D Tipi Ulusal Vize — İkamet ve Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Lüksemburg', 'Çalışma/İş Vizesi', 'Lüksemburg Büyükelçiliği''nden D Tipi Ulusal Vize Başvuru Formu', 'company', 1),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Lüksemburg', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Lüksemburg', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Fransızca/Almanca/İngilizce tercümeli)', 'digital', 6),
('Lüksemburg', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Lüksemburg iş hukukuna uygun)', 'digital', 7),
('Lüksemburg', 'Çalışma/İş Vizesi', 'İşveren onay belgesi / çalışma izni (Direction de l''Immigration''dan)', 'digital', 8),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Konaklama belgesi (kira sözleşmesi)', 'digital', 12),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Lüksemburg', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Fransızca, Almanca veya İngilizce)', 'digital', 15),
('Lüksemburg', 'Çalışma/İş Vizesi', 'Motivasyon mektubu', 'digital', 16);

-- ============================================================
-- MACARİSTAN
-- ============================================================

-- MACARİSTAN - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Macaristan', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Macaristan', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- MACARİSTAN - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Macaristan', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Macaristan', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Macaristan', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Macaristan', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Macaristan', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Macaristan', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Macaristan', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Macaristan', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Macaristan', 'Eğitim/Öğrenci', 'Macaristan okul/üniversite kabul belgesi', 'digital', 9),
('Macaristan', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Macaristan', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Macaristan', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- MACARİSTAN - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Macaristan', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Macaristan', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Macaristan', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Macaristan', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Macaristan', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Macaristan', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Macaristan', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Macaristan', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Macaristan', 'Ticari/İş', 'Macaristan''daki iş ortağından davet mektubu', 'digital', 9),
('Macaristan', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Macaristan', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Macaristan', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Macaristan', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Macaristan', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- MACARİSTAN - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Macaristan', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Macaristan', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Macaristan', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Macaristan', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Macaristan', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Macaristan', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Macaristan', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Macaristan', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Macaristan', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Macaristan', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Macaristan', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Macaristan', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Macaristan', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- MACARİSTAN - Çalışma/İş Vizesi (D Tipi Ulusal Vize — Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Macaristan', 'Çalışma/İş Vizesi', 'D Tipi Ulusal Vize Başvuru Formu', 'company', 1),
('Macaristan', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Macaristan', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Macaristan', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Macaristan', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Macaristan', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Macarca/İngilizce tercümeli)', 'digital', 6),
('Macaristan', 'Çalışma/İş Vizesi', 'Macaristan Çalışma İzni (munkaügyi hatóság onayı — işveren tarafından alınır, pazar testi yapılmış)', 'digital', 7),
('Macaristan', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Macar iş hukukuna uygun, tercümeli)', 'digital', 8),
('Macaristan', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Macaristan', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Macaristan', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Macaristan', 'Çalışma/İş Vizesi', 'Konaklama belgesi (kira sözleşmesi)', 'digital', 12),
('Macaristan', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Macaristan', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Macaristan', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Macarca veya İngilizce)', 'digital', 15);

-- ============================================================
-- MALTA
-- ============================================================

-- MALTA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Malta', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Malta', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Malta', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Malta', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Malta', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Malta', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Malta', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Malta', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Malta', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Malta', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Malta', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Malta', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- MALTA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Malta', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Malta', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Malta', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Malta', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Malta', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Malta', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Malta', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Malta', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Malta', 'Eğitim/Öğrenci', 'Malta okul/üniversite kabul belgesi', 'digital', 9),
('Malta', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Malta', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Malta', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- MALTA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Malta', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Malta', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Malta', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Malta', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Malta', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Malta', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Malta', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Malta', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Malta', 'Ticari/İş', 'Malta''daki iş ortağından davet mektubu', 'digital', 9),
('Malta', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Malta', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Malta', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Malta', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Malta', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- MALTA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Malta', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Malta', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Malta', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Malta', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Malta', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Malta', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Malta', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Malta', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Malta', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Malta', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Malta', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Malta', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Malta', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- MALTA - Çalışma/İş Vizesi (Single Permit — Malta Çalışma ve İkamet İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Malta', 'Çalışma/İş Vizesi', 'Malta İş ve Eğitim Kurumu (MCAST/Jobsplus) üzerinden Başvuru Formu', 'company', 1),
('Malta', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Malta', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Malta', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Malta', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Malta', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Maltaca/İngilizce tercümeli)', 'digital', 6),
('Malta', 'Çalışma/İş Vizesi', 'İşveren sponsorluğu onayı / Tek İzin Belgesi (Jobsplus onaylı)', 'digital', 7),
('Malta', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Malta asgari ücret şartına uygun)', 'digital', 8),
('Malta', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Malta', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Malta', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Malta', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Malta', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Malta', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Malta', 'Çalışma/İş Vizesi', 'Sağlık sertifikası / tıbbi muayene belgesi', 'digital', 15),
('Malta', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce)', 'digital', 16);

-- ============================================================
-- POLONYA
-- ============================================================

-- POLONYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu (noter onaylı veya Polonya konsolosluk onaylı)', 'digital', 10),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Polonya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli, Apostilli)', 'digital', 12);

-- POLONYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Polonya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Polonya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Polonya', 'Eğitim/Öğrenci', 'Polonya okul/üniversite kabul belgesi', 'digital', 9),
('Polonya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Polonya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Polonya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- POLONYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Polonya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Polonya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Polonya', 'Ticari/İş', 'Polonya''daki iş ortağından davet mektubu', 'digital', 9),
('Polonya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Polonya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Polonya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Polonya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Polonya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- POLONYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Polonya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Polonya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Polonya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Polonya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Polonya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Polonya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Polonya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Polonya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Polonya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Polonya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Polonya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Polonya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- POLONYA - Çalışma/İş Vizesi (D Tipi Ulusal Vize — Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Polonya', 'Çalışma/İş Vizesi', 'D Tipi Ulusal Vize Başvuru Formu (konsülosluk portalı)', 'company', 1),
('Polonya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Polonya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Polonya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Polonya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Polonya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Lehçe/İngilizce tercümeli)', 'digital', 6),
('Polonya', 'Çalışma/İş Vizesi', 'Çalışma İzni (voivodeship ofisinden — Zezwolenie na pracę veya Zezwolenie na pobyt czasowy i pracę)', 'digital', 7),
('Polonya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Polonya iş hukukuna uygun, Apostilli)', 'digital', 8),
('Polonya', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Polonya', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Polonya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Polonya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Polonya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Polonya', 'Çalışma/İş Vizesi', 'Sağlık sigortası (ZUS veya özel, Polonya''da geçerli)', 'digital', 14),
('Polonya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Lehçe veya İngilizce)', 'digital', 15);

-- ============================================================
-- PORTEKİZ
-- ============================================================

-- PORTEKİZ - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Portekiz', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu (Portekizce)', 'digital', 10),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Portekiz', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- PORTEKİZ - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Portekiz', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Portekiz', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Portekiz', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Portekiz', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Portekiz', 'Eğitim/Öğrenci', 'Portekiz okul/üniversite kabul belgesi', 'digital', 9),
('Portekiz', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Portekiz', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Portekiz', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- PORTEKİZ - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Portekiz', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Portekiz', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Portekiz', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Portekiz', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Portekiz', 'Ticari/İş', 'Portekiz''deki iş ortağından davet mektubu', 'digital', 9),
('Portekiz', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Portekiz', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Portekiz', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Portekiz', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Portekiz', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- PORTEKİZ - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Portekiz', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Portekiz', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Portekiz', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Portekiz', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Portekiz', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Portekiz', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Portekiz', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Portekiz', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Portekiz', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Portekiz', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Portekiz', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Portekiz', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- PORTEKİZ - Çalışma/İş Vizesi (D3 Yüksek Nitelikli / İşçi Vizesi — AIMA 2026)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Portekiz', 'Çalışma/İş Vizesi', 'Portekiz Konsolosluğu''ndan Vize Başvuru Formu (online veya fiziksel)', 'company', 1),
('Portekiz', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 3 ay fazlası geçerli)', 'physical', 2),
('Portekiz', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Portekiz', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Portekiz', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Portekiz', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Portekizce/İngilizce tercümeli)', 'digital', 6),
('Portekiz', 'Çalışma/İş Vizesi', 'İş sözleşmesi veya işveren taahhütnamesi (Portekiz iş hukukuna uygun)', 'digital', 7),
('Portekiz', 'Çalışma/İş Vizesi', 'Portekiz İstihdam ve Mesleki Eğitim Enstitüsü (IEFP) onayı veya muafiyet belgesi', 'digital', 8),
('Portekiz', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Portekiz', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Portekiz', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Portekiz', 'Çalışma/İş Vizesi', 'Konaklama belgesi (kira sözleşmesi veya konaklama taahhütnamesi)', 'digital', 12),
('Portekiz', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3-6 ay, geçim kanıtı)', 'digital', 13),
('Portekiz', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Portekiz', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Portekizce veya İngilizce)', 'digital', 15),
('Portekiz', 'Çalışma/İş Vizesi', 'Gerekirse vergi sicil no (NIF) için belge', 'digital', 16);

-- ============================================================
-- ROMANYA
-- ============================================================

-- ROMANYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Romanya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Romanya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- ROMANYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Romanya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Romanya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Romanya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Romanya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Romanya', 'Eğitim/Öğrenci', 'Romanya okul/üniversite kabul belgesi', 'digital', 9),
('Romanya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Romanya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Romanya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- ROMANYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Romanya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Romanya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Romanya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Romanya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Romanya', 'Ticari/İş', 'Romanya''daki iş ortağından davet mektubu', 'digital', 9),
('Romanya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Romanya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Romanya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Romanya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Romanya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- ROMANYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Romanya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Romanya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Romanya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Romanya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Romanya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Romanya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Romanya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Romanya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Romanya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Romanya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Romanya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Romanya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- ROMANYA - Çalışma/İş Vizesi (D Tipi Uzun Süreli Çalışma Vizesi)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Romanya', 'Çalışma/İş Vizesi', 'D Tipi Uzun Süreli Çalışma Vizesi Başvuru Formu', 'company', 1),
('Romanya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Romanya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Romanya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Romanya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Romanya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Romence/İngilizce tercümeli)', 'digital', 6),
('Romanya', 'Çalışma/İş Vizesi', 'Romanya Çalışma Genel Müdürlüğü (IGI-ITM) Çalışma İzni (işveren alır)', 'digital', 7),
('Romanya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Romanya iş hukukuna uygun)', 'digital', 8),
('Romanya', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Romanya', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Romanya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Romanya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Romanya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Romanya', 'Çalışma/İş Vizesi', 'Sağlık sigortası', 'digital', 14),
('Romanya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Romence veya İngilizce)', 'digital', 15);

-- ============================================================
-- SLOVAKYA
-- ============================================================

-- SLOVAKYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Slovakya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Slovakya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- SLOVAKYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Slovakya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Slovakya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovakya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Slovakya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovakya', 'Eğitim/Öğrenci', 'Slovakya okul/üniversite kabul belgesi', 'digital', 9),
('Slovakya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Slovakya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Slovakya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- SLOVAKYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Slovakya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Slovakya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovakya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Slovakya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovakya', 'Ticari/İş', 'Slovakya''daki iş ortağından davet mektubu', 'digital', 9),
('Slovakya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Slovakya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Slovakya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Slovakya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Slovakya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- SLOVAKYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Slovakya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Slovakya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Slovakya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovakya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovakya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovakya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Slovakya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovakya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Slovakya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Slovakya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Slovakya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Slovakya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- SLOVAKYA - Çalışma/İş Vizesi (D Tipi Ulusal Vize — Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovakya', 'Çalışma/İş Vizesi', 'D Tipi Ulusal Vize Başvuru Formu', 'company', 1),
('Slovakya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Slovakya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Slovakya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Slovakya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Slovakya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Slovakça/İngilizce tercümeli)', 'digital', 6),
('Slovakya', 'Çalışma/İş Vizesi', 'Slovakya İş ve Sosyal İşler Bakanlığı Onayı (çalışma izni — işveren tarafından alınır)', 'digital', 7),
('Slovakya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Slovakya iş hukukuna uygun)', 'digital', 8),
('Slovakya', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Slovakya', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Slovakya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Slovakya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Slovakya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Slovakya', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Slovakya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş', 'digital', 15);

-- ============================================================
-- SLOVENYA
-- ============================================================

-- SLOVENYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Slovenya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Slovenya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- SLOVENYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Slovenya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Slovenya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovenya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Slovenya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovenya', 'Eğitim/Öğrenci', 'Slovenya okul/üniversite kabul belgesi', 'digital', 9),
('Slovenya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Slovenya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Slovenya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- SLOVENYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Slovenya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Slovenya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovenya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Slovenya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Slovenya', 'Ticari/İş', 'Slovenya''daki iş ortağından davet mektubu', 'digital', 9),
('Slovenya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Slovenya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Slovenya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Slovenya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Slovenya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- SLOVENYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Slovenya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Slovenya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Slovenya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Slovenya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Slovenya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Slovenya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Slovenya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Slovenya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Slovenya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Slovenya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Slovenya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Slovenya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- SLOVENYA - Çalışma/İş Vizesi (D Tipi Ulusal Vize — Enotno Dovoljenje)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Slovenya', 'Çalışma/İş Vizesi', 'D Tipi Ulusal Vize Başvuru Formu', 'company', 1),
('Slovenya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Slovenya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Slovenya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Slovenya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Slovenya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Slovence/İngilizce tercümeli)', 'digital', 6),
('Slovenya', 'Çalışma/İş Vizesi', 'Çalışma ve İkamet İzni Onayı — Enotno Dovoljenje (işverenin ZRSZ''den — Zavod RS za zaposlovanje — aldığı onay)', 'digital', 7),
('Slovenya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Slovenya iş hukukuna uygun)', 'digital', 8),
('Slovenya', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Slovenya', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Slovenya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Slovenya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Slovenya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Slovenya', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Slovenya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Slovence veya İngilizce)', 'digital', 15);

-- ============================================================
-- YUNANİSTAN
-- ============================================================

-- YUNANİSTAN - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Yunanistan', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Yunanistan', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- YUNANİSTAN - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Yunanistan', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Yunanistan', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Yunanistan', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Yunanistan', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Yunanistan', 'Eğitim/Öğrenci', 'Yunanistan okul/üniversite kabul belgesi', 'digital', 9),
('Yunanistan', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Yunanistan', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Yunanistan', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- YUNANİSTAN - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Yunanistan', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Yunanistan', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Yunanistan', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Yunanistan', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Yunanistan', 'Ticari/İş', 'Yunanistan''daki iş ortağından davet mektubu', 'digital', 9),
('Yunanistan', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Yunanistan', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Yunanistan', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Yunanistan', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Yunanistan', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- YUNANİSTAN - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Yunanistan', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Yunanistan', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Yunanistan', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Yunanistan', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Yunanistan', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Yunanistan', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Yunanistan', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Yunanistan', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Yunanistan', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Yunanistan', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Yunanistan', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Yunanistan', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- YUNANİSTAN - Çalışma/İş Vizesi (D Tipi Ulusal Vize — Çalışma ve İkamet İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Yunanistan', 'Çalışma/İş Vizesi', 'D Tipi Ulusal Vize Başvuru Formu', 'company', 1),
('Yunanistan', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Yunanistan', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Yunanistan', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Yunanistan', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Yunanistan', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Yunanca/İngilizce tercümeli)', 'digital', 6),
('Yunanistan', 'Çalışma/İş Vizesi', 'Çalışma İzni (işverenin Yunanistan Göç Dairesi''nden aldığı izin)', 'digital', 7),
('Yunanistan', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Yunan iş hukukuna uygun, tercümeli)', 'digital', 8),
('Yunanistan', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Yunanistan', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Yunanistan', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Yunanistan', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Yunanistan', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Yunanistan', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Yunanistan', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Yunanca veya İngilizce)', 'digital', 15);

-- ============================================================
-- ÇEKYA
-- ============================================================

-- ÇEKYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Çekya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Çekya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Çekya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu (Çek makamları tarafından doğrulanmış)', 'digital', 10),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Çekya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli, Apostilli)', 'digital', 12);

-- ÇEKYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Çekya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Çekya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Çekya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Çekya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Çekya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Çekya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Çekya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Çekya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Çekya', 'Eğitim/Öğrenci', 'Çekya okul/üniversite kabul belgesi', 'digital', 9),
('Çekya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Çekya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Çekya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- ÇEKYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Çekya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Çekya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Çekya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Çekya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Çekya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Çekya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Çekya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Çekya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Çekya', 'Ticari/İş', 'Çekya''daki iş ortağından davet mektubu', 'digital', 9),
('Çekya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Çekya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Çekya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Çekya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Çekya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- ÇEKYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Çekya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Çekya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Çekya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Çekya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Çekya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Çekya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Çekya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Çekya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Çekya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Çekya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Çekya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Çekya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Çekya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- ÇEKYA - Çalışma/İş Vizesi (D Tipi Uzun Süreli Vize — Zaměstnanecká karta)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Çekya', 'Çalışma/İş Vizesi', 'D Tipi Uzun Süreli Vize Başvuru Formu (Çalışan Kartı — online veya konsolosluk)', 'company', 1),
('Çekya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Çekya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Çekya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Çekya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Çekya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Çekçe/İngilizce tercümeli)', 'digital', 6),
('Çekya', 'Çalışma/İş Vizesi', 'Çalışan Kartı Başvurusu — Zaměstnanecká karta (işveren aracılığıyla Çek İçişleri Bakanlığı''na yapılır; pazar testi Merkezi Çalışanlar Kartı Sistemi üzerinden)', 'digital', 7),
('Çekya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Çek iş hukukuna uygun, Çekçe veya tercümeli)', 'digital', 8),
('Çekya', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 9),
('Çekya', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Çekya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Çekya', 'Çalışma/İş Vizesi', 'Konaklama belgesi (kira sözleşmesi)', 'digital', 12),
('Çekya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Çekya', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('Çekya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Çekçe veya İngilizce)', 'digital', 15);

-- ============================================================
-- İNGİLTERE
-- ============================================================

-- İNGİLTERE - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Biyometrik fotoğraf (dijital, UK Visas and Immigration standartları)', 'physical', 4),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (online, GOV.UK)', 'company', 5),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Davet mektubu (ev sahibinden, İngilizce)', 'digital', 10),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Vize ücreti ödeme makbuzu + İhraç Primi (IHS — Immigration Health Surcharge, 2026: yıllık £1.035)', 'digital', 13);

-- İNGİLTERE - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İngiltere', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('İngiltere', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('İngiltere', 'Eğitim/Öğrenci', 'Biyometrik fotoğraf (dijital)', 'physical', 4),
('İngiltere', 'Eğitim/Öğrenci', 'Vize başvuru formu (online, GOV.UK)', 'company', 5),
('İngiltere', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İngiltere', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İngiltere', 'Eğitim/Öğrenci', 'Confirmation of Acceptance for Studies (CAS) numarası', 'digital', 8),
('İngiltere', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 9),
('İngiltere', 'Eğitim/Öğrenci', 'İngilizce dil yeterlilik belgesi (IELTS / B2 seviye)', 'digital', 10),
('İngiltere', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İngiltere', 'Eğitim/Öğrenci', 'Son 28 günde kesintisiz min. £1.334 banka bakiyesi kanıtı', 'digital', 12),
('İngiltere', 'Eğitim/Öğrenci', 'Veli gelir belgesi / burs belgesi', 'digital', 13),
('İngiltere', 'Eğitim/Öğrenci', 'İhraç Primi (IHS — £1.035/yıl)', 'digital', 14);

-- İNGİLTERE - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İngiltere', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('İngiltere', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('İngiltere', 'Ticari/İş', 'Vize başvuru formu (online, GOV.UK)', 'company', 4),
('İngiltere', 'Ticari/İş', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('İngiltere', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İngiltere', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İngiltere', 'Ticari/İş', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 8),
('İngiltere', 'Ticari/İş', 'İngiltere''deki iş ortağından davet mektubu (şirket antetli)', 'digital', 9),
('İngiltere', 'Ticari/İş', 'İşveren görev yazısı (İngilizce)', 'digital', 10),
('İngiltere', 'Ticari/İş', 'Şirket faaliyet belgesi (İngilizce)', 'digital', 11),
('İngiltere', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('İngiltere', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('İngiltere', 'Ticari/İş', 'İmza sirküleri (tercümeli)', 'digital', 14),
('İngiltere', 'Ticari/İş', 'Vize dilekçesi (İngilizce, şirket antetli)', 'digital', 15);

-- İNGİLTERE - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Turistik', 'Pasaportun orijinali (+ varsa eski pasaportlar)', 'physical', 1),
('İngiltere', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('İngiltere', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('İngiltere', 'Turistik', 'Vize başvuru formu (online, GOV.UK)', 'company', 4),
('İngiltere', 'Turistik', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('İngiltere', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İngiltere', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İngiltere', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 8),
('İngiltere', 'Turistik', 'İşveren izin yazısı (görev, maaş, izin tarihleri)', 'digital', 9),
('İngiltere', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 10),
('İngiltere', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 11),
('İngiltere', 'Turistik', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12),
('İngiltere', 'Turistik', 'Vize dilekçesi (İngilizce, kişisel)', 'digital', 13);

-- İNGİLTERE - Çalışma/İş Vizesi (Skilled Worker Visa — 2026)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Çalışma/İş Vizesi', 'Online Vize Başvurusu (GOV.UK — İngiltere Skilled Worker uygulaması)', 'company', 1),
('İngiltere', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (vize süresince geçerli, en az 1 boş sayfa)', 'physical', 2),
('İngiltere', 'Çalışma/İş Vizesi', 'Biyometrik fotoğraf (dijital, UK standartları)', 'physical', 3),
('İngiltere', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('İngiltere', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('İngiltere', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, İngilizce tercümeli)', 'digital', 6),
('İngiltere', 'Çalışma/İş Vizesi', 'Certificate of Sponsorship (CoS) — Home Office onaylı işverenden; iş unvanı, maaş ve SOC kodu içerir', 'digital', 7),
('İngiltere', 'Çalışma/İş Vizesi', 'Maaş yeterliliği belgesi (2026: genel eşik yıllık brüt min. £41.700 veya meslekle ilgili going rate; yeni başlayanlar için £33.400)', 'digital', 8),
('İngiltere', 'Çalışma/İş Vizesi', 'İngilizce dil sertifikası (min. B2 seviye — IELTS SELT, TOEFL iBT veya dereceye göre muafiyet; 8 Ocak 2026''dan itibaren)', 'digital', 9),
('İngiltere', 'Çalışma/İş Vizesi', 'Diploma ve mesleki belgeler (Apostilli, İngilizce tercümeli)', 'digital', 10),
('İngiltere', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 28 günde kesintisiz min. £1.270 bakiye — CoS A-rated sponsorda sponsorlu ise muaf)', 'digital', 11),
('İngiltere', 'Çalışma/İş Vizesi', 'Immigration Health Surcharge (IHS) ödeme makbuzu (2026: yıllık £1.035; IHS ödendikten sonra NHS''e tam erişim sağlanır — ayrıca özel sağlık sigortası gerekmez)', 'digital', 12),
('İngiltere', 'Çalışma/İş Vizesi', 'Tüberküloz (TB) test sonucu (gerekli ülkelerden gelenlere uygulanır)', 'digital', 13),
('İngiltere', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli, İngilizce tercümeli)', 'digital', 14),
('İngiltere', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce)', 'digital', 15),
('İngiltere', 'Çalışma/İş Vizesi', 'Referans mektupları (eski işverenlerden)', 'digital', 16);
