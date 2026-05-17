import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/encryption'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientId, field } = await req.json()
  if (!clientId || !field) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const ALLOWED_FIELDS = ['passport_no']
  if (!ALLOWED_FIELDS.includes(field)) {
    return NextResponse.json({ error: 'Field not allowed' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('clients')
    .select(field)
    .eq('id', clientId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const raw = data[field]
  const value = raw ? decrypt(raw) : null

  return NextResponse.json({ value })
}
