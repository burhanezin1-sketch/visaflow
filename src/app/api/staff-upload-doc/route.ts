import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
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
  const limited = rateLimit(req, 'staff-upload-doc', 30)
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

    const admin = getAdmin()
    const { data: staffUser } = await admin
      .from('users').select('company_id').eq('id', user.id).maybeSingle()
    if (!staffUser?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const docId = formData.get('docId') as string
    const clientId = formData.get('clientId') as string
    const docName = formData.get('docName') as string

    if (!file || !docId || !clientId || !docName) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    // IDOR: müşteri aynı firmaya mı ait?
    const { data: clientData } = await admin
      .from('clients').select('company_id').eq('id', clientId).maybeSingle()
    if (!clientData || clientData.company_id !== staffUser.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${clientId}/staff_${docId}_${Date.now()}_${safeFileName}`

    const { error: uploadError } = await admin.storage
      .from('documents')
      .upload(storagePath, buf, { contentType: file.type, upsert: true })
    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    // Signed URL (1 yıl)
    const { data: signedData } = await admin.storage
      .from('documents').createSignedUrl(storagePath, 60 * 60 * 24 * 365)
    const fileUrl = signedData?.signedUrl
      ?? admin.storage.from('documents').getPublicUrl(storagePath).data.publicUrl

    await admin.from('user_submitted_docs')
      .update({ file_url: fileUrl, status: 'pending' })
      .eq('id', docId)

    // OCR — pasaport/kimlik + görsel ise
    let ocrFields: string[] = []
    const isIdDoc = ['pasaport', 'passport', 'kimlik', 'id card'].some(k => docName.toLowerCase().includes(k))

    if (isIdDoc && file.type.startsWith('image/')) {
      try {
        const base64 = buf.toString('base64')
        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type as any, data: base64 } },
              { type: 'text', text: 'Bu pasaport veya kimlik belgesini tara. Yalnızca şu JSON formatını döndür, başka hiçbir metin yazma:\n{"passport_no":"belge numarası","birth_date":"YYYY-MM-DD","passport_expiry":"YYYY-MM-DD"}\nOkuyamadığın alanlar için null yaz. Tarihler YYYY-MM-DD formatında olsun.' }
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
            await admin.from('clients').update(updateData).eq('id', clientId)
            ocrFields = Object.keys(updateData)
          }
        }
      } catch (ocrErr: any) {
        console.error('[staff-upload-doc] OCR error:', ocrErr.message)
      }
    }

    return NextResponse.json({ success: true, fileUrl, ocrFields })
  } catch (err: any) {
    console.error('[staff-upload-doc]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
