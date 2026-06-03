import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { encrypt } from '@/lib/encryption'
import { rateLimit } from '@/lib/rateLimit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'portal-upload', 20)
  if (limited) return limited

  try {
    const formData = await req.formData()
    const files = formData.getAll('file') as File[]
    const token = formData.get('token') as string
    const clientId = formData.get('clientId') as string
    const applicationId = formData.get('applicationId') as string
    const docName = formData.get('docName') as string
    const idx = formData.get('idx') as string
    if (!files.length || !token || !clientId || !applicationId || !docName) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Token doğrula
    const { data: clients } = await supabase.rpc('get_client_by_token', { token })
    const client = clients?.[0]
    if (!client || client.id !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // applicationId'nin bu müşteriye ait olduğunu doğrula (IDOR koruması)
    const { data: appData } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('client_id', clientId)
      .maybeSingle()
    if (!appData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uploadedUrls: string[] = []
    const ts = Date.now()

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const buf = Buffer.from(await f.arrayBuffer())
      const fileName = `${clientId}/${idx}_${ts}_${i}_${f.name}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, buf, { contentType: f.type, upsert: true })
      if (uploadError) {
        return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
      }
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      uploadedUrls.push(urlData.publicUrl)
    }

    const fileUrlValue = uploadedUrls.length === 1 ? uploadedUrls[0] : JSON.stringify(uploadedUrls)

    await supabase.from('documents').delete().eq('application_id', applicationId).eq('name', docName)
    await supabase.from('documents').insert({
      application_id: applicationId,
      name: docName,
      file_url: fileUrlValue,
      file_name: files.map(f => f.name).join(', '),
      status: 'uploaded',
      delivery_type: 'digital',
      company_id: client.company_id,
    })

    // user_submitted_docs'u güncelle (yeni 3-katmanlı mimari)
    await supabase
      .from('user_submitted_docs')
      .update({ file_url: fileUrlValue, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .eq('doc_name', docName)

    // OCR — sadece görsel ve pasaport/kimlik evrakları için (ilk resim dosyası)
    let ocrFields: string[] = []
    const isIdDoc = ['pasaport', 'passport', 'kimlik', 'id card'].some(k => docName.toLowerCase().includes(k))
    const file = files.find(f => f.type.startsWith('image/')) ?? null

    if (isIdDoc && file) {
      const buffer = Buffer.from(await file.arrayBuffer())
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

    return NextResponse.json({ success: true, fileUrls: uploadedUrls, ocrFields })
  } catch (err: any) {
    console.error('[portal-upload]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
