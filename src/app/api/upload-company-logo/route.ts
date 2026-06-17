import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  const { data: userData } = await admin
    .from('users').select('company_id').eq('id', user.id).maybeSingle()
  if (!userData?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: company } = await admin
    .from('companies').select('plan').eq('id', userData.company_id).maybeSingle()
  if (!company || company.plan !== 'kurumsal') {
    return NextResponse.json({ error: 'Bu özellik Kurumsal pakette kullanılabilir.' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Dosya boyutu 2 MB\'ı aşamaz' }, { status: 400 })
  }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
    return NextResponse.json({ error: 'Yalnızca JPG, PNG, WEBP veya SVG dosyası yüklenebilir' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'png'
  const path = `${userData.company_id}/logo.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await admin.storage
    .from('company-logos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from('company-logos').getPublicUrl(path)

  // Cache-bust: append timestamp so browser reloads after re-upload
  const logoUrl = `${publicUrl}?t=${Date.now()}`

  await admin.from('companies').update({ logo_url: logoUrl }).eq('id', userData.company_id)

  return NextResponse.json({ logo_url: logoUrl })
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { data: userData } = await admin
    .from('users').select('company_id').eq('id', user.id).maybeSingle()
  if (!userData?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await admin.from('companies').update({ logo_url: null }).eq('id', userData.company_id)

  return NextResponse.json({ success: true })
}
