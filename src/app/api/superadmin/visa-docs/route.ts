import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function verifySuperadmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
  return !!sa
}

export async function GET(req: NextRequest) {
  const ok = await verifySuperadmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const allDocs: any[] = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await admin
      .from('visa_documents')
      .select('*')
      .order('country')
      .order('visa_type')
      .order('order_num')
      .range(from, from + pageSize - 1)

    if (error || !data?.length) break
    allDocs.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

  return NextResponse.json({ docs: allDocs })
}
