import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const ACTION_STATUS: Record<string, string> = {
  approve: 'approved',
  reject:  'rejected',
  elden:   'elden',
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getAdmin()

    // Verify caller identity via their JWT
    const { data: { user }, error: authErr } = await supabase.auth.getUser(accessToken)
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Caller's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .maybeSingle()
    if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { docId, action, applicationId } = await req.json()
    if (!docId || !action || !applicationId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const newStatus = ACTION_STATUS[action]
    if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    // Verify application belongs to caller's company
    const { data: appData } = await supabase
      .from('applications')
      .select('company_id')
      .eq('id', applicationId)
      .maybeSingle()
    if (!appData || appData.company_id !== userData.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_submitted_docs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', docId)
      .eq('application_id', applicationId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[doc-action]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
