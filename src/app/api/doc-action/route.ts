import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'doc-action', 60)
  if (limited) return limited

  try {
    // Cookie tabanlı session auth
    const cookieStore = await cookies()
    const userClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { docId, action, applicationId } = await req.json()
    if (!docId || !action || !applicationId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const admin = getAdmin()

    // Kullanıcının company_id'sini al
    const { data: userData } = await admin
      .from('users').select('company_id, role').eq('id', user.id).maybeSingle()
    if (!userData?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Başvurunun bu şirkete ait olduğunu doğrula
    const { data: appData } = await admin
      .from('applications').select('company_id').eq('id', applicationId).maybeSingle()
    if (!appData || appData.company_id !== userData.company_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Evrakın bu başvuruya ait olduğunu doğrula
    const { data: docData } = await admin
      .from('user_submitted_docs').select('id, application_id').eq('id', docId).maybeSingle()
    if (!docData || docData.application_id !== applicationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'confirm_physical') {
      const { error } = await admin
        .from('user_submitted_docs')
        .update({
          physical_delivery_confirmed: true,
          physical_delivery_confirmed_at: new Date().toISOString(),
          physical_delivery_confirmed_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', docId)
        .eq('application_id', applicationId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    const ACTION_STATUS: Record<string, string> = {
      approve: 'approved',
      reject:  'pending',   // reddet → temizle, müşteri yeniden yüklesin
      elden:   'elden',
    }
    const newStatus = ACTION_STATUS[action]
    if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    const updatePayload: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }
    // Reddetmede dosyayı sil — temiz başlangıç
    if (action === 'reject') updatePayload.file_url = null

    const { data: updatedRows, error } = await admin
      .from('user_submitted_docs')
      .update(updatePayload)
      .eq('id', docId)
      .eq('application_id', applicationId)
      .select('id, doc_name, status')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const count = updatedRows?.length ?? 0
    if (count !== 1) {
      console.error(`[doc-action] UYARI: ${count} satır güncellendi! docId=${docId} applicationId=${applicationId}`, updatedRows)
    }

    return NextResponse.json({ success: true, updatedCount: count, updatedRows })
  } catch (err: any) {
    console.error('[doc-action]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
