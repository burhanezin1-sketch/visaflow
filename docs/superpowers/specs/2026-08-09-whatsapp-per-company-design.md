# Şirket Bazlı WhatsApp Numarası — Tasarım

## Problem

`send-whatsapp` API route'u (`src/app/api/send-whatsapp/route.ts`), müşteri profilinden manuel WhatsApp mesajı gönderirken hangi şirketten geldiğine bakmaksızın tek bir global Twilio numarasını (`TWILIO_WHATSAPP_FROM` env var) kullanıyor. Yeni eklenen bir şirket için chatbot istenmediğinden Twilio hiç kurulmamıştı; ama mevcut kod zaten şirket bazlı bir ayrım yapmadığından, o şirketin danışmanları manuel mesaj da gönderemiyordu — çünkü ortada şirkete özel bir numara kavramı yoktu.

Hedef: her şirketin kendi WhatsApp numarasından manuel mesaj gönderebilmesi, chatbot (gelen mesaj otomasyonu) kurulup kurulmamasından bağımsız olarak.

## Kapsam dışı

- Gelen mesaj / chatbot webhook akışı (`src/app/api/webhook/whatsapp/route.ts`) değişmiyor. Hangi numaraya chatbot bağlı olacağı tamamen Twilio konsolunda o numaranın webhook ayarına bağlı — koddan yönetilmiyor.
- Şirket başına ayrı Twilio hesabı (ayrı `ACCOUNT_SID`/`AUTH_TOKEN`) desteklenmiyor. Tüm şirketler tek Twilio hesabı altındaki farklı gönderici numaralarını (Sender) kullanıyor.
- Mevcut/pilot şirketin numarasının otomatik doldurulması yok — kullanıcı bunu deploy sonrası süperadmin panelinden elle girecek.

## Veri modeli

```sql
-- supabase/migrations/20260810_company_whatsapp_number.sql
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_number text;
```

- Nullable, varsayılan yok.
- Format: E.164 (`+905551234567`), Twilio `From` alanına `whatsapp:` öneki route içinde eklenecek.
- Migration hiçbir satırı otomatik doldurmuyor — tüm şirketlerde başlangıçta boş.

## Süperadmin UI

`src/app/superadmin/(protected)/firma/page.tsx` — mevcut "not düzenle" / "deneme süresi düzenle" desenine uygun şekilde:

- Şirket satırına "WhatsApp Numarası" alanı eklenir.
- Tıklanınca inline input açılır (`editWaId` / `editWaNumber` state, mevcut `editNoteId`/`editNoteText` deseniyle birebir aynı yapı).
- Kaydet → `supabase.from('companies').update({ whatsapp_number: val }).eq('id', companyId)`.
- Numara boşsa satırda "Tanımlı değil" etiketi gösterilir.

## `send-whatsapp` route değişikliği

`src/app/api/send-whatsapp/route.ts`:

- Route body'sinden zaten gelen `companyId` artık kullanılacak (şu an tamamen görmezden geliniyor).
- Service-role Supabase client ile (`webhook/whatsapp/route.ts`'teki `getAdmin()` deseniyle aynı) `companies` tablosundan `whatsapp_number` çekilir.
- **Numara varsa:** Twilio'ya bu numaradan (`From: whatsapp:+...`) gönderim yapılır. `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN` hâlâ ortak/global env var.
- **Numara yoksa:** Twilio'ya hiç istek atılmadan `400` ile `{ error: 'Bu firma için WhatsApp numarası tanımlanmamış. Süperadmin panelinden ekleyin.' }` dönülür.
- Global `TWILIO_WHATSAPP_FROM` env var'ı fallback olarak **kullanılmaz** — numara yoksa gönderim engellenir (yanlış şirket numarasından mesaj gitme riskini önlemek için, bkz. "Neden fallback yok").

## Neden fallback yok

Şirket numarası boşken sessizce başka bir (örn. pilot/ana) şirketin numarasından göndermek, müşteriye yanlış firma kimliğiyle mesaj gitmesi demek — hem kafa karıştırıcı hem de WhatsApp Business Politikası açısından riskli. Açık, anlaşılır bir hata; sessiz yanlış-numaradan-gönderimden daha güvenli.

## Hata / UX

- Client tarafında (`musteriler/[id]/page.tsx`) zaten var olan `waStatus === 'error' && waError` gösterim bloğu değişmeden kullanılacak — route'tan dönen yeni hata mesajı otomatik olarak orada görünecek.

## Test planı

1. `whatsapp_number` dolu bir şirketten manuel mesaj gönder → Twilio isteğinin doğru `From` ile gittiğini doğrula.
2. `whatsapp_number` boş bir şirketten gönderme dene → net Türkçe hata mesajının UI'da göründüğünü doğrula, Twilio'ya hiç istek gitmediğini doğrula.
3. Mevcut chatbot akışı (`webhook/whatsapp/route.ts`) hiç değişmediği için otomatik regresyon riski yok; yine de bir kez elle inbound mesaj gönderip chatbot'un yanıt verdiğini teyit et.
