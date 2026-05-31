import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 'portal-data', 30)
  if (limited) return limited

  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const supabase = getAdmin()

    const { data: clients } = await supabase.rpc('get_client_by_token', { token })
    const client = clients?.[0] ?? null
    if (!client) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

    // Strip sensitive fields before returning to portal
    const { passport_no: _pn, ...safeClient } = client

    const { data: appArr } = await supabase
      .from('applications')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    const application = appArr?.[0] ?? null

    let userSubmittedDocs: any[] = []

    if (application?.id) {
      const { data: usd } = await supabase
        .from('user_submitted_docs')
        .select('*')
        .eq('application_id', application.id)
        .order('id', { ascending: true })
      userSubmittedDocs = usd || []
    }

    return NextResponse.json({ client: safeClient, application, userSubmittedDocs })
  } catch (err: any) {
    console.error('[portal-data]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
