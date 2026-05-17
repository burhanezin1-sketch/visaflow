import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/encryption'
import { getAdminClient } from '@/lib/serverAuth'

export async function POST(req: NextRequest) {
  // Session kontrolü
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, field } = await req.json()
  if (!clientId || !field) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const ALLOWED_FIELDS = ['passport_no']
  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: 'Field not allowed' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Kullanıcının company_id'sini al
  const { data: userData } = await admin
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!userData?.company_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // company_id eşleşmesi zorunlu — farklı firmadan müşteri okunamaz
  const { data, error } = await admin
    .from('clients')
    .select(field)
    .eq('id', clientId)
    .eq('company_id', userData.company_id)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const raw = (data as any)[field]
  const value = raw ? decrypt(raw) : null

  return NextResponse.json({ value })
}
