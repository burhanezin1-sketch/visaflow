import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/serverAuth'

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length === 12) return '+' + digits
  if (digits.startsWith('0') && digits.length === 11) return '+90' + digits.slice(1)
  if (digits.length === 10) return '+90' + digits
  return '+' + digits
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { to, message } = await req.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const rawFrom = process.env.TWILIO_WHATSAPP_FROM

    if (!accountSid || !authToken || !rawFrom) {
      return NextResponse.json({ error: 'Twilio credentials eksik.' }, { status: 500 })
    }

    const toFormatted = 'whatsapp:' + normalizePhone(to)
    const fromFormatted = rawFrom.startsWith('whatsapp:') ? rawFrom : 'whatsapp:' + rawFrom

    const body = new URLSearchParams({
      To: toFormatted,
      From: fromFormatted,
      Body: message,
    })

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: body.toString(),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('[send-whatsapp] Twilio error:', data)
      return NextResponse.json({ error: data.message || 'Twilio hatası.' }, { status: 400 })
    }

    return NextResponse.json({ sid: data.sid })
  } catch (err: any) {
    console.error('[send-whatsapp]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
