import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhmcpfxakmxryqnwpiaa.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobWNwZnhha214cnlxbndwaWFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2ODYzNSwiZXhwIjoyMDkwNDQ0NjM1fQ.x0YQRjwyTF6Gcxnn__ruYJZ_aMFl6QvFnAG31G4g6jA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

// delivery_type kuralları:
// physical  → Pasaportun orijinali, biyometrik fotoğraf, vize başvuru formu (imzalı), D Tipi başvuru formu
// company   → Online portal başvuru formları (SIRI, Enter Finland, France-Visas vb.)
// digital   → Diğer tüm belgeler

const rows = [
  // ============================================================
  // BULGARİSTAN (delivery_type güncellendi: vize formu → physical)
  // ============================================================

  // BULGARİSTAN - Aile/Arkadaş Ziyareti
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 10 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Bulgaristan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 12 },

  // BULGARİSTAN - Eğitim/Öğrenci
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Bulgaristan okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Bulgaristan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // BULGARİSTAN - Ticari/İş
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: "Bulgaristan'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 9 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Ticaret sicil gazetesi (son 6 ay içinde alınmış, tercümeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Bulgaristan', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },

  // BULGARİSTAN - Turistik
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'İşveren İzin/Görev Yazısı — ZORUNLU (ıslak imzalı ve kaşeli; işe başlangıç tarihi, maaş, görev ve izin tarihleri belirtilmeli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'SGK İşe Giriş Bildirgesi — ZORUNLU (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 12 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'SGK Hizmet Dökümü (e-devlet, barkodlu; tüm sigorta geçmişini kapsar)', delivery_type: 'digital', order_num: 13 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 14 },
  { country: 'Bulgaristan', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 15 },

  // BULGARİSTAN - Çalışma/İş Vizesi
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'D Tipi Ulusal Vize Başvuru Formu', delivery_type: 'physical', order_num: 1 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 18 ay geçerli, 2 boş sayfa)', delivery_type: 'physical', order_num: 2 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Bulgarca/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: "Bulgaristan İstihdam Ajansı Onay Belgesi (işverenin Çalışma Bakanlığı'ndan aldığı çalışma izni)", delivery_type: 'digital', order_num: 7 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi (Bulgar mevzuatına uygun, tercümeli)', delivery_type: 'digital', order_num: 8 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Şirket faaliyet belgesi (Bulgar işverenin güncel vergi levhası ve Ticaret Odası kaydı)', delivery_type: 'digital', order_num: 9 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve mesleki yeterlilik belgeleri (tercümeli, Apostilli)', delivery_type: 'digital', order_num: 10 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Konaklama sözleşmesi (noter onaylı kira sözleşmesi veya taahhütname)', delivery_type: 'digital', order_num: 11 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Banka hesap dökümü (geçimi karşılayacak düzeyde; min. 1.077 BGN/ay — 2026 asgari ücret)', delivery_type: 'digital', order_num: 12 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: "Sağlık sigortası (Bulgaristan'da geçerli poliçe)", delivery_type: 'digital', order_num: 13 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Doğum belgesi (Apostilli, tercümeli)', delivery_type: 'digital', order_num: 14 },
  { country: 'Bulgaristan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (Bulgarca veya İngilizce)', delivery_type: 'digital', order_num: 15 },

  // ============================================================
  // DANİMARKA
  // ============================================================

  // DANİMARKA - Aile/Arkadaş Ziyareti
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 10 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 12 },
  { country: 'Danimarka', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize dilekçesi (İngilizce)', delivery_type: 'digital', order_num: 13 },

  // DANİMARKA - Eğitim/Öğrenci
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Danimarka okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },
  { country: 'Danimarka', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize dilekçesi (İngilizce)', delivery_type: 'digital', order_num: 13 },

  // DANİMARKA - Ticari/İş
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: "Danimarka'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 9 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Ticaret sicil gazetesi (son 6 ay içinde alınmış, tercümeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },
  { country: 'Danimarka', visa_type: 'Ticari/İş', doc_name: 'Vize dilekçesi (İngilizce)', delivery_type: 'digital', order_num: 15 },

  // DANİMARKA - Turistik
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'SGK hizmet dökümü (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 11 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 12 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Danimarka', visa_type: 'Turistik', doc_name: 'Vize dilekçesi (İngilizce)', delivery_type: 'digital', order_num: 14 },

  // DANİMARKA - Çalışma/İş Vizesi (Pay Limit Scheme / SIRI 2026)
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'SIRI Online Başvuru Formu (newtodenmark.dk portalı üzerinden)', delivery_type: 'company', order_num: 1 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 6 ay geçerli)', delivery_type: 'physical', order_num: 2 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Danimarkaca/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi (Pay Limit Scheme: yıllık brüt min. DKK 552.000 / aylık min. DKK 46.000 — 2026)', delivery_type: 'digital', order_num: 7 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesinde DISCO kodu (standart iş sınıflandırma kodu)', delivery_type: 'digital', order_num: 8 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Görev tanımı belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Vize harcı ödeme makbuzu (2026: DKK 6.810 ana başvuru / DKK 3.080 aile bireyi)', delivery_type: 'digital', order_num: 10 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve eğitim belgeleri (tercümeli, Apostilli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (İngilizce veya Danimarkaca)', delivery_type: 'digital', order_num: 12 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: "Konaklama belgesi (Danimarka'da adres veya kira sözleşmesi)", delivery_type: 'digital', order_num: 13 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Doğum belgesi (Apostilli, tercümeli)', delivery_type: 'digital', order_num: 14 },
  { country: 'Danimarka', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Sağlık sigortası belgesi', delivery_type: 'digital', order_num: 15 },

  // ============================================================
  // ESTONYA
  // ============================================================

  // ESTONYA - Aile/Arkadaş Ziyareti
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 10 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Estonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 12 },

  // ESTONYA - Eğitim/Öğrenci
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Estonya okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Estonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // ESTONYA - Ticari/İş
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: "Estonya'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 9 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Ticaret sicil gazetesi (son 6 ay içinde alınmış, tercümeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Estonya', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },

  // ESTONYA - Turistik
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'SGK hizmet dökümü (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 11 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 12 },
  { country: 'Estonya', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },

  // ESTONYA - Çalışma/İş Vizesi (D Tipi Uzun Dönem)
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'D Vizesi Online Başvuru Formu çıktısı (Estonya Dışişleri portalı)', delivery_type: 'company', order_num: 1 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 6 ay geçerli)', delivery_type: 'physical', order_num: 2 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Estonca/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Kısa Süreli İstihdam Kaydı — Registration of Short-Term Employment (işverenin Estonya Polis ve Sınır Muhafaza Kurulu\'na onaylı kaydı)', delivery_type: 'digital', order_num: 7 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi (Estonya asgari ücret şartını karşılar — 2026: brüt min. 886 €/ay)', delivery_type: 'digital', order_num: 8 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Konaklama beyanı (ikamet adresinin resmi kaydı veya kira sözleşmesi)', delivery_type: 'digital', order_num: 9 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve mesleki yeterlilik belgeleri (tercümeli)', delivery_type: 'digital', order_num: 10 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Banka hesap dökümü (son 3 ay, geçim kanıtı)', delivery_type: 'digital', order_num: 11 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Sağlık sigortası (giriş dönemini kapsayan özel sağlık poliçesi; ilk 1-3 ay)', delivery_type: 'digital', order_num: 12 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Doğum belgesi (Apostilli, tercümeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Estonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş', delivery_type: 'digital', order_num: 14 },

  // ============================================================
  // FİNLANDİYA
  // ============================================================

  // FİNLANDİYA - Aile/Arkadaş Ziyareti
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 10 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Finlandiya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 12 },

  // FİNLANDİYA - Eğitim/Öğrenci
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Finlandiya okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Finlandiya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // FİNLANDİYA - Ticari/İş
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: "Finlandiya'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 9 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Ticaret sicil gazetesi (son 6 ay içinde alınmış, tercümeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Finlandiya', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },

  // FİNLANDİYA - Turistik
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'SGK hizmet dökümü (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 11 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 12 },
  { country: 'Finlandiya', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },

  // FİNLANDİYA - Çalışma/İş Vizesi (Enter Finland Portalı)
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Enter Finland Portalı üzerinden Elektronik Başvuru Formu', delivery_type: 'company', order_num: 1 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 12 ay geçerli)', delivery_type: 'physical', order_num: 2 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Fince/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş Şartları Belgesi — TEM 054 Formu (işverenin çalışma şartları, sigorta ve maaş detaylarını içerir)', delivery_type: 'digital', order_num: 7 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi (Finlandiya sendikal asgari sınıra uygun maaş)', delivery_type: 'digital', order_num: 8 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Maaş kanıtı / maaş bordrosu', delivery_type: 'digital', order_num: 9 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve sertifikalar (İngilizce veya Fince onaylı tercüme)', delivery_type: 'digital', order_num: 10 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Doğum belgesi (Apostilli, tercümeli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: "Konaklama belgesi (Finlandiya'da adres veya kira sözleşmesi)", delivery_type: 'digital', order_num: 12 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Banka hesap dökümü (son 3 ay)', delivery_type: 'digital', order_num: 13 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Sağlık sigortası (giriş dönemini kapsayan özel sağlık poliçesi; ilk 1-3 ay)', delivery_type: 'digital', order_num: 14 },
  { country: 'Finlandiya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (İngilizce veya Fince)', delivery_type: 'digital', order_num: 15 },

  // ============================================================
  // FRANSA
  // ============================================================

  // FRANSA - Aile/Arkadaş Ziyareti
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: "Ev sahibinden davet mektubu — attestation d'accueil (Fransız belediyesinden veya polis komiserliğinden onaylı)", delivery_type: 'digital', order_num: 10 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Fransa', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli, Apostilli)', delivery_type: 'digital', order_num: 12 },

  // FRANSA - Eğitim/Öğrenci
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Fransız okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Fransa', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // FRANSA - Ticari/İş
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: "Fransa'daki iş ortağından davet mektubu — Lettre d'invitation (şirket antetli)", delivery_type: 'digital', order_num: 9 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Ticaret sicil gazetesi (son 6 ay içinde alınmış, tercümeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Fransa', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },

  // FRANSA - Turistik
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'İşveren İzin/Görev Yazısı — ZORUNLU (ıslak imzalı ve kaşeli; işe başlangıç tarihi, maaş, görev ve izin tarihleri belirtilmeli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'SGK İşe Giriş Bildirgesi — ZORUNLU (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 12 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'SGK Hizmet Dökümü (e-devlet, barkodlu; tüm sigorta geçmişini kapsar)', delivery_type: 'digital', order_num: 13 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 14 },
  { country: 'Fransa', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 15 },

  // FRANSA - Çalışma/İş Vizesi (Talent Passport / VLS-TS)
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'France-Visas portalı üzerinden Başvuru Formu ve Kayıt Dekontu', delivery_type: 'company', order_num: 1 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 12 ay geçerli)', delivery_type: 'physical', order_num: 2 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf (35x45mm)', delivery_type: 'physical', order_num: 3 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Fransızca/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Cerfa Formu (N° 15617*01 — DREETS onaylı çalışma izin formu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi (Passeport Talent yıllık brüt asgari maaş limitini karşıladığını gösterir)', delivery_type: 'digital', order_num: 8 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve mesleki belgeler (Apostilli, Fransızca/İngilizce tercümeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Doğum belgesi (Apostilli, Fransızca tercümeli)', delivery_type: 'digital', order_num: 10 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: "Konaklama belgesi (Fransa'da kira sözleşmesi veya taahhütname)", delivery_type: 'digital', order_num: 11 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Banka hesap dökümü (son 3 ay)', delivery_type: 'digital', order_num: 12 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: "Sağlık sigortası (Fransa'da geçerli)", delivery_type: 'digital', order_num: 13 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (Fransızca)', delivery_type: 'digital', order_num: 14 },
  { country: 'Fransa', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Motivasyon mektubu', delivery_type: 'digital', order_num: 15 },
];

