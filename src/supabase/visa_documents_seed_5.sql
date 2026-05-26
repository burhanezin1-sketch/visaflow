-- visa_documents_seed_5.sql
-- Countries: İngiltere, Amerika Birleşik Devletleri, Kanada, Japonya, Güney Kore
-- No DELETE — additions only

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Turistik', 'Pasaportun orijinali (+ varsa eski pasaportlar)', 'physical', 1),
('İngiltere', 'Turistik', 'Pasaport fotokopisi (kimlik sayfası)', 'physical', 2),
('İngiltere', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('İngiltere', 'Turistik', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 4),
('İngiltere', 'Turistik', 'İkametgah belgesi', 'digital', 5),
('İngiltere', 'Turistik', 'Vize başvuru formu (online, GOV.UK — imzalı çıktı)', 'company', 6),
('İngiltere', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İngiltere', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 8),
('İngiltere', 'Turistik', 'Son 6 aylık banka hesap dökümü', 'digital', 9),
('İngiltere', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 10),
('İngiltere', 'Turistik', 'İşveren izin yazısı (görev, maaş, izin tarihleri)', 'digital', 11),
('İngiltere', 'Turistik', 'SGK hizmet dökümü', 'digital', 12),
('İngiltere', 'Turistik', 'Vize dilekçesi (İngilizce, kişisel)', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('İngiltere', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('İngiltere', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('İngiltere', 'Ticari/İş', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 4),
('İngiltere', 'Ticari/İş', 'İkametgah belgesi', 'digital', 5),
('İngiltere', 'Ticari/İş', 'Vize başvuru formu (online, GOV.UK)', 'company', 6),
('İngiltere', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İngiltere', 'Ticari/İş', 'Son 6 aylık banka hesap dökümü', 'digital', 8),
('İngiltere', 'Ticari/İş', 'İngiltere''deki iş ortağından davet mektubu (şirket antetli kağıdına)', 'digital', 9),
('İngiltere', 'Ticari/İş', 'Şirket faaliyet belgesi (İngilizce)', 'digital', 10),
('İngiltere', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('İngiltere', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('İngiltere', 'Ticari/İş', 'İmza sirküleri', 'digital', 13),
('İngiltere', 'Ticari/İş', 'İşveren görev yazısı (İngilizce)', 'digital', 14),
('İngiltere', 'Ticari/İş', 'Vize dilekçesi (İngilizce, şirket antetli)', 'digital', 15);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('İngiltere', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('İngiltere', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('İngiltere', 'Eğitim/Öğrenci', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 4),
('İngiltere', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 5),
('İngiltere', 'Eğitim/Öğrenci', 'Vize başvuru formu (online, GOV.UK)', 'company', 6),
('İngiltere', 'Eğitim/Öğrenci', 'İngiliz okul/üniversite kabul belgesi (CAS numaralı)', 'digital', 7),
('İngiltere', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 8),
('İngiltere', 'Eğitim/Öğrenci', 'İngilizce dil yeterlilik belgesi (IELTS vb.)', 'digital', 9),
('İngiltere', 'Eğitim/Öğrenci', 'Son 6 aylık veli/sponsor banka hesap dökümü', 'digital', 10),
('İngiltere', 'Eğitim/Öğrenci', 'Veli gelir belgesi / maaş bordrosu', 'digital', 11),
('İngiltere', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 4),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 5),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (online, GOV.UK)', 'company', 6),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'İngiltere''deki ev sahibinden davet mektubu', 'digital', 8),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 9),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 10),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Son 6 aylık banka hesap dökümü', 'digital', 11),
('İngiltere', 'Aile/Arkadaş Ziyareti', 'Maaş bordrosu veya gelir belgesi', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Amerika Birleşik Devletleri', 'Turistik', 'Pasaportun orijinali (+ varsa eski pasaportlar)', 'physical', 1),
('Amerika Birleşik Devletleri', 'Turistik', 'DS-160 başvuru formu (online, barkodlu onay sayfası çıktısı)', 'company', 2),
('Amerika Birleşik Devletleri', 'Turistik', '1 adet biyometrik fotoğraf (5×5 cm, beyaz fon)', 'physical', 3),
('Amerika Birleşik Devletleri', 'Turistik', 'Vize ücreti ödeme makbuzu (185 USD)', 'digital', 4),
('Amerika Birleşik Devletleri', 'Turistik', 'Randevu onay belgesi', 'digital', 5),
('Amerika Birleşik Devletleri', 'Turistik', 'Kimlik fotokopisi', 'physical', 6),
('Amerika Birleşik Devletleri', 'Turistik', 'Tam vukuatlı nüfus kayıt örneği', 'digital', 7),
('Amerika Birleşik Devletleri', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 8),
('Amerika Birleşik Devletleri', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 9),
('Amerika Birleşik Devletleri', 'Turistik', 'İşveren izin yazısı (görev, maaş, izin tarihleri — İngilizce)', 'digital', 10),
('Amerika Birleşik Devletleri', 'Turistik', 'SGK hizmet dökümü', 'digital', 11),
('Amerika Birleşik Devletleri', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 12),
('Amerika Birleşik Devletleri', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 13),
('Amerika Birleşik Devletleri', 'Turistik', 'Vize dilekçesi (kişisel, İngilizce)', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'DS-160 başvuru formu (barkodlu onay sayfası çıktısı)', 'company', 2),
('Amerika Birleşik Devletleri', 'Ticari/İş', '1 adet biyometrik fotoğraf (5×5 cm, beyaz fon)', 'physical', 3),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Vize ücreti ödeme makbuzu (185 USD)', 'digital', 4),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Randevu onay belgesi', 'digital', 5),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 6),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Nüfus kayıt örneği', 'digital', 7),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 8),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'ABD''deki iş ortağından davet mektubu (İngilizce)', 'digital', 9),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Şirket faaliyet belgesi (İngilizce)', 'digital', 10),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'İmza sirküleri', 'digital', 13),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'İşveren görev yazısı (şirket antetli, İngilizce)', 'digital', 14),
('Amerika Birleşik Devletleri', 'Ticari/İş', 'Vize dilekçesi (şirket antetli, İngilizce)', 'digital', 15);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'DS-160 başvuru formu (barkodlu onay sayfası çıktısı)', 'company', 2),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', '1 adet biyometrik fotoğraf (5×5 cm, beyaz fon)', 'physical', 3),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Vize ücreti ödeme makbuzu (185 USD + SEVIS ücreti 350 USD)', 'digital', 4),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Randevu onay belgesi', 'digital', 5),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'SEVIS I-20 formu (okuldan)', 'digital', 6),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Amerikan okul/üniversite kabul belgesi', 'digital', 7),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 8),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'İngilizce dil yeterlilik belgesi (TOEFL vb.)', 'digital', 9),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Son 6 aylık veli/sponsor banka hesap dökümü', 'digital', 10),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Veli gelir belgesi / maaş bordrosu', 'digital', 11),
('Amerika Birleşik Devletleri', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'DS-160 başvuru formu (barkodlu onay sayfası çıktısı)', 'company', 2),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', '1 adet biyometrik fotoğraf (5×5 cm, beyaz fon)', 'physical', 3),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Vize ücreti ödeme makbuzu (185 USD)', 'digital', 4),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Randevu onay belgesi', 'digital', 5),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 6),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Nüfus kayıt örneği', 'digital', 7),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 8),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'ABD''deki ev sahibinden davet mektubu (İngilizce)', 'digital', 9),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / Green Card / oturma izni fotokopisi', 'physical', 10),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Amerika Birleşik Devletleri', 'Aile/Arkadaş Ziyareti', 'Maaş bordrosu veya gelir belgesi', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('Kanada', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Kanada', 'Turistik', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Turistik', 'Vize başvuru formu (online, IRCC sistemi)', 'company', 5),
('Kanada', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Kanada', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Kanada', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Kanada', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Kanada', 'Turistik', 'Seyahat sağlık sigortası', 'digital', 10),
('Kanada', 'Turistik', 'Son 3 aylık banka hesap dökümü (kaşeli, ıslak imzalı)', 'digital', 11),
('Kanada', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 12),
('Kanada', 'Turistik', 'İşveren izin yazısı', 'digital', 13),
('Kanada', 'Turistik', 'SGK hizmet dökümü', 'digital', 14),
('Kanada', 'Turistik', 'Açıklama mektubu (seyahat amacı, İngilizce)', 'digital', 15);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Kanada', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Kanada', 'Ticari/İş', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Ticari/İş', 'Vize başvuru formu (online, IRCC sistemi)', 'company', 5),
('Kanada', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Kanada', 'Ticari/İş', 'Seyahat sağlık sigortası', 'digital', 7),
('Kanada', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Kanada', 'Ticari/İş', 'Kanada''daki iş ortağından davet mektubu (İngilizce)', 'digital', 9),
('Kanada', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Kanada', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Kanada', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Kanada', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Kanada', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 14),
('Kanada', 'Ticari/İş', 'Açıklama mektubu (İngilizce)', 'digital', 15);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Kanada', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Kanada', 'Eğitim/Öğrenci', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Eğitim/Öğrenci', 'Vize başvuru formu (online, IRCC sistemi)', 'company', 5),
('Kanada', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Kanada', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Kanada', 'Eğitim/Öğrenci', 'Kanada okul/üniversite kabul belgesi', 'digital', 8),
('Kanada', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 9),
('Kanada', 'Eğitim/Öğrenci', 'İngilizce / Fransızca dil yeterlilik belgesi', 'digital', 10),
('Kanada', 'Eğitim/Öğrenci', 'Son 6 aylık veli/sponsor banka hesap dökümü', 'digital', 11),
('Kanada', 'Eğitim/Öğrenci', 'Veli gelir belgesi / maaş bordrosu', 'digital', 12),
('Kanada', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 13),
('Kanada', 'Eğitim/Öğrenci', 'Açıklama mektubu (İngilizce)', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Kanada', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Kanada', 'Aile/Arkadaş Ziyareti', '2 adet biyometrik fotoğraf', 'physical', 4),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (online, IRCC sistemi)', 'company', 5),
('Kanada', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Seyahat sağlık sigortası', 'digital', 7),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Kanada''daki ev sahibinden davet mektubu (İngilizce)', 'digital', 9),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12),
('Kanada', 'Aile/Arkadaş Ziyareti', 'Açıklama mektubu (İngilizce)', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Turistik', 'Pasaport fotokopisi (kimlik sayfası)', 'physical', 2),
('Japonya', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Japonya', 'Turistik', '1 adet biyometrik fotoğraf (4.5×4.5 cm, beyaz fon)', 'physical', 4),
('Japonya', 'Turistik', 'Vize başvuru formu (Japonya Konsolosluğu formu — imzalı)', 'company', 5),
('Japonya', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Japonya', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Japonya', 'Turistik', 'Gün gün seyahat planı / itinerary (İngilizce)', 'digital', 8),
('Japonya', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 9),
('Japonya', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 10),
('Japonya', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Japonya', 'Turistik', 'Maaş bordrosu (son 3 ay)', 'digital', 12),
('Japonya', 'Turistik', 'İşveren izin yazısı (kaşeli, imzalı)', 'digital', 13),
('Japonya', 'Turistik', 'SGK hizmet dökümü', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Japonya', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Japonya', 'Ticari/İş', '1 adet biyometrik fotoğraf (4.5×4.5 cm, beyaz fon)', 'physical', 4),
('Japonya', 'Ticari/İş', 'Vize başvuru formu (imzalı)', 'company', 5),
('Japonya', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Japonya', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Japonya', 'Ticari/İş', 'Japonya''daki iş ortağından davet mektubu (kaşeli, imzalı — Japonca veya İngilizce)', 'digital', 8),
('Japonya', 'Ticari/İş', 'Davet eden şirketin ticaret sicil belgesi', 'digital', 9),
('Japonya', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 10),
('Japonya', 'Ticari/İş', 'Vergi levhası', 'digital', 11),
('Japonya', 'Ticari/İş', 'Ticaret sicil gazetesi', 'digital', 12),
('Japonya', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 13),
('Japonya', 'Ticari/İş', 'İşveren görev yazısı (kaşeli, imzalı)', 'digital', 14),
('Japonya', 'Ticari/İş', 'Gün gün iş programı (İngilizce)', 'digital', 15);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Japonya', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Japonya', 'Eğitim/Öğrenci', '1 adet biyometrik fotoğraf (4.5×4.5 cm, beyaz fon)', 'physical', 4),
('Japonya', 'Eğitim/Öğrenci', 'Vize başvuru formu (imzalı)', 'company', 5),
('Japonya', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 6),
('Japonya', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 7),
('Japonya', 'Eğitim/Öğrenci', 'Japon okul/üniversite kabul belgesi', 'digital', 8),
('Japonya', 'Eğitim/Öğrenci', 'Certificate of Eligibility (COE — Uygunluk Belgesi)', 'digital', 9),
('Japonya', 'Eğitim/Öğrenci', 'Öğrenci belgesi (Türkiye''deki okul)', 'digital', 10),
('Japonya', 'Eğitim/Öğrenci', 'Burs belgesi (varsa)', 'digital', 11),
('Japonya', 'Eğitim/Öğrenci', 'Son 6 aylık veli/sponsor banka hesap dökümü', 'digital', 12),
('Japonya', 'Eğitim/Öğrenci', 'Veli gelir belgesi / maaş bordrosu', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Japonya', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Japonya', 'Aile/Arkadaş Ziyareti', '1 adet biyometrik fotoğraf (4.5×4.5 cm, beyaz fon)', 'physical', 4),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (imzalı)', 'company', 5),
('Japonya', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 6),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Japonya''daki ev sahibinden davet mektubu (Japonca veya İngilizce)', 'digital', 8),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi (zairyu card)', 'physical', 9),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 10),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Japonya', 'Aile/Arkadaş Ziyareti', 'Gün gün seyahat planı', 'digital', 12);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Turistik', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Turistik', 'Pasaport fotokopisi', 'physical', 2),
('Güney Kore', 'Turistik', 'Kimlik fotokopisi', 'physical', 3),
('Güney Kore', 'Turistik', '1 adet biyometrik fotoğraf (3.5×4.5 cm, beyaz fon)', 'physical', 4),
('Güney Kore', 'Turistik', 'Vize başvuru formu (Form No.17 — online doldurulur)', 'company', 5),
('Güney Kore', 'Turistik', 'Nüfus kayıt örneği', 'digital', 6),
('Güney Kore', 'Turistik', 'İkametgah belgesi', 'digital', 7),
('Güney Kore', 'Turistik', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Güney Kore', 'Turistik', 'Otel / konaklama rezervasyonu', 'digital', 9),
('Güney Kore', 'Turistik', 'Seyahat planı / itinerary', 'digital', 10),
('Güney Kore', 'Turistik', 'Son 3 aylık banka hesap dökümü', 'digital', 11),
('Güney Kore', 'Turistik', 'Maaş bordrosu veya gelir belgesi', 'digital', 12),
('Güney Kore', 'Turistik', 'SGK hizmet dökümü veya işveren yazısı', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Ticari/İş', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Ticari/İş', 'Pasaport fotokopisi', 'physical', 2),
('Güney Kore', 'Ticari/İş', 'Kimlik fotokopisi', 'physical', 3),
('Güney Kore', 'Ticari/İş', '1 adet biyometrik fotoğraf', 'physical', 4),
('Güney Kore', 'Ticari/İş', 'Vize başvuru formu (Form No.17)', 'company', 5),
('Güney Kore', 'Ticari/İş', 'İkametgah belgesi', 'digital', 6),
('Güney Kore', 'Ticari/İş', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 7),
('Güney Kore', 'Ticari/İş', 'Kore''deki iş ortağından davet mektubu', 'digital', 8),
('Güney Kore', 'Ticari/İş', 'Davet eden şirketin ticaret sicil belgesi / işyeri sicil numarası', 'digital', 9),
('Güney Kore', 'Ticari/İş', 'Vergi beyannamesi kopyası (davet eden şirketten)', 'digital', 10),
('Güney Kore', 'Ticari/İş', 'Şirket faaliyet belgesi', 'digital', 11),
('Güney Kore', 'Ticari/İş', 'Son 3 aylık banka hesap dökümü', 'digital', 12),
('Güney Kore', 'Ticari/İş', 'İşveren görev yazısı', 'digital', 13),
('Güney Kore', 'Ticari/İş', 'İş programı / görüşme planı', 'digital', 14);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Eğitim/Öğrenci', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Eğitim/Öğrenci', 'Pasaport fotokopisi', 'physical', 2),
('Güney Kore', 'Eğitim/Öğrenci', 'Kimlik fotokopisi', 'physical', 3),
('Güney Kore', 'Eğitim/Öğrenci', '1 adet biyometrik fotoğraf', 'physical', 4),
('Güney Kore', 'Eğitim/Öğrenci', 'Vize başvuru formu (Form No.17)', 'company', 5),
('Güney Kore', 'Eğitim/Öğrenci', 'Nüfus kayıt örneği', 'digital', 6),
('Güney Kore', 'Eğitim/Öğrenci', 'İkametgah belgesi', 'digital', 7),
('Güney Kore', 'Eğitim/Öğrenci', 'Askerlik belgesi (erkekler için — terhis veya tecil)', 'digital', 8),
('Güney Kore', 'Eğitim/Öğrenci', 'Adli sicil kaydı', 'digital', 9),
('Güney Kore', 'Eğitim/Öğrenci', 'Kore okul/üniversite kabul belgesi', 'digital', 10),
('Güney Kore', 'Eğitim/Öğrenci', 'Öğrenci belgesi ve diploma (Türkiye''deki okul)', 'digital', 11),
('Güney Kore', 'Eğitim/Öğrenci', 'Son 3 aylık banka hesap dökümü (min. 3.000 USD — dil okulu, min. 10.000 USD — üniversite)', 'digital', 12),
('Güney Kore', 'Eğitim/Öğrenci', 'Veli/sponsor gelir belgesi', 'digital', 13);

INSERT INTO visa_documents (country, visa_type, doc_name, delivery_type, order_num) VALUES
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Pasaportun orijinali', 'physical', 1),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Pasaport fotokopisi', 'physical', 2),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Kimlik fotokopisi', 'physical', 3),
('Güney Kore', 'Aile/Arkadaş Ziyareti', '1 adet biyometrik fotoğraf', 'physical', 4),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Vize başvuru formu (Form No.17)', 'company', 5),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Nüfus kayıt örneği', 'digital', 6),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'İkametgah belgesi', 'digital', 7),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 8),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Kore''deki ev sahibinden davet mektubu', 'digital', 9),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Ev sahibinin pasaport / oturma izni fotokopisi', 'physical', 10),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Akrabalık belgesi', 'digital', 11),
('Güney Kore', 'Aile/Arkadaş Ziyareti', 'Son 3 aylık banka hesap dökümü', 'digital', 12);
