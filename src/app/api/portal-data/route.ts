import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const supabase = getAdmin()

    const { data: clients } = await supabase.rpc('get_client_by_token', { token })
    const client = clients?.[0] ?? null
    if (!client) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

    const { data: appArr } = await supabase
      .from('applications')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
    const application = appArr?.[0] ?? null

    let visaDocuments: any[] = []
    let uploadedDocs: any[] = []

    if (application?.country && application?.visa_type) {
      const { data: vd } = await supabase
        .from('visa_documents')
        .select('*')
        .eq('country', application.country)
        .eq('visa_type', application.visa_type)
        .order('order_num', { ascending: true })
      visaDocuments = vd || []

      const { data: ud } = await supabase
        .from('documents')
        .select('*')
        .eq('application_id', application.id)
      uploadedDocs = ud || []
    }

    return NextResponse.json({ client, application, visaDocuments, uploadedDocs })
  } catch (err: any) {
    console.error('[portal-data]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
