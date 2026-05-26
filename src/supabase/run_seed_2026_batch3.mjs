import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yhmcpfxakmxryqnwpiaa.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobWNwZnhha214cnlxbndwaWFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2ODYzNSwiZXhwIjoyMDkwNDQ0NjM1fQ.x0YQRjwyTF6Gcxnn__ruYJZ_aMFl6QvFnAG31G4g6jA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

// delivery_type kuralları:
// physical  → Pasaportun orijinali, biyometrik fotoğraf, vize başvuru formu (imzalı kağıt)
// company   → Online portal başvuru formları (HiKorea, IND vb.) ve IMM formları
// digital   → Diğer tüm belgeler

const rows = [
  // ============================================================
  // GÜNEY KORE
  // ============================================================

  // GÜNEY KORE - Aile/Arkadaş Ziyareti
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kore Vize Başvuru Formu (HiKorea portalı üzerinden veya konsolosluktan temin)', delivery_type: 'company', order_num: 5 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 10 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Güney Kore', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 12 },

  // GÜNEY KORE - Eğitim/Öğrenci
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Güney Kore okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Güney Kore', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // GÜNEY KORE - Ticari/İş
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: "Güney Kore'deki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 9 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Güney Kore', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },

  // GÜNEY KORE - Turistik
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 11 },
  { country: 'Güney Kore', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // GÜNEY KORE - Çalışma/İş Vizesi E-7
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Vize Başvuru Formu (HiKorea portalı üzerinden — e-visa.hikorea.go.kr)', delivery_type: 'company', order_num: 1 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Pasaportun orijinali (min. 18 ay geçerli, 2 boş sayfa)', delivery_type: 'physical', order_num: 2 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Adli sicil kaydı (Apostilli, Korece/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Çalışma İzni Onay Numarası (Standard Industrial Classification — SIC kodu ile işveren onaylı, Kore İmmigrasyonu\'na iletilen başvuru)', delivery_type: 'digital', order_num: 7 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'İş sözleşmesi (E-7 maaş eşiği: 2026 Kore asgari ücretinin min. %80 üzerinde, aylık brüt min. KRW 2.400.000)', delivery_type: 'digital', order_num: 8 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'İşveren yetki belgesi (Kore İmmigrasyonu\'na kayıtlı sponsor işveren belgesi)', delivery_type: 'digital', order_num: 9 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Görev tanımı belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Diploma ve mesleki yeterlilik belgeleri (tercümeli, Apostilli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'CV / Özgeçmiş (Korece veya İngilizce)', delivery_type: 'digital', order_num: 12 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: "Konaklama belgesi (Kore'de kira sözleşmesi veya taahhütname)", delivery_type: 'digital', order_num: 13 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Banka hesap dökümü (son 3 ay)', delivery_type: 'digital', order_num: 14 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: "Sağlık sigortası (Kore'de geçerli poliçe)", delivery_type: 'digital', order_num: 15 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Doğum belgesi (Apostilli, tercümeli)', delivery_type: 'digital', order_num: 16 },
  { country: 'Güney Kore', visa_type: 'Çalışma/İş Vizesi E-7', doc_name: 'Vize harcı ödeme makbuzu (USD 90 — 2026)', delivery_type: 'digital', order_num: 17 },

  // ============================================================
  // HOLLANDA
  // ============================================================

  // HOLLANDA - Aile/Arkadaş Ziyareti
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 10 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Hollanda', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 12 },

  // HOLLANDA - Eğitim/Öğrenci
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Hollanda okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Hollanda', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // HOLLANDA - Ticari/İş
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: "Hollanda'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 9 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Hollanda', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },

  // HOLLANDA - Turistik
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'SGK hizmet dökümü (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 11 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 12 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Hollanda', visa_type: 'Turistik', doc_name: 'Vize dilekçesi veya seyahat motivasyon mektubu (İngilizce veya Hollandaca)', delivery_type: 'digital', order_num: 14 },

  // HOLLANDA - Çalışma/İş Vizesi (Kennismigrant / IND)
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'IND Online Başvuru Formu (işveren tarafından doldurulur ve IND portalına yüklenir)', delivery_type: 'company', order_num: 1 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 6 ay geçerli)', delivery_type: 'physical', order_num: 2 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Hollandaca/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Recognized Sponsor Belgesi (işverenin IND tarafından tanınan sponsor olduğunu gösterir)', delivery_type: 'digital', order_num: 7 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi (2026 maaş eşikleri: 30 yaş üstü brüt min. 5.942 €/ay, 30 yaş altı brüt min. 4.357 €/ay)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve mesleki yeterlilik belgeleri (tercümeli, Apostilli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (Hollandaca veya İngilizce)', delivery_type: 'digital', order_num: 10 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: "Konaklama belgesi (Hollanda'da kira sözleşmesi veya adres beyanı)", delivery_type: 'digital', order_num: 11 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Banka hesap dökümü (son 3 ay)', delivery_type: 'digital', order_num: 12 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: "Sağlık sigortası (Hollanda'da geçerli poliçe)", delivery_type: 'digital', order_num: 13 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Doğum belgesi (Apostilli, tercümeli)', delivery_type: 'digital', order_num: 14 },
  { country: 'Hollanda', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Vize harcı ödeme makbuzu (MVV başvuru ücreti — 2026)', delivery_type: 'digital', order_num: 15 },

  // ============================================================
  // HIRVATISTAN
  // ============================================================

  // HIRVATISTAN - Aile/Arkadaş Ziyareti
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 9 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 10 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 11 },
  { country: 'Hırvatistan', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 12 },

  // HIRVATISTAN - Eğitim/Öğrenci
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Hırvatistan okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 10 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 11 },
  { country: 'Hırvatistan', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // HIRVATISTAN - Ticari/İş
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: "Hırvatistan'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 9 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 10 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 11 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 12 },
  { country: 'Hırvatistan', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },

  // HIRVATISTAN - Turistik
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası (min. 30.000 €)', delivery_type: 'digital', order_num: 10 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'İşveren İzin/Görev Yazısı — ZORUNLU (ıslak imzalı ve kaşeli; işe başlangıç tarihi, maaş, görev ve izin tarihleri belirtilmeli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'SGK hizmet dökümü (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 12 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 13 },
  { country: 'Hırvatistan', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },

  // HIRVATISTAN - Çalışma/İş Vizesi
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Hırvatistan Çalışma Vizesi Başvuru Formu (D Tipi Ulusal Vize)', delivery_type: 'physical', order_num: 1 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 18 ay geçerli, 2 boş sayfa)', delivery_type: 'physical', order_num: 2 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Hırvatça/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'HADS Olumlu Görüş Belgesi (Hırvatistan İstihdam Servisi\'nden [HADS] işveren adına alınan çalışma izin belgesi)', delivery_type: 'digital', order_num: 7 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi (2026 asgari ücret şartını karşılar — brüt min. 970 €/ay)', delivery_type: 'digital', order_num: 8 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: "Şirket faaliyet belgesi (Hırvatistan'daki işverenin güncel ticaret sicil kaydı ve vergi levhası)", delivery_type: 'digital', order_num: 9 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve mesleki yeterlilik belgeleri (tercümeli, Apostilli)', delivery_type: 'digital', order_num: 10 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Konaklama belgesi (noter onaylı kira sözleşmesi veya taahhütname)', delivery_type: 'digital', order_num: 11 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Banka hesap dökümü (son 3 ay)', delivery_type: 'digital', order_num: 12 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: "Sağlık sigortası (Hırvatistan'da geçerli poliçe)", delivery_type: 'digital', order_num: 13 },
  { country: 'Hırvatistan', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (Hırvatça veya İngilizce)', delivery_type: 'digital', order_num: 14 },

  // ============================================================
  // JAPONYA
  // ============================================================

  // JAPONYA - Aile/Arkadaş Ziyareti
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 8 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 9 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 10 },
  { country: 'Japonya', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 11 },

  // JAPONYA - Eğitim/Öğrenci
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Japonya okul/üniversite kabul belgesi', delivery_type: 'digital', order_num: 8 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi', delivery_type: 'digital', order_num: 9 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 10 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Japonya', visa_type: 'Eğitim/Öğrenci', doc_name: 'Certificate of Eligibility (CoE) — eğitim kurumu tarafından temin edilir', delivery_type: 'digital', order_num: 12 },

  // JAPONYA - Ticari/İş
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 7 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: "Japonya'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 8 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 9 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 10 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Vergi levhası', delivery_type: 'digital', order_num: 11 },
  { country: 'Japonya', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },

  // JAPONYA - Turistik
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 2 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 3 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 4 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Vize başvuru formu (imzalı)', delivery_type: 'physical', order_num: 5 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 6 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 7 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 8 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Seyahat Programı — Schedule of Stay / Taizai Nitteisho — ZORUNLU (her gün için detaylı gezi planı içermelidir)', delivery_type: 'digital', order_num: 10 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 11 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 12 },
  { country: 'Japonya', visa_type: 'Turistik', doc_name: 'İşveren görev yazısı veya öğrenci belgesi', delivery_type: 'digital', order_num: 13 },

  // JAPONYA - Çalışma/İş Vizesi
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Vize Başvuru Formu (fotoğraflı — Japon konsolosluğundan temin)', delivery_type: 'physical', order_num: 1 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 6 ay geçerli)', delivery_type: 'physical', order_num: 2 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 3 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 4 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 5 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, Japonca/İngilizce tercümeli)', delivery_type: 'digital', order_num: 6 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Certificate of Eligibility (CoE) orijinali — Japon işverenin Japonya İmmigrasyonu\'ndan (ROC) aldığı belge', delivery_type: 'digital', order_num: 7 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi', delivery_type: 'digital', order_num: 8 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Şirket profili / faaliyet belgesi (Japon işverenin tanıtım dokümanları)', delivery_type: 'digital', order_num: 9 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve mesleki yeterlilik belgeleri (tercümeli)', delivery_type: 'digital', order_num: 10 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (Japonca veya İngilizce)', delivery_type: 'digital', order_num: 11 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: "Konaklama belgesi (Japonya'da adres veya kira sözleşmesi)", delivery_type: 'digital', order_num: 12 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Banka hesap dökümü (son 3 ay)', delivery_type: 'digital', order_num: 13 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Sağlık sigortası', delivery_type: 'digital', order_num: 14 },
  { country: 'Japonya', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Doğum belgesi (Apostilli, tercümeli)', delivery_type: 'digital', order_num: 15 },

  // ============================================================
  // KANADA
  // ============================================================

  // KANADA - Turistik
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 2 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'IMM 5257 (Geçici İkamet Vizesi Başvuru Formu)', delivery_type: 'company', order_num: 3 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'IMM 5645 (Aile Bilgi Formu)', delivery_type: 'company', order_num: 4 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 5 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 6 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Biyometrik kayıt (BIL mektubu ile Kanada vize merkezinde)', delivery_type: 'digital', order_num: 7 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 8 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 9 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 10 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Otel / konaklama rezervasyonu', delivery_type: 'digital', order_num: 11 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Seyahat sağlık sigortası', delivery_type: 'digital', order_num: 12 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Maaş bordrosu veya gelir belgesi', delivery_type: 'digital', order_num: 13 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },
  { country: 'Kanada', visa_type: 'Turistik', doc_name: 'Vize harcı ödeme makbuzu (CAD $100 başvuru ücreti)', delivery_type: 'digital', order_num: 15 },

  // KANADA - Aile/Arkadaş Ziyareti
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 2 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'IMM 5257 (Geçici İkamet Vizesi Başvuru Formu)', delivery_type: 'company', order_num: 3 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'IMM 5645 (Aile Bilgi Formu)', delivery_type: 'company', order_num: 4 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 5 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 6 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Biyometrik kayıt (BIL mektubu ile Kanada vize merkezinde)', delivery_type: 'digital', order_num: 7 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 8 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Seyahat sağlık sigortası', delivery_type: 'digital', order_num: 10 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinden davet mektubu', delivery_type: 'digital', order_num: 12 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Ev sahibinin pasaport / oturma izni fotokopisi', delivery_type: 'digital', order_num: 13 },
  { country: 'Kanada', visa_type: 'Aile/Arkadaş Ziyareti', doc_name: 'Akrabalık belgesi (tercümeli)', delivery_type: 'digital', order_num: 14 },

  // KANADA - Eğitim/Öğrenci
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 2 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'IMM 1294 (Kanada Dışından Öğrenci İzni Başvuru Formu)', delivery_type: 'company', order_num: 3 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'IMM 5645 (Aile Bilgi Formu)', delivery_type: 'company', order_num: 4 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 5 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 6 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Biyometrik kayıt (BIL mektubu ile Kanada vize merkezinde)', delivery_type: 'digital', order_num: 7 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 8 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 9 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Kanada okul/üniversite kabul belgesi (Letter of Acceptance)', delivery_type: 'digital', order_num: 10 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Öğrenci belgesi veya mezuniyet belgesi', delivery_type: 'digital', order_num: 11 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Burs belgesi (varsa)', delivery_type: 'digital', order_num: 12 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Veli/sponsor banka hesap dökümü (son 3 ay, banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 13 },
  { country: 'Kanada', visa_type: 'Eğitim/Öğrenci', doc_name: 'Vize harcı ödeme makbuzu (CAD $150 öğrenci izni ücreti)', delivery_type: 'digital', order_num: 14 },

  // KANADA - Ticari/İş
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Pasaportun orijinali', delivery_type: 'physical', order_num: 1 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 2 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'IMM 5257 (Geçici İkamet Vizesi Başvuru Formu)', delivery_type: 'company', order_num: 3 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'IMM 5645 (Aile Bilgi Formu)', delivery_type: 'company', order_num: 4 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 5 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 6 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Biyometrik kayıt (BIL mektubu ile Kanada vize merkezinde)', delivery_type: 'digital', order_num: 7 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 8 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu', delivery_type: 'digital', order_num: 9 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Seyahat sağlık sigortası', delivery_type: 'digital', order_num: 10 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: "Kanada'daki iş ortağından davet mektubu", delivery_type: 'digital', order_num: 11 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'İşveren görev yazısı', delivery_type: 'digital', order_num: 12 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Şirket faaliyet belgesi (son 3 ay içinde alınmış, e-imzalı/orijinal)', delivery_type: 'digital', order_num: 13 },
  { country: 'Kanada', visa_type: 'Ticari/İş', doc_name: 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı; yanına Banka İmza Sirküleri / Banka Yetki Belgesi eklenmeli)', delivery_type: 'digital', order_num: 14 },

  // KANADA - Çalışma/İş Vizesi
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'IMM 1295 (Kanada Dışından Çalışma İzni Başvuru Formu)', delivery_type: 'company', order_num: 1 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'IMM 5645 (Aile Bilgi Formu)', delivery_type: 'company', order_num: 2 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'IMM 5488 (Arka Plan Beyanı / Schedule A)', delivery_type: 'company', order_num: 3 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaportun orijinali (min. 6 ay geçerli)', delivery_type: 'physical', order_num: 4 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: '2 adet biyometrik fotoğraf', delivery_type: 'physical', order_num: 5 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Pasaport fotokopisi', delivery_type: 'digital', order_num: 6 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Kimlik fotokopisi', delivery_type: 'digital', order_num: 7 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Biyometrik kayıt (BIL mektubu ile Kanada vize merkezinde)', delivery_type: 'digital', order_num: 8 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İkametgah belgesi (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 9 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tam vukuatlı nüfus kayıt örneği (e-devlet, barkodlu)', delivery_type: 'digital', order_num: 10 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Adli sicil kaydı (Apostilli, İngilizce/Fransızca tercümeli)', delivery_type: 'digital', order_num: 11 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'LMIA Onay Belgesi (Labour Market Impact Assessment — işverenin ESDC\'den aldığı çalışma izni belgesi)', delivery_type: 'digital', order_num: 12 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'İş sözleşmesi', delivery_type: 'digital', order_num: 13 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Diploma ve mesleki yeterlilik belgeleri (tercümeli)', delivery_type: 'digital', order_num: 14 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'CV / Özgeçmiş (İngilizce veya Fransızca)', delivery_type: 'digital', order_num: 15 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Tıbbi muayene belgesi (IRCC onaylı panel hekim raporu — médecin désigné)', delivery_type: 'digital', order_num: 16 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: "Konaklama belgesi (Kanada'da adres veya kira sözleşmesi)", delivery_type: 'digital', order_num: 17 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Sağlık sigortası', delivery_type: 'digital', order_num: 18 },
  { country: 'Kanada', visa_type: 'Çalışma/İş Vizesi', doc_name: 'Certificat d\'Acceptation du Québec — CAQ (Québec eyaletine çalışmaya gidecekler için zorunlu)', delivery_type: 'digital', order_num: 19 },
];

async function run() {
  console.log(`Toplam ${rows.length} satır eklenecek (silme yok — sadece INSERT).`);

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
