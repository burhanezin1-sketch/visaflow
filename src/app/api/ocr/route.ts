import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/encryption'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { storagePath, mimeType, clientId, token } = await req.json()
    if (!storagePath || !mimeType || !clientId || !token) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Token doğrulama
    const { data: clients } = await supabaseAdmin.rpc('get_client_by_token', { token })
    const client = clients?.[0]
    if (!client || client.id !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dosyayı admin client ile doğrudan indir (bucket private olsa bile çalışır)
    const { data: blob, error: dlError } = await supabaseAdmin.storage
      .from('documents')
      .download(storagePath)
    if (dlError || !blob) {
      return NextResponse.json({ error: 'Download failed: ' + dlError?.message }, { status: 500 })
    }

    const buffer = await blob.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mediaType = mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Bu pasaport veya kimlik belgesini tara. Yalnızca şu JSON formatını döndür, başka hiçbir metin yazma:
{"passport_no":"belge numarası","birth_date":"YYYY-MM-DD","passport_expiry":"YYYY-MM-DD"}
Okuyamadığın veya göremediğin alanlar için null yaz. Tarihler mutlaka YYYY-MM-DD formatında olsun.`,
          }
        ]
      }]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = raw.match(/\{[\s\S]*?\}/)
    if (!match) return NextResponse.json({ error: 'OCR parse failed', raw }, { status: 500 })

    const extracted = JSON.parse(match[0])

    const updateData: Record<string, string> = {}
    if (extracted.passport_no) updateData.passport_no = encrypt(String(extracted.passport_no))
    if (extracted.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(extracted.birth_date)) {
      updateData.birth_date = extracted.birth_date
    }
    if (extracted.passport_expiry && /^\d{4}-\d{2}-\d{2}$/.test(extracted.passport_expiry)) {
      updateData.passport_expiry = extracted.passport_expiry
    }

    if (Object.keys(updateData).length > 0) {
      await supabaseAdmin.from('clients').update(updateData).eq('id', clientId)
    }

    return NextResponse.json({ success: true, fields: Object.keys(updateData) })
  } catch (err: any) {
    console.error('[ocr]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
