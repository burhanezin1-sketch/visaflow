import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { encrypt } from '@/lib/encryption'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const token = formData.get('token') as string
    const clientId = formData.get('clientId') as string
    const applicationId = formData.get('applicationId') as string
    const docName = formData.get('docName') as string
    const idx = formData.get('idx') as string

    if (!file || !token || !clientId || !applicationId || !docName) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Token doğrula
    const { data: clients } = await supabase.rpc('get_client_by_token', { token })
    const client = clients?.[0]
    if (!client || client.id !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dosyayı buffer'a al
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = `${clientId}/${idx}_${Date.now()}_${file.name}`

    // Storage'a yükle (service role → RLS bypass)
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)

    // Eski kaydı sil, yenisini ekle (service role → company_id olmadan da çalışır)
    await supabase.from('documents').delete().eq('application_id', applicationId).eq('name', docName)
    await supabase.from('documents').insert({
      application_id: applicationId,
      name: docName,
      file_url: urlData.publicUrl,
      file_name: file.name,
      status: 'uploaded',
      delivery_type: 'digital',
      company_id: client.company_id,
    })

    // OCR — sadece görsel ve pasaport/kimlik evrakları için
    let ocrFields: string[] = []
    const isIdDoc = ['pasaport', 'passport', 'kimlik', 'id card'].some(k => docName.toLowerCase().includes(k))

    if (isIdDoc && file.type.startsWith('image/')) {
      try {
        const base64 = buffer.toString('base64')
        const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              {
                type: 'text',
                text: 'Bu pasaport veya kimlik belgesini tara. Yalnızca şu JSON formatını döndür, başka hiçbir metin yazma:\n{"passport_no":"belge numarası","birth_date":"YYYY-MM-DD","passport_expiry":"YYYY-MM-DD"}\nOkuyamadığın alanlar için null yaz. Tarihler YYYY-MM-DD formatında olsun.',
              }
            ]
          }]
        })

        const raw = message.content[0].type === 'text' ? message.content[0].text : ''
        const match = raw.match(/\{[\s\S]*?\}/)
        if (match) {
          const extracted = JSON.parse(match[0])
          const updateData: Record<string, string> = {}

          if (extracted.passport_no) {
            try { updateData.passport_no = encrypt(String(extracted.passport_no)) }
            catch { updateData.passport_no = String(extracted.passport_no) }
          }
          if (extracted.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(extracted.birth_date)) {
            updateData.birth_date = extracted.birth_date
          }
          if (extracted.passport_expiry && /^\d{4}-\d{2}-\d{2}$/.test(extracted.passport_expiry)) {
            updateData.passport_expiry = extracted.passport_expiry
          }

          if (Object.keys(updateData).length > 0) {
            await supabase.from('clients').update(updateData).eq('id', clientId)
            ocrFields = Object.keys(updateData)
          }
        }
      } catch (ocrErr: any) {
        console.error('[portal-upload] OCR error:', ocrErr.message)
      }
    }

    return NextResponse.json({ success: true, fileUrl: urlData.publicUrl, ocrFields })
  } catch (err: any) {
    console.error('[portal-upload]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
