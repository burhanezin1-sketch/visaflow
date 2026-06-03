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
    const { token, clientId, applicationId, docName, fileUrls } = await req.json()

    if (!token || !clientId || !applicationId || !docName || !Array.isArray(fileUrls) || fileUrls.length === 0) {
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

    const fileUrlValue = fileUrls.length === 1 ? fileUrls[0] : JSON.stringify(fileUrls)

    const { error } = await supabase
      .from('user_submitted_docs')
      .update({ file_url: fileUrlValue, status: 'pending' })
      .eq('application_id', applicationId)
      .eq('doc_name', docName)

    if (error) {
      console.error('[portal-update-url]', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[portal-update-url]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
