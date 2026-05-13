import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { full_name, email, password, role, company_id } = await request.json()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    company_id: company_id,
    full_name,
    email,
    role,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'userId gerekli' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Public tablolardaki referansları temizle
  await supabaseAdmin.from('leads').update({ claimed_by: null }).eq('claimed_by', userId)
  await supabaseAdmin.from('clients').update({ danisan_id: null }).eq('danisan_id', userId)
  await supabaseAdmin.from('wa_messages').delete().eq('user_id', userId)
  await supabaseAdmin.from('tasks').update({ assigned_to: null }).eq('assigned_to', userId)
  await supabaseAdmin.from('superadmins').delete().eq('id', userId)
  await supabaseAdmin.from('notes').delete().eq('user_id', userId)

  // users tablosundan sil
  await supabaseAdmin.from('users').delete().eq('id', userId)

  // Auth'dan sil
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}