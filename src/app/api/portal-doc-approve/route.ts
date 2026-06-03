import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const { token, clientId, applicationId, docId, fileUrls } = await req.json()

    if (!token || !clientId || !applicationId || !docId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: clients } = await supabase.rpc('get_client_by_token', { token })
    const client = clients?.[0]
    if (!client || client.id !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: appData } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('client_id', clientId)
      .maybeSingle()
    if (!appData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase
      .from('user_submitted_docs')
      .update({
        status: 'approved',
        file_url: JSON.stringify(fileUrls ?? []),
        updated_at: new Date().toISOString(),
      })
      .eq('id', docId)
      .eq('application_id', applicationId)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[portal-doc-approve]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
