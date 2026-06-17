// Veritabanında Türkçe saklanan dinamik alanların çeviri mapping'leri.
// Anahtar: normalize edilmiş Türkçe değer (küçük harf, trim).
// Kullanım: tField(value, 'country', locale)

type LangMap = { en: string; de: string; pl: string; ar: string; ru: string; es: string }

// ──────────────── ÜLKELER ────────────────
const countryMap: Record<string, LangMap> = {
  'almanya':                        { en: 'Germany',          de: 'Deutschland',      pl: 'Niemcy',         ar: 'ألمانيا',           ru: 'Германия',         es: 'Alemania' },
  'fransa':                         { en: 'France',           de: 'Frankreich',       pl: 'Francja',        ar: 'فرنسا',             ru: 'Франция',          es: 'Francia' },
  'italya':                         { en: 'Italy',            de: 'Italien',          pl: 'Włochy',         ar: 'إيطاليا',           ru: 'Италия',           es: 'Italia' },
  'i̇talya':                         { en: 'Italy',            de: 'Italien',          pl: 'Włochy',         ar: 'إيطاليا',           ru: 'Италия',           es: 'Italia' },
  'ispanya':                        { en: 'Spain',            de: 'Spanien',          pl: 'Hiszpania',      ar: 'إسبانيا',           ru: 'Испания',          es: 'España' },
  'i̇spanya':                        { en: 'Spain',            de: 'Spanien',          pl: 'Hiszpania',      ar: 'إسبانيا',           ru: 'Испания',          es: 'España' },
  'isveç':                          { en: 'Sweden',           de: 'Schweden',         pl: 'Szwecja',        ar: 'السويد',            ru: 'Швеция',           es: 'Suecia' },
  'i̇sveç':                          { en: 'Sweden',           de: 'Schweden',         pl: 'Szwecja',        ar: 'السويد',            ru: 'Швеция',           es: 'Suecia' },
  'isviçre':                        { en: 'Switzerland',      de: 'Schweiz',          pl: 'Szwajcaria',     ar: 'سويسرا',            ru: 'Швейцария',        es: 'Suiza' },
  'i̇sviçre':                        { en: 'Switzerland',      de: 'Schweiz',          pl: 'Szwajcaria',     ar: 'سويسرا',            ru: 'Швейцария',        es: 'Suiza' },
  'hollanda':                       { en: 'Netherlands',      de: 'Niederlande',      pl: 'Holandia',       ar: 'هولندا',            ru: 'Нидерланды',       es: 'Países Bajos' },
  'belçika':                        { en: 'Belgium',          de: 'Belgien',          pl: 'Belgia',         ar: 'بلجيكا',            ru: 'Бельгия',          es: 'Bélgica' },
  'avusturya':                      { en: 'Austria',          de: 'Österreich',       pl: 'Austria',        ar: 'النمسا',            ru: 'Австрия',          es: 'Austria' },
  'danimarka':                      { en: 'Denmark',          de: 'Dänemark',         pl: 'Dania',          ar: 'الدنمارك',          ru: 'Дания',            es: 'Dinamarca' },
  'polonya':                        { en: 'Poland',           de: 'Polen',            pl: 'Polska',         ar: 'بولندا',            ru: 'Польша',           es: 'Polonia' },
  'yunanistan':                     { en: 'Greece',           de: 'Griechenland',     pl: 'Grecja',         ar: 'اليونان',           ru: 'Греция',           es: 'Grecia' },
  'çekya':                          { en: 'Czech Republic',   de: 'Tschechien',       pl: 'Czechy',         ar: 'جمهورية التشيك',    ru: 'Чехия',            es: 'República Checa' },
  'hırvatistan':                    { en: 'Croatia',          de: 'Kroatien',         pl: 'Chorwacja',      ar: 'كرواتيا',           ru: 'Хорватия',         es: 'Croacia' },
  'estonya':                        { en: 'Estonia',          de: 'Estland',          pl: 'Estonia',        ar: 'إستونيا',           ru: 'Эстония',          es: 'Estonia' },
  'slovenya':                       { en: 'Slovenia',         de: 'Slowenien',        pl: 'Słowenia',       ar: 'سلوفينيا',          ru: 'Словения',         es: 'Eslovenia' },
  'ingiltere':                      { en: 'United Kingdom',   de: 'Vereinigtes Königreich', pl: 'Wielka Brytania', ar: 'المملكة المتحدة', ru: 'Великобритания', es: 'Reino Unido' },
  'i̇ngiltere':                      { en: 'United Kingdom',   de: 'Vereinigtes Königreich', pl: 'Wielka Brytania', ar: 'المملكة المتحدة', ru: 'Великобритания', es: 'Reino Unido' },
  'uk':                             { en: 'United Kingdom',   de: 'Vereinigtes Königreich', pl: 'Wielka Brytania', ar: 'المملكة المتحدة', ru: 'Великобритания', es: 'Reino Unido' },
  'kanada':                         { en: 'Canada',           de: 'Kanada',           pl: 'Kanada',         ar: 'كندا',              ru: 'Канада',           es: 'Canadá' },
  'japonya':                        { en: 'Japan',            de: 'Japan',            pl: 'Japonia',        ar: 'اليابان',           ru: 'Япония',           es: 'Japón' },
  'güney kore':                     { en: 'South Korea',      de: 'Südkorea',         pl: 'Korea Południowa', ar: 'كوريا الجنوبية', ru: 'Южная Корея',     es: 'Corea del Sur' },
  'abd':                            { en: 'USA',              de: 'USA',              pl: 'USA',            ar: 'الولايات المتحدة',  ru: 'США',              es: 'EE. UU.' },
  'amerika birleşik devletleri':    { en: 'USA',              de: 'USA',              pl: 'USA',            ar: 'الولايات المتحدة',  ru: 'США',              es: 'EE. UU.' },
  'schengen':                       { en: 'Schengen',         de: 'Schengen',         pl: 'Strefa Schengen', ar: 'شنغن',             ru: 'Шенген',           es: 'Schengen' },
}

