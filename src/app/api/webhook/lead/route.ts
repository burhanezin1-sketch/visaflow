import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// n8n bu endpoint'i çağırır: POST /api/webhook/lead
// Header: x-api-key: <WEBHOOK_SECRET>
// Body: { phone, full_name?, user_message?, company_id }
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'webhook-lead', 60)
  if (limited) return limited

  const apiKey = req.headers.get('x-api-key')
  if (!process.env.WEBHOOK_SECRET || apiKey !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { phone, full_name, user_message, company_id } = await req.json()

    if (!phone || !company_id) {
      return NextResponse.json({ error: 'phone ve company_id zorunlu' }, { status: 400 })
    }

    const supabase = getAdmin()

    // Aktif (dönüştürülmemiş/kaybolmamış) lead var mı?
    const { data: existing } = await supabase
      .from('leads')
      .select('id, user_message')
      .eq('phone', phone)
      .eq('company_id', company_id)
      .not('status', 'in', '("converted","lost")')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      const updateData: Record<string, string> = {}
      if (user_message) updateData.user_message = user_message
      if (full_name) updateData.full_name = full_name
      if (Object.keys(updateData).length > 0) {
        await supabase.from('leads').update(updateData).eq('id', existing.id)
      }
      return NextResponse.json({ success: true, lead_id: existing.id, action: 'updated' })
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        phone,
        full_name: full_name || phone,
        user_message: user_message || null,
        company_id,
        status: 'waiting',
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, lead_id: newLead.id, action: 'created' })
  } catch (err: any) {
    console.error('[webhook/lead]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
