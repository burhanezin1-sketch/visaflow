import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'

// Twilio'dan gelen WA mesajlarını işler.
// Twilio webhook URL: https://yourdomain.com/api/webhook/whatsapp
// Bu endpoint n8n'in yerini alır — konuşma geçmişini DB'de tutar.

const MAX_HISTORY = 20 // son kaç mesajı Claude'a gönder

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length === 12) return '+' + digits
  if (digits.startsWith('0') && digits.length === 11) return '+90' + digits.slice(1)
  if (digits.length === 10) return '+90' + digits
  return '+' + digits
}

function twilioTwiML(body: string): NextResponse {
  const safe = body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`,
    { status: 200, headers: { 'Content-Type': 'text/xml' } }
  )
}

function validateTwilioSignature(req: NextRequest, params: Record<string, string>): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false

  const signature = req.headers.get('x-twilio-signature') || ''
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://' + req.headers.get('host')}/api/webhook/whatsapp`

  const sortedKeys = Object.keys(params).sort()
  const strToSign = url + sortedKeys.map(k => k + params[k]).join('')
  const computed = crypto.createHmac('sha1', authToken).update(strToSign, 'utf8').digest('base64')

  // Timing-safe comparison — string === would leak timing info
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const formText = await req.text()
    const params: Record<string, string> = {}
    new URLSearchParams(formText).forEach((v, k) => { params[k] = v })

    // Twilio imza doğrulaması (production ortamında aktif)
    if (process.env.NODE_ENV === 'production' && !validateTwilioSignature(req, params)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const fromRaw = params['From'] || ''
    const body = (params['Body'] || '').trim()
    const profileName = params['ProfileName'] || ''

    if (!fromRaw || !body) {
      return new NextResponse('', { status: 200 })
    }

    const phone = normalizePhone(fromRaw.replace('whatsapp:', ''))
    const companyId = process.env.TWILIO_COMPANY_ID
    if (!companyId) {
      console.error('[whatsapp webhook] TWILIO_COMPANY_ID env var eksik')
      return twilioTwiML('Bir hata oluştu, lütfen tekrar deneyin.')
    }

    const supabase = getAdmin()

    // Şirket bilgisini al (sistem prompt için)
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single()
    const companyName = company?.name || 'Vize Danışmanlık'

    // Mevcut lead'i bul (converted/lost olmayanlar)
    const { data: existing } = await supabase
      .from('leads')
      .select('id, conversation_history, ai_summary, full_name')
      .eq('phone', phone)
      .eq('company_id', companyId)
      .not('status', 'in', '("converted","lost")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const history: { role: string; content: string }[] = existing?.conversation_history || []

    // Yeni kullanıcı mesajını ekle
    history.push({ role: 'user', content: body })

    // Son MAX_HISTORY mesajı Claude'a gönder
    const recentHistory = history.slice(-MAX_HISTORY)

    // Claude API çağrısı
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const systemPrompt = `Sen ${companyName} adlı vize danışmanlık firmasının WhatsApp asistanısın.

Görevin:
1. Müşteriye samimi ve kısa yanıtlar ver (max 3-4 cümle)
2. Hangi ülke ve vize türü istediklerini öğren
3. Adlarını öğren (eğer tanımıyorsan)
4. Firmanın ekibinin kısa sürede onlarla iletişime geçeceğini bildir
5. Türkçe yanıt ver, resmi ama sıcak bir dil kullan

Her yanıtının SONUNA şu formatta kısa bir özet ekle (kullanıcıya gösterme):
[ÖZET: (kullanıcının ne istediğini 1 cümlede özetle, örn: "Almanya Schengen vizesi için bilgi istiyor")]

Eğer henüz yeterli bilgi yoksa özet kısmını boş bırak: [ÖZET: ]`

    const messages = recentHistory.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    })

    const fullReply = (response.content[0] as any).text as string

    // [ÖZET: ...] kısmını ayıkla
    const summaryMatch = fullReply.match(/\[ÖZET:\s*([^\]]*)\]/)
    const aiSummary = summaryMatch ? summaryMatch[1].trim() : null
    const replyText = fullReply.replace(/\[ÖZET:[^\]]*\]/g, '').trim()

    // Asistan yanıtını geçmişe ekle (özetsiz)
    history.push({ role: 'assistant', content: replyText })

    // full_name: WhatsApp ProfileName > mevcut full_name > telefon
    const fullName = profileName || existing?.full_name || phone

    if (existing) {
      const updateData: any = { conversation_history: history, full_name: fullName }
      if (aiSummary) updateData.ai_summary = aiSummary
      await supabase.from('leads').update(updateData).eq('id', existing.id)
    } else {
      await supabase.from('leads').insert({
        phone,
        full_name: fullName,
        company_id: companyId,
        status: 'waiting',
        conversation_history: history,
        ai_summary: aiSummary || null,
        user_message: body,
      })
    }

    // wa_messages tablosuna da kaydet (gelen mesaj)
    await supabase.from('wa_messages').insert({
      company_id: companyId,
      message: body,
      direction: 'inbound',
      sent_at: new Date().toISOString(),
    }).then(() => {})

    return twilioTwiML(replyText)
  } catch (err: any) {
    console.error('[whatsapp webhook]', err.message)
    return twilioTwiML('Bir hata oluştu, lütfen tekrar deneyin.')
  }
}
