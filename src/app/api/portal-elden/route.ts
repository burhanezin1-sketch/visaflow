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
    const { token, clientId, applicationId, docName } = await req.json()

    if (!token || !clientId || !applicationId || !docName) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = getAdmin()

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

    await supabase.from('documents').delete().eq('application_id', applicationId).eq('name', docName)
    await supabase.from('documents').insert({
      application_id: applicationId,
      name: docName,
      file_url: null,
      file_name: null,
      status: 'physical',
      delivery_type: 'physical',
      company_id: client.company_id,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[portal-elden]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
