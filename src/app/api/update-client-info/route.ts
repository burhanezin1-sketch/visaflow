import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/encryption'
import { rateLimit } from '@/lib/rateLimit'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'update-client-info', 30)
  if (limited) return limited

  try {
    const cookieStore = await cookies()
    const userClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = getAdmin()
    const { data: staffUser } = await admin
      .from('users').select('company_id').eq('id', user.id).maybeSingle()
    if (!staffUser?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { clientId, applicationId, email, birth_date, passport_expiry, passport_no, consulate } = await req.json()
    if (!clientId) return NextResponse.json({ error: 'clientId gerekli' }, { status: 400 })

    // IDOR: müşteri bu şirkete ait mi?
    const { data: clientData } = await admin
      .from('clients').select('company_id').eq('id', clientId).maybeSingle()
    if (!clientData || clientData.company_id !== staffUser.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // clients tablosunu güncelle
    const clientUpdate: Record<string, any> = {}
    if (email       !== undefined) clientUpdate.email          = email || null
    if (birth_date  !== undefined) clientUpdate.birth_date     = birth_date || null
    if (passport_expiry !== undefined) clientUpdate.passport_expiry = passport_expiry || null
    if (passport_no !== undefined) {
      clientUpdate.passport_no = passport_no
        ? (() => { try { return encrypt(passport_no) } catch { return passport_no } })()
        : null
    }

    if (Object.keys(clientUpdate).length > 0) {
      const { error } = await admin.from('clients').update(clientUpdate).eq('id', clientId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // applications tablosunu güncelle (konsolosluk)
    if (applicationId && consulate !== undefined) {
      await admin.from('applications')
        .update({ consulate: consulate || null })
        .eq('id', applicationId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[update-client-info]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