async function run() {
  // Bulgaristan zaten var, delivery_type güncellenmesi için önce silinip yeniden ekleniyor
  console.log("Bulgaristan mevcut kayıtları siliniyor (delivery_type güncellemesi)...");
  const { error: deleteError } = await supabase
    .from('visa_documents')
    .delete()
    .eq('country', 'Bulgaristan');

  if (deleteError) {
    console.error('Silme hatası:', deleteError);
    process.exit(1);
  }
  console.log('Bulgaristan silindi.');

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('visa_documents')
      .insert(batch);
    if (insertError) {
      console.error(`Batch ${i}-${i + BATCH_SIZE} insert hatası:`, insertError);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`${inserted}/${rows.length} satır eklendi...`);
  }

  console.log(`\nTamamlandı! Toplam ${rows.length} satır eklendi.`);

  const { count } = await supabase
    .from('visa_documents')
    .select('*', { count: 'exact', head: true });
  console.log(`Tablodaki toplam satır: ${count}`);

  // Ülke özeti
  const { data: summary } = await supabase
    .from('visa_documents')
    .select('country')
    .order('country');
  const counts = {};
  for (const row of summary) {
    counts[row.country] = (counts[row.country] || 0) + 1;
  }
  console.log('\nÜlke başına satır sayısı:');
  for (const [country, cnt] of Object.entries(counts)) {
    console.log(`  ${country}: ${cnt}`);
  }
}

run().catch(console.error);
