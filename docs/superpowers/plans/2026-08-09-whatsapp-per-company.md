# Şirket Bazlı WhatsApp Numarası Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Manuel WhatsApp mesaj gönderme, her şirketin kendi `whatsapp_number`'ını kullansın; numara tanımlı değilse net bir hata versin ve global bir numaraya sessizce düşmesin.

**Architecture:** `companies` tablosuna nullable `whatsapp_number` kolonu eklenir. Süperadmin panelinde mevcut "Not" alanı deseniyle birebir aynı şekilde bir düzenleme UI'ı eklenir. `send-whatsapp` API route'u artık kendisine gönderilen `companyId`'yi kullanarak service-role Supabase client ile bu numarayı okur ve Twilio isteğinde `From` olarak kullanır; numara yoksa Twilio'ya hiç istek atmadan 400 döner.

**Tech Stack:** Next.js App Router (API routes), Supabase (Postgres + JS client), Twilio REST API, TypeScript.

## Global Constraints

- Gelen mesaj / chatbot webhook akışı (`src/app/api/webhook/whatsapp/route.ts`) değişmez.
- Şirket başına ayrı Twilio hesabı yok — tek `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`, çoklu gönderici numarası.
- `whatsapp_number` boşsa **fallback yok** — gönderim engellenir, açık hata mesajı döner.
- Migration hiçbir satırı otomatik doldurmaz; kullanıcı numarayı deploy sonrası panelden elle girecek.

---

## Task 1: `companies` tablosuna `whatsapp_number` kolonu ekle

**Files:**
- Create: `supabase/migrations/20260810_company_whatsapp_number.sql`

**Interfaces:**
- Produces: `companies.whatsapp_number` (nullable `text` kolonu) — Task 2 ve Task 3 bu kolonu okur/yazar.

- [ ] **Step 1: Migration dosyasını yaz**

```sql
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp_number text;
```

- [ ] **Step 2: Migration'ı local/staging Supabase'e uygula**

Projenin migration'ları nasıl uyguladığını kontrol et (bu repo'da `supabase/migrations/*.sql` dosyaları var — muhtemelen Supabase CLI veya panel üzerinden elle çalıştırılıyor, `package.json`'da otomatik bir "migrate" script'i yok). Dosyayı Supabase SQL Editor'de veya `supabase db push` ile uygula.

Doğrulama: Supabase Studio'da `companies` tablosunun kolon listesinde `whatsapp_number` (text, nullable) göründüğünü kontrol et.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260810_company_whatsapp_number.sql
git commit -m "Add whatsapp_number column to companies"
```

---

## Task 2: Süperadmin panelinde WhatsApp numarası düzenleme UI'ı

**Files:**
- Modify: `src/app/superadmin/(protected)/firma/page.tsx`

**Interfaces:**
- Consumes: `companies.whatsapp_number` (Task 1'de eklendi)
- Produces: Yok (UI-only, terminal deliverable)

Bu dosyada zaten "Not" alanı için birebir aynı desen var (state: `editNoteId`/`editNoteText`/`savingNote`, handler: `saveNote()`, buton + modal). WhatsApp numarası için aynı deseni tekrar et.

- [ ] **Step 1: State ekle**

`src/app/superadmin/(protected)/firma/page.tsx:61-62` civarına (mevcut `editNoteId`/`editNoteText` state'lerinin hemen altına) ekle:

```ts
const [editWaId, setEditWaId] = useState<string | null>(null)
const [editWaNumber, setEditWaNumber] = useState('')
const [savingWa, setSavingWa] = useState(false)
```

- [ ] **Step 2: Kaydetme fonksiyonunu ekle**

`saveNote()` fonksiyonunun hemen altına (`src/app/superadmin/(protected)/firma/page.tsx:142-149` civarı) ekle:

```ts
async function saveWaNumber() {
  if (!editWaId) return
  setSavingWa(true)
  const trimmed = editWaNumber.trim()
  await supabase.from('companies').update({ whatsapp_number: trimmed || null }).eq('id', editWaId)
  setCompanies(prev => prev.map(c => c.id === editWaId ? { ...c, whatsapp_number: trimmed || null } : c))
  setSavingWa(false)
  setEditWaId(null)
}
```

- [ ] **Step 3: Test et — TypeScript hatası olmadığını doğrula**

Run: `npx tsc --noEmit -p .`
Expected: Hata yok (Task 4 tamamlanana kadar `companies` objesinin tipi `any[]` olduğu için `whatsapp_number` alanı otomatik kabul edilir, tip hatası vermez).

- [ ] **Step 4: İşlemler sütununa buton ekle**

`src/app/superadmin/(protected)/firma/page.tsx:363` civarındaki "Not" butonunun hemen altına ekle:

```tsx
<button onClick={() => { setEditWaId(c.id); setEditWaNumber(c.whatsapp_number || '') }} className="fp-btn-ghost" style={{ color: c.whatsapp_number ? '#34d399' : S.muted }}>
  {c.whatsapp_number ? 'WhatsApp' : 'WhatsApp ekle'}
