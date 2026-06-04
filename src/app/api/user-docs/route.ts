import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const applicationId = req.nextUrl.searchParams.get('application_id')
  if (!applicationId) return NextResponse.json({ error: 'Missing application_id' }, { status: 400 })

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

  // Caller's company
  const { data: userData } = await admin
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .maybeSingle()
  if (!userData?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify application belongs to caller's company
  const { data: appData } = await admin
    .from('applications')
    .select('company_id')
    .eq('id', applicationId)
    .maybeSingle()
  if (!appData || appData.company_id !== userData.company_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await admin
    .from('user_submitted_docs')
    .select('*')
    .eq('application_id', applicationId)
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ docs: data ?? [] })
}
