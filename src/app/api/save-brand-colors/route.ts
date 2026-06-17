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

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/

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

  const { primary_color, secondary_color } = await req.json()

  if (primary_color && !HEX_RE.test(primary_color))
    return NextResponse.json({ error: 'Geçersiz primary_color değeri' }, { status: 400 })
  if (secondary_color && !HEX_RE.test(secondary_color))
    return NextResponse.json({ error: 'Geçersiz secondary_color değeri' }, { status: 400 })

  const { error } = await admin
    .from('companies')
    .update({ primary_color: primary_color || null, secondary_color: secondary_color || null })
    .eq('id', userData.company_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