// ──────────────── VİZE TÜRLERİ ────────────────
const visaTypeMap: Record<string, LangMap> = {
  'turistik':                       { en: 'Tourist',          de: 'Touristisch',      pl: 'Turystyczna',    ar: 'سياحية',            ru: 'Туристическая',    es: 'Turística' },
  'turist':                         { en: 'Tourist',          de: 'Touristisch',      pl: 'Turystyczna',    ar: 'سياحية',            ru: 'Туристическая',    es: 'Turística' },
  'turistik vize':                  { en: 'Tourist Visa',     de: 'Touristenvisum',   pl: 'Wiza turystyczna', ar: 'تأشيرة سياحية',  ru: 'Туристическая виза', es: 'Visa turística' },
  'ticari/iş gezisi':               { en: 'Business Trip',    de: 'Geschäftsreise',   pl: 'Podróż biznesowa', ar: 'رحلة عمل',        ru: 'Деловая поездка',  es: 'Viaje de negocios' },
  'iş':                             { en: 'Business',         de: 'Geschäftlich',     pl: 'Biznesowa',      ar: 'عمل',               ru: 'Деловая',          es: 'Negocios' },
  'eğitim/öğrenci':                 { en: 'Education/Student', de: 'Bildung/Student', pl: 'Edukacja/Student', ar: 'تعليم/طالب',      ru: 'Образование/Студент', es: 'Educación/Estudiante' },
  'öğrenci':                        { en: 'Student',          de: 'Student',          pl: 'Student',        ar: 'طالب',              ru: 'Студент',          es: 'Estudiante' },
  'öğrenci (tier 4)':               { en: 'Student (Tier 4)', de: 'Student (Tier 4)', pl: 'Student (Tier 4)', ar: 'طالب (المستوى 4)', ru: 'Студент (Tier 4)', es: 'Estudiante (Tier 4)' },
  'aile birleşimi':                 { en: 'Family Reunification', de: 'Familienzusammenführung', pl: 'Łączenie rodzin', ar: 'لم شمل الأسرة',  ru: 'Воссоединение семьи', es: 'Reagrupación familiar' },
  'aile birleşimi vizesi':          { en: 'Family Reunification Visa', de: 'Familienzusammenführungsvisum', pl: 'Wiza łączenia rodzin', ar: 'تأشيرة لم شمل الأسرة', ru: 'Виза воссоединения семьи', es: 'Visa de reagrupación familiar' },
  'aile/arkadaş ziyareti':          { en: 'Family/Friend Visit', de: 'Familien-/Freundesbesuch', pl: 'Wizyta rodzinna/przyjacielska', ar: 'زيارة عائلية/أصدقاء', ru: 'Визит к семье/друзьям', es: 'Visita familiar/amigos' },
  'çalışan vizesi':                 { en: 'Work Visa',        de: 'Arbeitsvisum',     pl: 'Wiza pracownicza', ar: 'تأشيرة عمل',       ru: 'Рабочая виза',     es: 'Visa de trabajo' },
  'çalışma/iş vizesi':              { en: 'Work Visa',        de: 'Arbeitsvisum',     pl: 'Wiza pracownicza', ar: 'تأشيرة عمل',       ru: 'Рабочая виза',     es: 'Visa de trabajo' },
  'transit vize':                   { en: 'Transit Visa',     de: 'Transitvisum',     pl: 'Wiza tranzytowa', ar: 'تأشيرة عبور',       ru: 'Транзитная виза',  es: 'Visa de tránsito' },
  'resmi vize':                     { en: 'Official Visa',    de: 'Offizielle Visum', pl: 'Wiza służbowa',   ar: 'تأشيرة رسمية',      ru: 'Официальная виза', es: 'Visa oficial' },
  'kültür vize':                    { en: 'Cultural Visa',    de: 'Kulturvisum',      pl: 'Wiza kulturalna', ar: 'تأشيرة ثقافية',     ru: 'Культурная виза',  es: 'Visa cultural' },
  'kültürel vize':                  { en: 'Cultural Visa',    de: 'Kulturvisum',      pl: 'Wiza kulturalna', ar: 'تأشيرة ثقافية',     ru: 'Культурная виза',  es: 'Visa cultural' },
  'tedavi/sağlık vizesi':           { en: 'Medical/Health Visa', de: 'Medizinisches Visum', pl: 'Wiza medyczna', ar: 'تأشيرة طبية',    ru: 'Медицинская виза', es: 'Visa médica' },
}

