import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
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

  const { data: userData } = await admin
    .from('users').select('company_id').eq('id', user.id).maybeSingle()
  if (!userData?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Tüm applications of this company
  const { data: appRows } = await admin
    .from('applications')
    .select('id, client_id, country, visa_type')
    .eq('company_id', userData.company_id)
  if (!appRows?.length) return NextResponse.json({ docs: [] })

  const appIds = appRows.map(a => a.id)

  // Pending physical docs
  const { data: docs, error } = await admin
    .from('user_submitted_docs')
    .select('id, doc_name, application_id, marked_physical_at')
    .in('application_id', appIds)
    .eq('delivery_type', 'physical')
    .eq('physical_delivery_confirmed', false)
    .not('marked_physical_at', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!docs?.length) return NextResponse.json({ docs: [] })

  // Client bilgilerini ekle
  const clientIds = [...new Set(appRows.map(a => a.client_id).filter(Boolean))]
  const { data: clients } = await admin
    .from('clients').select('id, full_name').in('id', clientIds)

  const clientMap = Object.fromEntries((clients || []).map(c => [c.id, c.full_name]))
  const appMap = Object.fromEntries(appRows.map(a => [a.id, a]))

  const result = docs.map(d => {
    const app = appMap[d.application_id]
    return {
      ...d,
      client_id: app?.client_id,
      client_name: clientMap[app?.client_id] ?? '-',
      country: app?.country,
      visa_type: app?.visa_type,
    }
  })

  return NextResponse.json({ docs: result })
}
