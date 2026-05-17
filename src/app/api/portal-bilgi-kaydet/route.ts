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
    const { token, clientId, email, phone, consentApproved } = await req.json()

    if (!token || !clientId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const supabase = getAdmin()

    const { data: clients } = await supabase.rpc('get_client_by_token', { token })
    const client = clients?.[0]
    if (!client || client.id !== clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatePayload: Record<string, any> = {}
    if (email !== undefined) updatePayload.email = email ?? null
    if (phone !== undefined) updatePayload.phone = phone ?? null
    if (consentApproved === true) updatePayload.consent_approved = true

    const { error } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', clientId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[portal-bilgi-kaydet]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
