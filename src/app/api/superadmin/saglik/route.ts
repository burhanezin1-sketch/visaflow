import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

export async function GET() {
  const ok = await verifySuperadmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: leads },
    { count: monthlyApps },
    { data: recentActivity },
    { data: logs },
  ] = await Promise.all([
    admin.from('leads').select('*', { count: 'exact', head: true }),
    admin.from('applications').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    admin.from('activity_logs').select('user_id').gte('created_at', sevenDaysAgo.toISOString()),
    admin.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20),
  ])

  const activeUsers7d = new Set(
    (recentActivity ?? []).map((r: any) => r.user_id).filter(Boolean)
  ).size

  return NextResponse.json({
    leads: leads ?? 0,
    monthlyApps: monthlyApps ?? 0,
    activeUsers7d,
    logs: logs ?? [],
  })
}
