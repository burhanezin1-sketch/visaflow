-- visa_documents_seed_7.sql
-- Countries: İrlanda, İspanya, İsveç, İtalya
-- No DELETE — additions only

-- ============================================================
-- İRLANDA
-- ============================================================

-- İRLANDA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('İrlanda', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (online, AVATS sistemi)', 'company', 5),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası', 'digital', 8),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'İrlanda''daki ev sahibinden davet mektubu', 'digital', 10),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('İrlanda', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- İRLANDA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İrlanda', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İrlanda', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('İrlanda', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('İrlanda', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('İrlanda', 'Eğitim/Öğrenci', 'Vize başvuru formu (online, AVATS sistemi)', 'company', 5),
('İrlanda', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İrlanda', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İrlanda', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası', 'digital', 8),
('İrlanda', 'Eğitim/Öğrenci', 'İrlanda okul/üniversite kabul belgesi', 'digital', 9),
('İrlanda', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 10),
('İrlanda', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İrlanda', 'Eğitim/Öğrenci', 'Veli gelir belgesi', 'digital', 12),
('İrlanda', 'Eğitim/Öğrenci', 'Son 6 aylık veli/sponsor banka hesap dökümü (banka kaşeli/imzalı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- İRLANDA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İrlanda', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İrlanda', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('İrlanda', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('İrlanda', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('İrlanda', 'Ticari/İş', 'Vize başvuru formu (online, AVATS sistemi)', 'company', 5),
('İrlanda', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İrlanda', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İrlanda', 'Ticari/İş', 'Seyahat sağlık sigortası', 'digital', 8),
('İrlanda', 'Ticari/İş', 'İrlanda''daki iş ortağından davet mektubu', 'digital', 9),
('İrlanda', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('İrlanda', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('İrlanda', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('İrlanda', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('İrlanda', 'Ticari/İş', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- İRLANDA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İrlanda', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('İrlanda', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('İrlanda', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('İrlanda', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('İrlanda', 'Turistik', 'Vize başvuru formu (online, AVATS sistemi)', 'company', 5),
('İrlanda', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İrlanda', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İrlanda', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İrlanda', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('İrlanda', 'Turistik', 'Seyahat sağlık sigortası', 'digital', 10),
('İrlanda', 'Turistik', 'İşveren yazısı (izin belgesi dahil)', 'digital', 11),
('İrlanda', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 12),
('İrlanda', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 13),
('İrlanda', 'Turistik', 'Son 6 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- İRLANDA - Çalışma/İş Vizesi (Critical Skills Employment Permit — CSEP 2026)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İrlanda', 'Çalışma/İş Vizesi', 'AVATS sistemi üzerinden D Tipi Uzun Süreli Vize Başvurusu (online)', 'company', 1),
('İrlanda', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('İrlanda', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('İrlanda', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('İrlanda', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('İrlanda', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, İngilizce tercümeli)', 'digital', 6),
('İrlanda', 'Çalışma/İş Vizesi', 'Critical Skills Employment Permit (CSEP) Onay Belgesi (DETE''den): Kritik Meslekler Listesi rolleri min. €40.904/yıl; diğer roller min. €68.911/yıl (GEP''de min. €36.605/yıl — Mart 2026)', 'digital', 7),
('İrlanda', 'Çalışma/İş Vizesi', 'İş sözleşmesi (min. 2 yıllık, tam zamanlı)', 'digital', 8),
('İrlanda', 'Çalışma/İş Vizesi', 'İşverenin DETE kayıt belgesi', 'digital', 9),
('İrlanda', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 10),
('İrlanda', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 11),
('İrlanda', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 12),
('İrlanda', 'Çalışma/İş Vizesi', 'Konaklama belgesi (İrlanda''da adres)', 'digital', 13),
('İrlanda', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 6 ay)', 'digital', 14),
('İrlanda', 'Çalışma/İş Vizesi', 'Özel sağlık sigortası (vize başvurusu ve İrlanda''ya ilk girişi kapsar; işe başlayınca HSE kapsamına girilir)', 'digital', 15),
('İrlanda', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İngilizce)', 'digital', 16),
('İrlanda', 'Çalışma/İş Vizesi', 'Varışta: Garda National Immigration Bureau (GNIB) kaydı ve Irish Residence Permit (IRP) başvurusu', 'digital', 17);

-- ============================================================
-- İSPANYA
-- ============================================================

-- İSPANYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Carta de invitación (belediyeden onaylı davet mektubu)', 'digital', 10),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('İspanya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli, Apostilli)', 'digital', 12);

-- İSPANYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İspanya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İspanya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İspanya', 'Eğitim/Öğrenci', 'İspanyol okul/üniversite kabul belgesi', 'digital', 9),
('İspanya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('İspanya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İspanya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- İSPANYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İspanya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İspanya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İspanya', 'Ticari/İş', 'İspanya''daki iş ortağından davet mektubu', 'digital', 9),
('İspanya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('İspanya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('İspanya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('İspanya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('İspanya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- İSPANYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('İspanya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('İspanya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('İspanya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('İspanya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('İspanya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İspanya', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İspanya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İspanya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('İspanya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('İspanya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('İspanya', 'Turistik', 'SGK hizmet dökümü (e-devlet barkodlu) veya işveren izin yazısı', 'digital', 12),
('İspanya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- İSPANYA - Çalışma/İş Vizesi (Permiso de Trabajo — İşçi Vizesi 2026)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İspanya', 'Çalışma/İş Vizesi', 'İspanya Konsolosluğu''ndan D Tipi Uzun Süreli Vize Başvuru Formu', 'company', 1),
('İspanya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('İspanya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('İspanya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('İspanya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('İspanya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, İspanyolca/İngilizce tercümeli)', 'digital', 6),
('İspanya', 'Çalışma/İş Vizesi', 'Çalışma ve İkamet İzni Onayı (Autorización de Residencia y Trabajo — işverenin İspanya Sosyal Güvenlik ve Göç Dairesi''nden aldığı izin)', 'digital', 7),
('İspanya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (İspanyol iş hukukuna uygun, İspanyolca)', 'digital', 8),
('İspanya', 'Çalışma/İş Vizesi', 'İşverenin pazar testi / iş ilanı belgeleri (gerektiğinde)', 'digital', 9),
('İspanya', 'Çalışma/İş Vizesi', 'Diploma ve mesleki belgeler (Apostilli, İspanyolca tercümeli)', 'digital', 10),
('İspanya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli, İspanyolca tercümeli)', 'digital', 11),
('İspanya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('İspanya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('İspanya', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('İspanya', 'Çalışma/İş Vizesi', 'Biyometrik verilerin alınması (parmak izi — konsoloslukta)', 'digital', 15),
('İspanya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İspanyolca)', 'digital', 16);

-- ============================================================
-- İSVEÇ
-- ============================================================

-- İSVEÇ - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('İsveç', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu', 'digital', 10),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('İsveç', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli)', 'digital', 12);

-- İSVEÇ - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('İsveç', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('İsveç', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İsveç', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İsveç', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İsveç', 'Eğitim/Öğrenci', 'İsveç okul/üniversite kabul belgesi', 'digital', 9),
('İsveç', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('İsveç', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İsveç', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- İSVEÇ - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('İsveç', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('İsveç', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İsveç', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İsveç', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İsveç', 'Ticari/İş', 'İsveç''teki iş ortağından davet mektubu', 'digital', 9),
('İsveç', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('İsveç', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('İsveç', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('İsveç', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('İsveç', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- İSVEÇ - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('İsveç', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('İsveç', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('İsveç', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('İsveç', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('İsveç', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İsveç', 'Turistik', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İsveç', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İsveç', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('İsveç', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('İsveç', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('İsveç', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('İsveç', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- İSVEÇ - Çalışma/İş Vizesi (Migrationsverket — Çalışma İzni 2026)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İsveç', 'Çalışma/İş Vizesi', 'Migrationsverket Online Başvurusu (işveren başlatır, çalışan tamamlar)', 'company', 1),
('İsveç', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('İsveç', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('İsveç', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('İsveç', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('İsveç', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, İsveççe/İngilizce tercümeli)', 'digital', 6),
('İsveç', 'Çalışma/İş Vizesi', 'İş sözleşmesi (işveren ve çalışan imzalı; aylık brüt min. SEK 29.680 — Haz. 2026 öncesi başvurular; SEK 33.390 — Haz. 2026 ve sonrası kararlar, medyan maaşın %90''ı — 2026 yeni kural)', 'digital', 7),
('İsveç', 'Çalışma/İş Vizesi', 'İşverenin sendika görüşü belgesi (Migrationsverket''e sunulan)', 'digital', 8),
('İsveç', 'Çalışma/İş Vizesi', 'İşverenin sağladığı sigorta belgesi (sağlık, hayat, kaza, emeklilik — 1 Haziran 2026''dan itibaren zorunlu; 1 yıl ve altı sözleşmeler için kapsamlı özel sağlık sigortası da eklenmeli)', 'digital', 9),
('İsveç', 'Çalışma/İş Vizesi', 'Diplomanın Apostilli aslı + noterde onaylı hedef ülke dili veya İngilizce tercümesi', 'digital', 10),
('İsveç', 'Çalışma/İş Vizesi', 'Transkript Apostilli aslı + tercümesi', 'digital', 11),
('İsveç', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli aslı + noterde onaylı tercümesi)', 'digital', 12),
('İsveç', 'Çalışma/İş Vizesi', 'Konaklama belgesi (kira sözleşmesi veya adres beyanı)', 'digital', 13),
('İsveç', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 14),
('İsveç', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İsveççe veya İngilizce)', 'digital', 15);

-- ============================================================
-- İTALYA
-- ============================================================

-- İTALYA - Aile/Arkadaş Ziyareti
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 9),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinden davet mektubu (İtalyanca)', 'digital', 10),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'digital', 11),
('İtalya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi (tercümeli, Apostilli)', 'digital', 12);

-- İTALYA - Eğitim/Öğrenci
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Eğitim/Öğrenci', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İtalya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İtalya', 'Eğitim/Öğrenci', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İtalya', 'Eğitim/Öğrenci', 'İtalyan okul/üniversite kabul belgesi', 'digital', 9),
('İtalya', 'Eğitim/Öğrenci', 'Öğrenci belgesi', 'digital', 10),
('İtalya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('İtalya', 'Eğitim/Öğrenci', 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 12);

-- İTALYA - Ticari/İş
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Ticari/İş', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Ticari/İş', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Ticari/İş', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İtalya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İtalya', 'Ticari/İş', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 8),
('İtalya', 'Ticari/İş', 'İtalya''daki iş ortağından davet mektubu', 'digital', 9),
('İtalya', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 10),
('İtalya', 'Ticari/İş', 'Şirket faaliyet belgesi (son 3 ay içinde alınmış güncel, e-imzalı/orijinal)', 'digital', 11),
('İtalya', 'Ticari/İş', 'Vergi levhası', 'digital', 12),
('İtalya', 'Ticari/İş', 'Ticaret sicil gazetesi (son 6 ay içinde alınmış güncel, tercümeli)', 'digital', 13),
('İtalya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 14);

-- İTALYA - Turistik
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('İtalya', 'Turistik', 'Pasaport fotokopisi', 'digital', 2),
('İtalya', 'Turistik', 'Kimlik fotokopisi', 'digital', 3),
('İtalya', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('İtalya', 'Turistik', 'Vize başvuru formu (imzalı)', 'company', 5),
('İtalya', 'Turistik', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 6),
('İtalya', 'Turistik', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 7),
('İtalya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('İtalya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('İtalya', 'Turistik', 'Seyahat sağlık sigortası (min. 30.000 €)', 'digital', 10),
('İtalya', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 11),
('İtalya', 'Turistik', 'SGK hizmet dökümü (e-devlet üzerinden barkodlu çıktı)', 'digital', 12),
('İtalya', 'Turistik', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı resmi çıktı; yanına bankadan alınan Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli — şirket imza sirküleriyle karıştırılmamalıdır)', 'digital', 13);

-- İTALYA - Çalışma/İş Vizesi (Visto Nazionale — Decreto Flussi / Nulla Osta)
INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İtalya', 'Çalışma/İş Vizesi', 'İtalya Konsolosluğu''ndan D Tipi Ulusal Vize Başvuru Formu', 'company', 1),
('İtalya', 'Çalışma/İş Vizesi', 'Pasaportun orijinali (min. 12 ay geçerli)', 'physical', 2),
('İtalya', 'Çalışma/İş Vizesi', '2 adet biyometrik fotoğraf', 'physical', 3),
('İtalya', 'Çalışma/İş Vizesi', 'İkametgah belgesi (e-devlet üzerinden barkodlu çıktı)', 'digital', 4),
('İtalya', 'Çalışma/İş Vizesi', 'Tam vukuatlı nüfus kayıt örneği (e-devlet üzerinden barkodlu çıktı)', 'digital', 5),
('İtalya', 'Çalışma/İş Vizesi', 'Adli sicil kaydı (Apostilli, İtalyanca/İngilizce tercümeli)', 'digital', 6),
('İtalya', 'Çalışma/İş Vizesi', 'Nulla Osta (Çalışma İzni Belgesi — Sportello Unico per l''Immigrazione tarafından işveren başvurusuyla verilen onay belgesi)', 'digital', 7),
('İtalya', 'Çalışma/İş Vizesi', 'Decreto Flussi (Akış Kararnamesi) kapsamında başvuru kaydı (yıllık kontenjan sistemi, Bakanlık portalından işveren kayıt yapar)', 'digital', 8),
('İtalya', 'Çalışma/İş Vizesi', 'İş sözleşmesi (İtalyan iş hukukuna uygun, İtalyanca)', 'digital', 9),
('İtalya', 'Çalışma/İş Vizesi', 'Diploma ve mesleki belgeler (Apostilli, İtalyanca tercümeli)', 'digital', 10),
('İtalya', 'Çalışma/İş Vizesi', 'Doğum belgesi (Apostilli, İtalyanca tercümeli)', 'digital', 11),
('İtalya', 'Çalışma/İş Vizesi', 'Konaklama belgesi', 'digital', 12),
('İtalya', 'Çalışma/İş Vizesi', 'Banka hesap dökümü (son 3 ay)', 'digital', 13),
('İtalya', 'Çalışma/İş Vizesi', 'Sağlık sigortası: giriş dönemini kapsayan özel sağlık poliçesi (ilk 1-3 ay için; devlet/zorunlu sisteme geçişe kadar geçerli)', 'digital', 14),
('İtalya', 'Çalışma/İş Vizesi', 'CV / Özgeçmiş (İtalyanca veya İngilizce)', 'digital', 15);
