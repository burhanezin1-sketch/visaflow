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

    const {
      clientId, applicationId,
      full_name, phone, email,
      birth_date, passport_expiry, passport_issue_date, passport_no, tc_kimlik_no,
      consulate, country, visa_type, occupation, nationality,
    } = await req.json()
    if (!clientId) return NextResponse.json({ error: 'clientId gerekli' }, { status: 400 })

    // IDOR: müşteri bu şirkete ait mi?
    const { data: clientData } = await admin
      .from('clients').select('company_id').eq('id', clientId).maybeSingle()
    if (!clientData || clientData.company_id !== staffUser.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // clients tablosunu güncelle
    const clientUpdate: Record<string, any> = {}
    if (full_name           !== undefined && full_name.trim()) clientUpdate.full_name = full_name.trim()
    if (phone               !== undefined) clientUpdate.phone               = phone || null
    if (email               !== undefined) clientUpdate.email               = email || null
    if (birth_date          !== undefined) clientUpdate.birth_date          = birth_date || null
    if (passport_issue_date !== undefined) clientUpdate.passport_issue_date = passport_issue_date || null
    if (passport_expiry     !== undefined) clientUpdate.passport_expiry     = passport_expiry || null
    if (passport_no !== undefined) {
      clientUpdate.passport_no = passport_no
        ? (() => { try { return encrypt(passport_no) } catch { return passport_no } })()
        : null
    }
    if (tc_kimlik_no !== undefined) {
      clientUpdate.tc_kimlik_no = tc_kimlik_no
        ? (() => { try { return encrypt(tc_kimlik_no) } catch { return tc_kimlik_no } })()
        : null
    }

    if (Object.keys(clientUpdate).length > 0) {
      const { error } = await admin.from('clients').update(clientUpdate).eq('id', clientId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // applications tablosunu güncelle
    if (applicationId) {
      const appUpdate: Record<string, any> = {}
      if (consulate   !== undefined) appUpdate.consulate   = consulate   || null
      if (country     !== undefined) appUpdate.country     = country     || null
      if (visa_type   !== undefined) appUpdate.visa_type   = visa_type   || null
      if (occupation  !== undefined) appUpdate.occupation  = occupation  || null
      if (nationality !== undefined) appUpdate.nationality = nationality || null
      if (Object.keys(appUpdate).length > 0) {
        await admin.from('applications').update(appUpdate).eq('id', applicationId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[update-client-info]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