// ──────────────── MESLEKLER ────────────────
const occupationMap: Record<string, LangMap> = {
  'calisan':          { en: 'Employed',          de: 'Angestellt',         pl: 'Zatrudniony',      ar: 'موظف',              ru: 'Работающий',       es: 'Empleado' },
  'çalışan':          { en: 'Employed',          de: 'Angestellt',         pl: 'Zatrudniony',      ar: 'موظف',              ru: 'Работающий',       es: 'Empleado' },
  'sirket_sahibi':    { en: 'Business Owner',    de: 'Unternehmer',        pl: 'Właściciel firmy', ar: 'صاحب عمل',          ru: 'Владелец бизнеса', es: 'Empresario' },
  'isveren':          { en: 'Business Owner',    de: 'Arbeitgeber',        pl: 'Pracodawca',       ar: 'صاحب عمل',          ru: 'Работодатель',     es: 'Empleador' },
  'devlet_memuru':    { en: 'Civil Servant',     de: 'Beamter',            pl: 'Urzędnik',         ar: 'موظف حكومي',        ru: 'Госслужащий',      es: 'Funcionario público' },
  'ogrenci':          { en: 'Student',           de: 'Student',            pl: 'Student',          ar: 'طالب',              ru: 'Студент',          es: 'Estudiante' },
  'öğrenci':          { en: 'Student',           de: 'Student',            pl: 'Student',          ar: 'طالب',              ru: 'Студент',          es: 'Estudiante' },
  'emekli':           { en: 'Retired',           de: 'Rentner',            pl: 'Emeryt',           ar: 'متقاعد',            ru: 'Пенсионер',        es: 'Jubilado' },
  'ev_hanimi':        { en: 'Not Working',       de: 'Nicht berufstätig',  pl: 'Bezrobotny',       ar: 'لا يعمل',           ru: 'Безработный',      es: 'Sin empleo' },
  'ev_hanimi_meslek': { en: 'Homemaker',         de: 'Hausfrau/Hausmann',  pl: 'Gospodyni domowa', ar: 'ربة منزل',          ru: 'Домохозяйка',      es: 'Ama de casa' },
  'calismiyor':       { en: 'Not Working',       de: 'Nicht berufstätig',  pl: 'Bezrobotny',       ar: 'لا يعمل',           ru: 'Не работает',      es: 'Sin empleo' },
  'serbest meslek':   { en: 'Self-employed',     de: 'Selbstständig',      pl: 'Samozatrudnienie', ar: 'مستقل',             ru: 'Самозанятый',      es: 'Autónomo' },
  'kira geliri':      { en: 'Rental Income',     de: 'Mieteinnahmen',      pl: 'Dochody z najmu',  ar: 'دخل الإيجار',       ru: 'Доход от аренды',  es: 'Ingresos por alquiler' },
}

// ──────────────── TESLİM TÜRLERİ ────────────────
const deliveryTypeMap: Record<string, LangMap> = {
  'digital':  { en: 'Digital',   de: 'Digital',     pl: 'Cyfrowy',      ar: 'رقمي',   ru: 'Цифровой',  es: 'Digital' },
  'physical': { en: 'Physical',  de: 'Physisch',    pl: 'Fizyczny',     ar: 'يدوي',   ru: 'Физический', es: 'Físico' },
  'firma':    { en: 'Company',   de: 'Unternehmen', pl: 'Firma',        ar: 'الشركة', ru: 'Компания',  es: 'Empresa' },
}

export type FieldCategory = 'country' | 'visaType' | 'occupation' | 'deliveryType'

const MAPS: Record<FieldCategory, Record<string, LangMap>> = {
  country:      countryMap,
  visaType:     visaTypeMap,
  occupation:   occupationMap,
  deliveryType: deliveryTypeMap,
}

/**
 * Veritabanından gelen Türkçe değeri aktif locale'e çevirir.
 * Bulamazsa orijinali döner (safe fallback).
 */
export function tField(
  value: string | null | undefined,
  category: FieldCategory,
  locale: string,
): string {
  if (!value) return value ?? ''
  if (locale === 'tr') return value
  const map = MAPS[category]
  // Normalize: küçük harf + trim (hem "Almanya" hem "almanya" eşleşir)
  const key = value.trim().toLowerCase()
  const entry = map[key]
  if (!entry) return value
  return (entry as any)[locale] ?? value
}
