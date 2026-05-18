import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/serverAuth'
import { rateLimit } from '@/lib/rateLimit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_LEN = (s: unknown, n: number) => typeof s === 'string' && s.length > 0 && s.length <= n

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'niyet-mektubu', 5)
  if (limited) return limited

  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { clientName, country, visaType, travelDate, returnDate, accommodation, consulate, inviter } = body

    // Input length validation — prevents prompt injection and cost inflation
    if (
      !MAX_LEN(clientName, 120) ||
      !MAX_LEN(country, 80) ||
      !MAX_LEN(visaType, 80) ||
      (accommodation && !MAX_LEN(accommodation, 300)) ||
      (consulate && !MAX_LEN(consulate, 120)) ||
      (inviter && !MAX_LEN(inviter, 120))
    ) {
      return NextResponse.json({ error: 'Geçersiz giriş uzunluğu.' }, { status: 400 })
    }

    const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

    const formatDate = (d: string) =>
      d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '[Tarih]'

    const travelDateStr = formatDate(travelDate)
    const returnDateStr = formatDate(returnDate)
    const accommodationStr = accommodation?.trim() || '[Konaklama adresi]'
    const consulateStr = consulate?.trim() || `${country} Konsolosluğu`

    const prompt = `Sen profesyonel bir vize danışmanısın. Aşağıdaki bilgilere dayanarak Türkçe, resmi ve inandırıcı bir vize niyet mektubu yaz.

Bilgiler:
- Ad Soyad: ${clientName}
- Başvuru: ${country} ${visaType} vizesi
- Gidilecek Konsolosluk: ${consulateStr}
- Seyahat Tarihi: ${travelDateStr}
- Dönüş Tarihi: ${returnDateStr}
- Konaklama Adresi: ${accommodationStr}
${inviter ? `- Davet Eden: ${inviter}` : ''}
- Yazım Tarihi: ${today}

Mektup şu bölümleri sırasıyla içermeli:
1. Sağ üstte tarih (${today})
2. "${consulateStr}'na," başlığı
3. Kısa giriş — kim olduğu ve neden yazıldığı
4. Seyahatin amacı (${visaType} amacıyla, ${country}'a gidileceği)
5. Gidiş tarihi (${travelDateStr}) ve dönüş tarihi (${returnDateStr})
6. Konaklama adresi: ${accommodationStr}
${inviter ? `7. Davet eden: ${inviter} tarafından davet edildiği` : ''}
8. Mali yeterliliği ve ülkeye kesinlikle döneceğini belirten paragraf
9. Kapanış (Saygılarımla vb.)
10. Alt kısımda: "${clientName}" ve tarih

Köşeli parantezli placeholder'ları ([Tarih], [Konaklama adresi] vb.) olduğu gibi bırak, uydurma.
Sadece mektup metnini yaz. Hiç açıklama, başlık veya not ekleme. Resmi, doğal ve inandırıcı bir Türkçe kullan.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ letter: text })
  } catch (err: any) {
    console.error('[niyet-mektubu]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
