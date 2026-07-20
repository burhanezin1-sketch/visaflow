import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: file.type as any, data: base64 } },
          {
            type: 'text',
            text: `Bu pasaport veya kimlik belgesini tara. Yalnızca şu JSON formatını döndür, başka hiçbir metin yazma:
{"ad":"isim","soyad":"soyisim","passport_no":"belge numarası","birth_date":"YYYY-MM-DD","passport_issue_date":"YYYY-MM-DD","passport_expiry":"YYYY-MM-DD"}
Okuyamadığın veya göremediğin alanlar için null yaz. Tarihler mutlaka YYYY-MM-DD formatında olsun.`,
          }
        ]
      }]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) return NextResponse.json({ error: 'OCR parse failed' }, { status: 500 })

    const extracted = JSON.parse(match[0])
    const fields: Record<string, string> = {}
    if (extracted.ad) fields.ad = String(extracted.ad)
    if (extracted.soyad) fields.soyad = String(extracted.soyad)
    if (extracted.passport_no) fields.passport_no = String(extracted.passport_no)
    if (extracted.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(extracted.birth_date)) {
      fields.birth_date = extracted.birth_date
    }
    if (extracted.passport_issue_date && /^\d{4}-\d{2}-\d{2}$/.test(extracted.passport_issue_date)) {
      fields.passport_issue_date = extracted.passport_issue_date
    }
    if (extracted.passport_expiry && /^\d{4}-\d{2}-\d{2}$/.test(extracted.passport_expiry)) {
      fields.passport_expiry = extracted.passport_expiry
    }

    return NextResponse.json({ success: true, fields })
  } catch (err: any) {
    console.error('[passport-ocr]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
