-- visa_documents_seed_8.sql
-- Countries: Hollanda, Fransa, Danimarka, Finlandiya, Estonya, Hırvatistan, Japonya, Kanada, Güney Kore
-- No DELETE — additions only

-- ============================================================
-- HOLLANDA
-- ============================================================

-- HOLLANDA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Hollanda''daki ev sahibinden davet mektubu', 'digital', 10),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Hollanda', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- HOLLANDA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hollanda', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Hollanda', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Hollanda', 'Eğitim/Öğrenci', 'Hollanda okul/üniversite kabul belgesi', 'digital', 9),
('Hollanda', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Hollanda', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Hollanda', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- HOLLANDA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hollanda', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Hollanda', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Hollanda', 'Ticari/İş', 'Hollanda''daki iş ortağından davet mektubu', 'digital', 9),
('Hollanda', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Hollanda', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Hollanda', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Hollanda', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Hollanda', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- HOLLANDA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Hollanda', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Hollanda', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Hollanda', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hollanda', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hollanda', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hollanda', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Hollanda', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Hollanda', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Hollanda', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Hollanda', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Hollanda', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Hollanda', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- HOLLANDA - Çalışma/İş Vizesi (IND — GVVA / Kennismigrant 2026)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hollanda', 'Çalışma/İş Vizesi', 'IND Online Başvuru Portali (erkend referent — tanınmış referans işveren başlatır)', 'company', 1),
('Hollanda', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Hollanda', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Hollanda', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Hollanda', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Hollanda', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, İngilizce/Hollandaca tercümeli)', 'digital', 6),
('Hollanda', 'Çalışma/İş Vizesi', 'GVVA Onay Belgesi (Gecombineerde Vergunning voor Verblijf en Arbeid — IND tarafından verilen birleşik ikamet ve çalışma izni; Kennismigrant: ≥30 yaş için min. €5.688/ay brüt, <30 yaş için min. €4.171/ay brüt — IND tarafından yıllık güncellenir)', 'digital', 7),
('Hollanda', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Hollanda iş hukukuna uygun)', 'digital', 8),
('Hollanda', 'Çalışma/İş Vizesi', 'İşverenin IND tanınmış referans (erkend referent) belgesi', 'digital', 9),
('Hollanda', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı İngilizce/Hollandaca tercümesi', 'digital', 10),
('Hollanda', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 11),
('Hollanda', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 12),
('Hollanda', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 13),
('Hollanda', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 14),
('Hollanda', 'Çalışma/İş Vizesi', 'Sağlık sigortası (ziektekostenverzekering — Hollanda''ya varıştan itibaren 4 ay içinde zorunlu; işveren kayıt yapar)', 'digital', 15),
('Hollanda', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce veya Hollandaca)', 'digital', 16);

-- ============================================================
-- FRANSA
-- ============================================================

-- FRANSA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Attestation d''accueil (belediyeden onaylı davet belgesi — Fransa''daki ev sahibi belediyeye başvurarak alır)', 'digital', 10),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Fransa', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli, Apostilli)', 'digital', 12);

-- FRANSA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Fransa', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Fransa', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Fransa', 'Eğitim/Öğrenci', 'Fransız okul/üniversite kabul belgesi', 'digital', 9),
('Fransa', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Fransa', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Fransa', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- FRANSA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Fransa', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Fransa', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Fransa', 'Ticari/İş', 'Fransa''daki iş ortağından davet mektubu', 'digital', 9),
('Fransa', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Fransa', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Fransa', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Fransa', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Fransa', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- FRANSA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Fransa', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Fransa', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Fransa', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Fransa', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Fransa', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Fransa', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Fransa', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Fransa', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Fransa', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Fransa', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Fransa', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Fransa', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- FRANSA - Çalışma/İş Vizesi (France-Visas — Passeport Talent / Travailleur Salarié)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Fransa', 'Çalışma/İş Vizesi', 'France-Visas platformu üzerinden D Tipi Uzun Süreli Vize Başvurusu (online)', 'company', 1),
('Fransa', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Fransa', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Fransa', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Fransa', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Fransa', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Fransızca/İngilizce tercümeli)', 'digital', 6),
('Fransa', 'Çalışma/İş Vizesi', 'Çalışma İzni Onayı (Autorisation de Travail — DREETS tarafından işverene verilen izin; Passeport Talent kategorisinde bu adım gerekmez)', 'digital', 7),
('Fransa', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Fransız iş hukukuna uygun, Fransızca)', 'digital', 8),
('Fransa', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı Fransızca/İngilizce tercümesi', 'digital', 9),
('Fransa', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Fransa', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Fransa', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Fransa', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Fransa', 'Çalışma/İş Vizesi', 'Sağlık sigortası (Fransız zorunlu sistemine — sécurité sociale — geçişe kadar özel poliçe)', 'digital', 14),
('Fransa', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Fransızca)', 'digital', 15);

-- ============================================================
-- DANİMARKA
-- ============================================================

-- DANİMARKA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Danimarka', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Danimarka''daki ev sahibinden davet mektubu', 'digital', 10),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Danimarka', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- DANİMARKA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Danimarka', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Danimarka', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Danimarka', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Danimarka', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Danimarka', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Danimarka', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Danimarka', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Danimarka', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Danimarka', 'Eğitim/Öğrenci', 'Danimarka okul/üniversite kabul belgesi', 'digital', 9),
('Danimarka', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Danimarka', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Danimarka', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- DANİMARKA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Danimarka', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Danimarka', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Danimarka', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Danimarka', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Danimarka', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Danimarka', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Danimarka', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Danimarka', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Danimarka', 'Ticari/İş', 'Danimarka''daki iş ortağından davet mektubu', 'digital', 9),
('Danimarka', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Danimarka', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Danimarka', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Danimarka', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Danimarka', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- DANİMARKA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Danimarka', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Danimarka', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Danimarka', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Danimarka', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Danimarka', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Danimarka', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Danimarka', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Danimarka', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Danimarka', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Danimarka', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Danimarka', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Danimarka', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Danimarka', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- DANİMARKA - Çalışma/İş Vizesi (SIRI — Pay Limit Scheme / Positive List 2026)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Danimarka', 'Çalışma/İş Vizesi', 'SIRI Online Başvuru Portali (Styrelsen for International Rekruttering og Integration — işveren başlatır)', 'company', 1),
('Danimarka', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Danimarka', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Danimarka', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Danimarka', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Danimarka', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Danimarkaca/İngilizce tercümeli)', 'digital', 6),
('Danimarka', 'Çalışma/İş Vizesi', 'Çalışma ve İkamet İzni Onayı (SIRI tarafından verilen izin; Pay Limit Scheme: yıllık brüt min. DKK 465.000; Positive List kıtlık meslekleri: min. DKK 375.000 — yıllık güncellenir)', 'digital', 7),
('Danimarka', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Danimarka iş hukukuna uygun)', 'digital', 8),
('Danimarka', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı İngilizce/Danimarkaca tercümesi', 'digital', 9),
('Danimarka', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 10),
('Danimarka', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 11),
('Danimarka', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('Danimarka', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('Danimarka', 'Çalışma/İş Vizesi', 'Sağlık sigortası (Danimarka devlet sağlık kartı — sygesikringsbevis — alınana kadar özel poliçe)', 'digital', 14),
('Danimarka', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce veya Danimarkaca)', 'digital', 15);

-- ============================================================
-- FİNLANDİYA
-- ============================================================

-- FİNLANDİYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Finlandiya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Finlandiya''daki ev sahibinden davet mektubu', 'digital', 10),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Finlandiya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- FİNLANDİYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Finlandiya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Finlandiya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Finlandiya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Finlandiya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Finlandiya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Finlandiya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Finlandiya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Finlandiya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Finlandiya', 'Eğitim/Öğrenci', 'Finlandiya okul/üniversite kabul belgesi', 'digital', 9),
('Finlandiya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Finlandiya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Finlandiya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- FİNLANDİYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Finlandiya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Finlandiya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Finlandiya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Finlandiya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Finlandiya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Finlandiya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Finlandiya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Finlandiya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Finlandiya', 'Ticari/İş', 'Finlandiya''daki iş ortağından davet mektubu', 'digital', 9),
('Finlandiya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Finlandiya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Finlandiya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Finlandiya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Finlandiya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- FİNLANDİYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Finlandiya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Finlandiya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Finlandiya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Finlandiya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Finlandiya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Finlandiya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Finlandiya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Finlandiya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Finlandiya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Finlandiya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Finlandiya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Finlandiya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Finlandiya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- FİNLANDİYA - Çalışma/İş Vizesi (Migri — Enter Finland Portalı)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Finlandiya', 'Çalışma/İş Vizesi', 'Enter Finland Portalı üzerinden ikamet izni başvurusu (işveren ve çalışan birlikte doldurur — migri.fi)', 'company', 1),
('Finlandiya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Finlandiya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Finlandiya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Finlandiya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Finlandiya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Fince/İngilizce tercümeli)', 'digital', 6),
('Finlandiya', 'Çalışma/İş Vizesi', 'Çalışma ve İkamet İzni Onayı (Migri — Finnish Immigration Service tarafından verilen işverenkohtainen oleskelulupa)', 'digital', 7),
('Finlandiya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Finlandiya iş hukukuna uygun)', 'digital', 8),
('Finlandiya', 'Çalışma/İş Vizesi', 'İşverenin pazar testi belgesi (kıtlık listesi dışı meslekler için TE-palvelut iş ilanı kaydı)', 'digital', 9),
('Finlandiya', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı İngilizce/Fince tercümesi', 'digital', 10),
('Finlandiya', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 11),
('Finlandiya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 12),
('Finlandiya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 13),
('Finlandiya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 14),
('Finlandiya', 'Çalışma/İş Vizesi', 'Sağlık sigortası (Kela kapsamına girilene kadar özel poliçe)', 'digital', 15),
('Finlandiya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce veya Fince)', 'digital', 16);

-- ============================================================
-- ESTONYA
-- ============================================================

-- ESTONYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Estonya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Estonya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Estonya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Estonya''daki ev sahibinden davet mektubu', 'digital', 10),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Estonya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- ESTONYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Estonya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Estonya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Estonya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Estonya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Estonya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Estonya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Estonya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Estonya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Estonya', 'Eğitim/Öğrenci', 'Estonya okul/üniversite kabul belgesi', 'digital', 9),
('Estonya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Estonya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Estonya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- ESTONYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Estonya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Estonya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Estonya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Estonya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Estonya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Estonya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Estonya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Estonya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Estonya', 'Ticari/İş', 'Estonya''daki iş ortağından davet mektubu', 'digital', 9),
('Estonya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Estonya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Estonya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Estonya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Estonya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- ESTONYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Estonya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Estonya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Estonya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Estonya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Estonya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Estonya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Estonya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Estonya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Estonya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Estonya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Estonya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Estonya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Estonya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- ESTONYA - Çalışma/İş Vizesi (PPA — Geçici İkamet ve Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Estonya', 'Çalışma/İş Vizesi', 'eesti.ee / PPA Online Portali üzerinden geçici ikamet izni başvurusu (Politsei- ja Piirivalveamet)', 'company', 1),
('Estonya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Estonya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Estonya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Estonya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Estonya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Estonca/İngilizce tercümeli)', 'digital', 6),
('Estonya', 'Çalışma/İş Vizesi', 'Geçici İkamet ve Çalışma İzni (PPA tarafından verilen T-tipi ikamet izni)', 'digital', 7),
('Estonya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Estonya iş hukukuna uygun)', 'digital', 8),
('Estonya', 'Çalışma/İş Vizesi', 'İşverenin Töötamise register (çalışma kayıt sistemi) kaydı', 'digital', 9),
('Estonya', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı İngilizce/Estonca tercümesi', 'digital', 10),
('Estonya', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 11),
('Estonya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 12),
('Estonya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 13),
('Estonya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 14),
('Estonya', 'Çalışma/İş Vizesi', 'Sağlık sigortası (haigekassa kapsamına girilene kadar özel poliçe)', 'digital', 15),
('Estonya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce veya Estonca)', 'digital', 16);

-- ============================================================
-- HIRVATİSTAN
-- ============================================================

-- HIRVATİSTAN - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Hırvatistan''daki ev sahibinden davet mektubu', 'digital', 10),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('Hırvatistan', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- HIRVATİSTAN - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hırvatistan', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Hırvatistan', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Hırvatistan', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Hırvatistan', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hırvatistan', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hırvatistan', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hırvatistan', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Hırvatistan', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Hırvatistan', 'Eğitim/Öğrenci', 'Hırvat okul/üniversite kabul belgesi', 'digital', 9),
('Hırvatistan', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Hırvatistan', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Hırvatistan', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- HIRVATİSTAN - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hırvatistan', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Hırvatistan', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Hırvatistan', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Hırvatistan', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hırvatistan', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hırvatistan', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hırvatistan', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Hırvatistan', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('Hırvatistan', 'Ticari/İş', 'Hırvatistan''daki iş ortağından davet mektubu', 'digital', 9),
('Hırvatistan', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Hırvatistan', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Hırvatistan', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Hırvatistan', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Hırvatistan', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- HIRVATİSTAN - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hırvatistan', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Hırvatistan', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Hırvatistan', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Hırvatistan', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Hırvatistan', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('Hırvatistan', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Hırvatistan', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Hırvatistan', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Hırvatistan', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Hırvatistan', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('Hırvatistan', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Hırvatistan', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Hırvatistan', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- HIRVATİSTAN - Çalışma/İş Vizesi (MUP — Birleşik İkamet ve Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Hırvatistan', 'Çalışma/İş Vizesi', 'eVisaHR Portalı üzerinden birleşik ikamet ve çalışma izni başvurusu (MUP — Ministarstvo unutarnjih poslova, işveren başlatır)', 'company', 1),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('Hırvatistan', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Hırvatistan', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Hırvatça/İngilizce tercümeli)', 'digital', 6),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Birleşik İkamet ve Çalışma İzni (MUP tarafından verilen jedinstvena dozvola)', 'digital', 7),
('Hırvatistan', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Hırvatistan iş hukukuna uygun, Hırvatça)', 'digital', 8),
('Hırvatistan', 'Çalışma/İş Vizesi', 'HZZ pazar testi belgesi (Hırvatistan İş Kurumu iş ilanı kaydı — kıtlık listesi dışı meslekler için)', 'digital', 9),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı Hırvatça/İngilizce tercümesi', 'digital', 10),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 11),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 12),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 13),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 14),
('Hırvatistan', 'Çalışma/İş Vizesi', 'Sağlık sigortası (HZZO kapsamına girilene kadar özel poliçe)', 'digital', 15),
('Hırvatistan', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Hırvatça veya İngilizce)', 'digital', 16);

-- ============================================================
-- JAPONYA
-- ============================================================

-- JAPONYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Japonya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (Japon Büyükelçiliği formu — imzalı)', 'company', 5),
('Japonya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası', 'digital', 8),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Japonya''daki ev sahibinden davet mektubu (Japonca + İngilizce tercümeli)', 'digital', 10),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin yabancı kayıt kartı (Zairyu Card) veya ikamet belgesi fotokopisi', 'digital', 11),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- JAPONYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Japonya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Japonya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Japonya', 'Eğitim/Öğrenci', 'Vize başvuru formu (Japon Büyükelçiliği formu — imzalı)', 'company', 5),
('Japonya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Japonya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Japonya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası', 'digital', 8),
('Japonya', 'Eğitim/Öğrenci', 'Japon okul/üniversite kabul belgesi', 'digital', 9),
('Japonya', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 10),
('Japonya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Japonya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12),
('Japonya', 'Eğitim/Öğrenci', 'İkamet Durumu Belgesi (COE — Certificate of Eligibility; okul Japonya İmmigrasyon Ajansı''na başvurarak alır)', 'digital', 13);

-- JAPONYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Japonya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Japonya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Japonya', 'Ticari/İş', 'Vize başvuru formu (Japon Büyükelçiliği formu — imzalı)', 'company', 5),
('Japonya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Japonya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Japonya', 'Ticari/İş', 'Seyahat sağlık sigortası', 'digital', 8),
('Japonya', 'Ticari/İş', 'Japonya''daki iş ortağından davet mektubu (Japonca + İngilizce tercümeli)', 'digital', 9),
('Japonya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Japonya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Japonya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Japonya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Japonya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- JAPONYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Japonya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Japonya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Japonya', 'Turistik', 'Vize başvuru formu (Japon Büyükelçiliği formu — imzalı)', 'company', 5),
('Japonya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Japonya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Japonya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Japonya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Japonya', 'Turistik', 'Seyahat güzergahı (itinerary)', 'digital', 10),
('Japonya', 'Turistik', 'Seyahat sağlık sigortası', 'digital', 11),
('Japonya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Japonya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 13),
('Japonya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- JAPONYA - Çalışma/İş Vizesi (Mühendis / Beşeri Bilimler Uzmanı — COE sistemi)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Çalışma/İş Vizesi', 'Japon Büyükelçiliği''nden Çalışma Vizesi Başvuru Formu (kategori: Mühendis/Beşeri Bilimler Uzmanı/Uluslararası Hizmetler)', 'company', 1),
('Japonya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 6 ay geçerli)', 'physical', 2),
('Japonya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Japonya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Japonya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Japonya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Japonca/İngilizce tercümeli)', 'digital', 6),
('Japonya', 'Çalışma/İş Vizesi', 'COE — Certificate of Eligibility / İkamet Durumu Belgesi (Japonya''daki işveren İmmigrasyon Ajansı''na başvurarak alır; onay mektubu konsoloslukta ibraz edilir)', 'digital', 7),
('Japonya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (Japonca + İngilizce tercümeli)', 'digital', 8),
('Japonya', 'Çalışma/İş Vizesi', 'İşverenin Japonya şirket sicil belgesi (Touki Jiko Shomeisho)', 'digital', 9),
('Japonya', 'Çalışma/İş Vizesi', 'Görev tanımı / pozisyon açıklaması', 'digital', 10),
('Japonya', 'Çalışma/İş Vizesi', 'Diplomanın aslı + konsoloslukça onaylı Japonca/İngilizce tercümesi', 'digital', 11),
('Japonya', 'Çalışma/İş Vizesi', 'Transkript + tercümesi', 'digital', 12),
('Japonya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli + tercümesi)', 'digital', 13),
('Japonya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 14),
('Japonya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 15),
('Japonya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce veya Japonca)', 'digital', 16);

-- ============================================================
-- KANADA
-- ============================================================

-- KANADA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Kanada', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Geçici İkamet Vizesi (TRV) başvuru formu (IRCC online portal)', 'company', 5),
('Kanada', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası', 'digital', 8),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Kanada''daki ev sahibinden davet mektubu', 'digital', 10),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / ikamet izni fotokopisi', 'digital', 11),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Biyometrik veri toplama (parmak izi + fotoğraf — Visa Application Centre''da)', 'digital', 13);

-- KANADA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Kanada', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Kanada', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Eğitim/Öğrenci', 'Öğrenci İzni (Study Permit) başvuru formu (IRCC online portal)', 'company', 5),
('Kanada', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Kanada', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Kanada', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası', 'digital', 8),
('Kanada', 'Eğitim/Öğrenci', 'Kanada okul/üniversite kabul belgesi (Letter of Acceptance)', 'digital', 9),
('Kanada', 'Eğitim/Öğrenci', 'Provincial Attestation Letter (PAL) — çoğu lisans/önlisans programı için zorunlu', 'digital', 10),
('Kanada', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 11),
('Kanada', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 12),
('Kanada', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 6 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13),
('Kanada', 'Eğitim/Öğrenci', 'Biyometrik veri toplama (parmak izi + fotoğraf — VAC''ta)', 'digital', 14);

-- KANADA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Kanada', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Kanada', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Ticari/İş', 'Geçici İkamet Vizesi (TRV) başvuru formu (IRCC online portal)', 'company', 5),
('Kanada', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Kanada', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Kanada', 'Ticari/İş', 'Seyahat sağlık sigortası', 'digital', 8),
('Kanada', 'Ticari/İş', 'Kanada''daki iş ortağından davet mektubu', 'digital', 9),
('Kanada', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Kanada', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Kanada', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Kanada', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Kanada', 'Ticari/İş', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14),
('Kanada', 'Ticari/İş', 'Biyometrik veri toplama (parmak izi + fotoğraf — VAC''ta)', 'digital', 15);

-- KANADA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Kanada', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Kanada', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Turistik', 'Geçici İkamet Vizesi (TRV) başvuru formu (IRCC online portal)', 'company', 5),
('Kanada', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Kanada', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Kanada', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Kanada', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Kanada', 'Turistik', 'Seyahat sağlık sigortası', 'digital', 10),
('Kanada', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('Kanada', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('Kanada', 'Turistik', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13),
('Kanada', 'Turistik', 'Biyometrik veri toplama (parmak izi + fotoğraf — VAC''ta)', 'digital', 14);

-- KANADA - Çalışma/İş Vizesi (IRCC — LMIA Tabanlı Çalışma İzni)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Çalışma/İş Vizesi', 'IRCC Online Çalışma İzni Başvurusu (işveren LMIA aldıktan sonra çalışan başvurur)', 'company', 1),
('Kanada', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 6 ay geçerli)', 'physical', 2),
('Kanada', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Kanada', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Kanada', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Kanada', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, İngilizce/Fransızca tercümeli)', 'digital', 6),
('Kanada', 'Çalışma/İş Vizesi', 'LMIA Onay Belgesi (Labour Market Impact Assessment — ESDC/Service Canada tarafından işverene verilen izin) veya LMIA-exempt iş teklif onayı', 'digital', 7),
('Kanada', 'Çalışma/İş Vizesi', 'İş sözleşmesi / İş Teklif Belgesi (İngilizce veya Fransızca)', 'digital', 8),
('Kanada', 'Çalışma/İş Vizesi', 'ECA Raporu — Educational Credential Assessment (WES veya ICAS gibi IRCC onaylı kurum tarafından)', 'digital', 9),
('Kanada', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + İngilizce/Fransızca tercümesi', 'digital', 10),
('Kanada', 'Çalışma/İş Vizesi', 'Transkript + tercümesi', 'digital', 11),
('Kanada', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli + tercümesi)', 'digital', 12),
('Kanada', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 13),
('Kanada', 'Çalışma/İş Vizesi', 'Son 6 aylık banka hesap dökümü (yeterli geçim kaynağı kanıtı)', 'digital', 14),
('Kanada', 'Çalışma/İş Vizesi', 'Sağlık muayenesi (IRCC onaylı hekim — designated physician)', 'digital', 15),
('Kanada', 'Çalışma/İş Vizesi', 'Biyometrik veri toplama (parmak izi + fotoğraf — VAC''ta)', 'digital', 16),
('Kanada', 'Çalışma/İş Vizesi', 'IELTS veya CELPIP (İngilizce) / TEF veya TCF (Fransızca) dil testi sonuç belgesi', 'digital', 17),
('Kanada', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce veya Fransızca)', 'digital', 18);

-- ============================================================
-- GÜNEY KORE
-- ============================================================

-- GÜNEY KORE - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('Güney Kore', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (C-3 kısa süreli ziyaret vizesi — Kore Büyükelçiliği formu)', 'company', 5),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası', 'digital', 8),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Güney Kore''deki ev sahibinden davet mektubu', 'digital', 10),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin yabancı kayıt kartı (ARC) veya ikamet belgesi fotokopisi', 'digital', 11),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- GÜNEY KORE - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('Güney Kore', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('Güney Kore', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Güney Kore', 'Eğitim/Öğrenci', 'Vize başvuru formu (D-2 üniversite öğrencisi / D-4 dil okulu — Kore Büyükelçiliği formu)', 'company', 5),
('Güney Kore', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Güney Kore', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('Güney Kore', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası', 'digital', 8),
('Güney Kore', 'Eğitim/Öğrenci', 'Güney Kore okul/üniversite kabul belgesi', 'digital', 9),
('Güney Kore', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('Güney Kore', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Güney Kore', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- GÜNEY KORE - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('Güney Kore', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('Güney Kore', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Güney Kore', 'Ticari/İş', 'Vize başvuru formu (C-3-4 kısa süreli iş vizesi — Kore Büyükelçiliği formu)', 'company', 5),
('Güney Kore', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('Güney Kore', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Güney Kore', 'Ticari/İş', 'Seyahat sağlık sigortası', 'digital', 8),
('Güney Kore', 'Ticari/İş', 'Güney Kore''deki iş ortağından davet mektubu', 'digital', 9),
('Güney Kore', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('Güney Kore', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('Güney Kore', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('Güney Kore', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('Güney Kore', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- GÜNEY KORE - Turistik (Türk vatandaşları 90 güne kadar vizesiz — K-ETA zorunlu)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('Güney Kore', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('Güney Kore', 'Turistik', 'K-ETA başvurusu (Elektronik Seyahat İzni — k-eta.go.kr üzerinden online; Türk vatandaşları 90 güne kadar vizesiz, K-ETA zorunludur)', 'company', 4),
('Güney Kore', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 5),
('Güney Kore', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 6),
('Güney Kore', 'Turistik', 'Seyahat sağlık sigortası', 'digital', 7),
('Güney Kore', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 8),
('Güney Kore', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9);

-- GÜNEY KORE - Çalışma/İş Vizesi (E-7 Özel Meslekler Vizesi — HiKorea)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Çalışma/İş Vizesi', 'HiKorea platformu üzerinden E-7 Vize Başvurusu (işveren başlatır — hikorea.go.kr)', 'company', 1),
('Güney Kore', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 6 ay geçerli)', 'physical', 2),
('Güney Kore', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('Güney Kore', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('Güney Kore', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('Güney Kore', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, Korece/İngilizce tercümeli)', 'digital', 6),
('Güney Kore', 'Çalışma/İş Vizesi', 'Standart İş Sözleşmesi (E-7 kategorisi; işveren ve çalışan imzalı; Kore Çalışma ve İstihdam Bakanlığı onaylı format)', 'digital', 7),
('Güney Kore', 'Çalışma/İş Vizesi', 'İşverenin İş Yeri Kayıt Sertifikası (Saeop Jasil Pyeongmyeong Seomyeong)', 'digital', 8),
('Güney Kore', 'Çalışma/İş Vizesi', 'İşveren vergi sertifikası', 'digital', 9),
('Güney Kore', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı Korece/İngilizce tercümesi', 'digital', 10),
('Güney Kore', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 11),
('Güney Kore', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli + tercümesi)', 'digital', 12),
('Güney Kore', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 13),
('Güney Kore', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 14),
('Güney Kore', 'Çalışma/İş Vizesi', 'TOPIK (Test of Proficiency in Korean) belgesi (varsa — tercih sebebi)', 'digital', 15),
('Güney Kore', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (Korece veya İngilizce)', 'digital', 16);
