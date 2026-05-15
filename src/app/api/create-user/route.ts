import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function getCallerInfo() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
  if (sa) return { isSuperadmin: true, companyId: null as string | null, role: null as string | null }

  const { data: u } = await supabase.from('users').select('company_id, role').eq('id', user.id).single()
  return { isSuperadmin: false, companyId: u?.company_id ?? null, role: u?.role ?? null }
}

export async function POST(request: Request) {
  const caller = await getCallerInfo()
  if (!caller) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { full_name, email, password, role, company_id } = await request.json()

  if (!caller.isSuperadmin) {
    if (caller.role !== 'admin' || caller.companyId !== company_id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    company_id: company_id,
    full_name,
    email,
    role,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const caller = await getCallerInfo()
  if (!caller) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'userId gerekli' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  if (!caller.isSuperadmin) {
    if (caller.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }
    const { data: targetUser } = await supabaseAdmin.from('users').select('company_id').eq('id', userId).single()
    if (!targetUser || targetUser.company_id !== caller.companyId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }
  }

  await supabaseAdmin.from('leads').update({ claimed_by: null }).eq('claimed_by', userId)
  await supabaseAdmin.from('clients').update({ danisan_id: null }).eq('danisan_id', userId)

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
