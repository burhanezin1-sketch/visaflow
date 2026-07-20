import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Sen bir pasaport okuma uzmanısın. Verilen pasaport görselinden MRZ (Machine Readable Zone) ve görünür alanlardan şu bilgileri çıkar:
- Pasaport numarası (sağ üst köşede, genellikle 1-2 harf + 6-7 rakam, örn: U12345678)
- TC Kimlik Numarası (11 haneli sayı, varsa)
- Ad (Given names)
- Soyad (Surname/Family name)
- Doğum tarihi (DD.MM.YYYY formatında)
- Pasaport verilme tarihi (DD.MM.YYYY formatında)
- Pasaport son geçerlilik tarihi (DD.MM.YYYY formatında)

MRZ satırları genellikle pasaportun alt kısmında '<' karakterleriyle ayrılmış iki satır halinde bulunur. MRZ'den de bu bilgileri çıkarabilirsin.

Görsel kalitesi düşükse veya bir alan okunamazsa o alanı boş string olarak döndür — asla tahmin etme veya uydurma.

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"passport_no":"","tc_kimlik_no":"","first_name":"","last_name":"","birth_date":"GG.AA.YYYY","issue_date":"GG.AA.YYYY","expiry_date":"GG.AA.YYYY"}`

// GG.AA.YYYY / GG-AA-YYYY / GG/AA/YYYY -> YYYY-MM-DD (input type="date" ISO formatı bekliyor)
function toIsoDate(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  const dmy = s.match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  return undefined
}

// Henüz kaydedilmemiş (yeni) bir müşteri için pasaport görselini OCR ile okur.
// clients tablosuna yazmaz — sadece formu önceden doldurmak için ham alanları döner.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'passport-ocr', 20)
  if (limited) return limited

  try {
    const cookieStore = await cookies()
    const userClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: staffUser } = await admin
      .from('users').select('company_id').eq('id', user.id).maybeSingle()
    if (!staffUser?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Missing or invalid file' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const base64 = buf.toString('base64')

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: file.type as any, data: base64 } },
          { type: 'text', text: 'Bu pasaport görselini yukarıdaki talimatlara göre tara ve JSON döndür.' },
        ]
      }]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) return NextResponse.json({ error: 'OCR parse failed' }, { status: 500 })

    const extracted = JSON.parse(match[0])
    const fields: Record<string, string> = {}
    if (extracted.first_name) fields.ad = String(extracted.first_name).trim()
    if (extracted.last_name) fields.soyad = String(extracted.last_name).trim()
    if (extracted.passport_no) fields.passport_no = String(extracted.passport_no).trim()
    if (extracted.tc_kimlik_no) {
      const tc = String(extracted.tc_kimlik_no).replace(/\s/g, '')
      if (/^\d{11}$/.test(tc)) fields.tc_kimlik_no = tc
    }
    const birthIso = toIsoDate(extracted.birth_date)
    if (birthIso) fields.birth_date = birthIso
    const issueIso = toIsoDate(extracted.issue_date)
    if (issueIso) fields.passport_issue_date = issueIso
    const expiryIso = toIsoDate(extracted.expiry_date)
    if (expiryIso) fields.passport_expiry = expiryIso

    return NextResponse.json({ success: true, fields })
  } catch (err: any) {
    console.error('[passport-ocr]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
