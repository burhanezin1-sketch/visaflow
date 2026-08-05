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

const RESET_REDIRECT_URL = 'https://app.vectropus.com/reset-password'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'forgot-password', 5)
  if (limited) return limited

  try {
    const { email } = await req.json()
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi.' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('[forgot-password] RESEND_API_KEY eksik')
      return NextResponse.json({ error: 'Mail servisi yapılandırılmamış.' }, { status: 500 })
    }

    const supabase = getAdmin()

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: RESET_REDIRECT_URL },
    })

    // Hesap enumeration'ı önlemek için — kullanıcı bulunamasa da her zaman
    // genel bir başarı yanıtı dönüyoruz; mail sadece kullanıcı gerçekten
    // varsa gönderiliyor.
    if (error || !data?.properties?.hashed_token) {
      if (error) console.error('[forgot-password] generateLink error:', error.message)
      return NextResponse.json({ success: true })
    }

    const resetLink = `${RESET_REDIRECT_URL}?token=${data.properties.hashed_token}`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vectropus <noreply@vectropus.com>',
        to: [email],
        subject: 'Şifre Sıfırlama Talebi',
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #0d1b2e;">
            <h2 style="margin-bottom: 8px;">Şifre Sıfırlama</h2>
            <p style="color: #3a4a5e; line-height: 1.6;">
              Vectropus hesabınız için bir şifre sıfırlama talebinde bulunuldu.
              Aşağıdaki butona tıklayarak yeni bir şifre belirleyebilirsiniz.
            </p>
            <p style="margin: 28px 0;">
              <a href="${resetLink}" style="display:inline-block; background:#0d1b2e; color:#ffffff; padding:12px 28px; border-radius:8px; text-decoration:none; font-size:14px; letter-spacing:0.5px;">
                Şifremi Sıfırla
              </a>
            </p>
            <p style="color: #8a9bb0; font-size: 12px; line-height: 1.6;">
              Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
              Bağlantı 1 saat içinde geçerliliğini yitirir.
            </p>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const errData = await emailRes.json().catch(() => ({}))
      console.error('[forgot-password] Resend error:', errData)
      return NextResponse.json({ error: 'E-posta gönderilemedi.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[forgot-password]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