</button>
```

- [ ] **Step 5: Modal'ı ekle**

"Not Modal" bloğunun (`src/app/superadmin/(protected)/firma/page.tsx:436-452`) hemen altına ekle:

```tsx
{/* WhatsApp Modal */}
{editWaId !== null && (
  <div style={modalOverlay}>
    <div style={{ ...modalBox, width: '380px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0 0 1rem' }}>
        WhatsApp Numarası — {companies.find(c => c.id === editWaId)?.name}
      </h3>
      <input
        type="text"
        value={editWaNumber}
        onChange={e => setEditWaNumber(e.target.value)}
        placeholder="+905551234567"
        className="fp-inp"
        style={inpS}
      />
      <div style={{ fontSize: '11px', color: S.faint, marginTop: '4px' }}>
        Uluslararası formatta girin (örn. +905551234567). Boş bırakırsanız bu firma için manuel WhatsApp gönderimi devre dışı kalır.
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button onClick={() => setEditWaId(null)} className="fp-btn-ghost" style={{ flex: 1, padding: '9px' }}>İptal</button>
        <button onClick={saveWaNumber} disabled={savingWa} className="fp-btn-primary" style={{ flex: 2 }}>
          {savingWa ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 6: Lint ve tip kontrolü**

Run: `npx eslint "src/app/superadmin/(protected)/firma/page.tsx" && npx tsc --noEmit -p .`
Expected: Yeni eklenen kod için hata yok (dosyada zaten var olan pre-existing `any` tipi uyarıları hariç).

- [ ] **Step 7: Manuel doğrulama**

`npm run dev` çalıştır, süperadmin olarak giriş yap, `/superadmin/firma` sayfasına git:
- Bir şirket satırında "WhatsApp ekle" butonuna tıkla → modal açılmalı
- `+905551234567` gir, Kaydet'e bas → modal kapanmalı, buton metni "WhatsApp" olarak yeşile dönmeli
- Sayfayı yenile, aynı numaranın kalıcı olduğunu (Supabase'e yazıldığını) doğrula

- [ ] **Step 8: Commit**

```bash
git add "src/app/superadmin/(protected)/firma/page.tsx"
git commit -m "Add per-company WhatsApp number field to superadmin firma page"
```

---

## Task 3: `send-whatsapp` route'unu şirket numarasını kullanacak şekilde güncelle

**Files:**
- Modify: `src/app/api/send-whatsapp/route.ts`

**Interfaces:**
- Consumes: `companies.whatsapp_number` (Task 1). Request body: `{ to: string, message: string, companyId: string }` (`companyId` zaten `musteriler/[id]/page.tsx:188`'den gönderiliyor, route şu ana kadar kullanmıyordu).
- Produces: Değişmiyor — `{ sid: string }` başarı, `{ error: string }` hata (aynı sözleşme, `musteriler/[id]/page.tsx`'teki `waError` gösterim bloğu değişmeden çalışır).

- [ ] **Step 1: Mevcut davranışı gözlemle (manuel "test önce" adımı)**

Bu route gerçek Twilio/Supabase servislerine bağlı olduğundan repo'da unit test altyapısı yok (mock yok). Değişiklik öncesi mevcut davranışı belgelemek için dosyayı oku: `companyId` şu an hiç kullanılmıyor, sadece global `TWILIO_WHATSAPP_FROM` kullanılıyor. Bu, "before" referans noktası.

- [ ] **Step 2: Supabase admin client importunu ekle**

`src/app/api/send-whatsapp/route.ts` en üstüne, `webhook/whatsapp/route.ts`'teki `getAdmin()` ile birebir aynı deseni ekle:

```ts
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 3: `companyId`'yi request body'den al ve doğrula**

`const { to, message } = await req.json()` satırını şu şekilde değiştir:

```ts
const { to, message, companyId } = await req.json()

if (typeof companyId !== 'string' || !companyId.trim()) {
  return NextResponse.json({ error: 'companyId eksik.' }, { status: 400 })
}
```

- [ ] **Step 4: Şirketin numarasını çek, yoksa engelle**

Mevcut kod şurada:
```ts
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const rawFrom = process.env.TWILIO_WHATSAPP_FROM

if (!accountSid || !authToken || !rawFrom) {
  return NextResponse.json({ error: 'Twilio credentials eksik.' }, { status: 500 })
}
```

Bunu şu şekilde değiştir:

```ts
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

if (!accountSid || !authToken) {
  return NextResponse.json({ error: 'Twilio credentials eksik.' }, { status: 500 })
}

const admin = getAdmin()
const { data: company } = await admin
  .from('companies')
  .select('whatsapp_number')
  .eq('id', companyId)
  .single()

const rawFrom = company?.whatsapp_number
if (!rawFrom) {
  return NextResponse.json({ error: 'Bu firma için WhatsApp numarası tanımlanmamış. Süperadmin panelinden ekleyin.' }, { status: 400 })
}
```

- [ ] **Step 5: Tip kontrolü**

Run: `npx tsc --noEmit -p .`
Expected: Hata yok.

- [ ] **Step 6: Lint**

Run: `npx eslint src/app/api/send-whatsapp/route.ts`
Expected: Yeni koddan kaynaklı hata yok.

- [ ] **Step 7: Manuel doğrulama — numara yokken**

`npm run dev` ile lokal sunucuyu çalıştır. `whatsapp_number`'ı boş bıraktığın bir test şirketinin bir müşteri profiline git, WhatsApp sekmesinden mesaj göndermeyi dene.
Expected: Kırmızı hata kutusunda "Bu firma için WhatsApp numarası tanımlanmamış. Süperadmin panelinden ekleyin." mesajı görünür; Twilio'ya hiç istek gitmez (network sekmesinde `api.twilio.com` isteği olmamalı).

- [ ] **Step 8: Manuel doğrulama — numara varken**

Task 2'de panelden numara girdiğin şirketin bir müşteri profiline git, mesaj gönder.
Expected: Yeşil "gönderildi" kutusu görünür; Twilio Console'da (veya loglarda) mesajın doğru `From` numarasından gittiği teyit edilir.

- [ ] **Step 9: Commit**

```bash
git add src/app/api/send-whatsapp/route.ts
git commit -m "Use per-company whatsapp_number when sending manual WhatsApp messages"
```

---

## Task 4: Push

- [ ] **Step 1: Chatbot regresyon kontrolü**

`webhook/whatsapp/route.ts` bu planda hiç değiştirilmedi, ama değişikliğin gelen-mesaj akışını etkilemediğini teyit etmek için: chatbot'un halihazırda kurulu olduğu numaraya WhatsApp'tan bir test mesajı gönder.
Expected: Chatbot öncekiyle aynı şekilde otomatik yanıt veriyor.

- [ ] **Step 2: Tüm commit'lerin doğru sırada olduğunu kontrol et**

Run: `git log --oneline -5`
Expected: Task 1, 2, 3'ün commit'leri sırayla görünür.

- [ ] **Step 3: Push et**

```bash
git push origin main
```
