import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const applicationId = req.nextUrl.searchParams.get('application_id')
  if (!applicationId) return NextResponse.json({ error: 'Missing application_id' }, { status: 400 })

  const cookieStore = await cookies()
  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Caller's company
  const { data: userData } = await admin
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .maybeSingle()
  if (!userData?.company_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify application belongs to caller's company
  const { data: appData } = await admin
    .from('applications')
    .select('company_id')
    .eq('id', applicationId)
    .maybeSingle()
  if (!appData || appData.company_id !== userData.company_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await admin
    .from('user_submitted_docs')
    .select('*')
    .eq('application_id', applicationId)
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let docs = data ?? []

  // Schengen Turistik fallback: uçak + konaklama garantisi
  const schengenCountries = [
    'Almanya', 'Avusturya', 'Belçika', 'Çekya', 'Danimarka', 'Estonya',
    'Finlandiya', 'Fransa', 'Hollanda', 'İspanya', 'İsveç', 'İsviçre',
    'İtalya', 'İzlanda', 'Letonya', 'Liechtenstein', 'Litvanya',
    'Lüksemburg', 'Macaristan', 'Malta', 'Norveç', 'Polonya', 'Portekiz',
    'Slovakya', 'Slovenya', 'Yunanistan',
  ]

  const { data: appRow } = await admin
    .from('applications')
    .select('country, visa_type')
    .eq('id', applicationId)
    .maybeSingle()

  if (appRow?.visa_type === 'Turistik' && schengenCountries.includes(appRow.country)) {
    const hasUcak = docs.some((d: any) => d.doc_name?.includes('uçak bileti rezervasyonu'))
    const hasOtel = docs.some((d: any) => d.doc_name?.includes('konaklama rezervasyonu'))

    const toInsert: { application_id: string; doc_name: string; delivery_type: string; status: string }[] = []

    if (!hasUcak) toInsert.push({
      application_id: applicationId,
      doc_name: 'Gidiş-dönüş uçak bileti rezervasyonu',
      delivery_type: 'digital',
      status: 'pending',
    })

    if (!hasOtel) toInsert.push({
      application_id: applicationId,
      doc_name: 'Otel / konaklama rezervasyonu (seyahat tarihleri ile uyumlu)',
      delivery_type: 'digital',
      status: 'pending',
    })

    if (toInsert.length > 0) {
      const { data: inserted } = await admin
        .from('user_submitted_docs')
        .insert(toInsert)
        .select()
      if (inserted) docs = [...docs, ...inserted]
    }
  }

  // Kanada + Eğitim/Öğrenci + ogrenci: finansal evrak enjeksiyonu + akademik belge açıklama güncelleme
  if (appRow?.country === 'Kanada' && appRow?.visa_type === 'Eğitim/Öğrenci') {
    // 1. Finansal evrakları yoksa ekle
    const finansalToInsert: { application_id: string; doc_name: string; delivery_type: string; status: string }[] = []

    const hasBanka = docs.some((d: any) =>
      d.doc_name?.includes('banka hesap dökümü') || d.doc_name?.includes('şahsi banka')
    )
    if (!hasBanka) finansalToInsert.push({
      application_id: applicationId,
      doc_name: 'Sponsor veya Şahsın Son 3 aylık şahsi banka hesap dökümü (banka kaşeli ve ıslak imzalı, Kanada için yeterli bakiye gösteren)',
      delivery_type: 'digital',
      status: 'pending',
    })

    const hasGelir = docs.some((d: any) =>
      d.doc_name?.includes('bordro') || d.doc_name?.includes('Vergi levhası') || d.doc_name?.includes('Emeklilik belgesi') || d.doc_name?.includes('Sponsorun Gelir')
    )
    if (!hasGelir) finansalToInsert.push({
      application_id: applicationId,
      doc_name: 'Sponsorun Gelir / İşyeri Belgeleri (Maaş bordrosu, Vergi levhası veya Emeklilik belgesi)',
      delivery_type: 'digital',
      status: 'pending',
    })

    if (finansalToInsert.length > 0) {
      const { data: inserted } = await admin
        .from('user_submitted_docs')
        .insert(finansalToInsert)
        .select()
      if (inserted) docs = [...docs, ...inserted]
    }

    // 2. Öğrenci belgesi ve Transkript isimlerine İngilizce notu ekle
    const suffix = ' (İngilizce olarak okuldan alınmalı veya e-devletten İngilizce barkodlu indirilmelidir)'
    const akademikIds: string[] = []
    const akademikUpdates: { id: string; doc_name: string }[] = []

    docs.forEach((d: any) => {
      const isAkademik =
        (d.doc_name?.toLowerCase().includes('öğrenci belgesi') || d.doc_name?.toLowerCase().includes('transkript'))
        && !d.doc_name?.includes('İngilizce olarak okuldan')
      if (isAkademik) {
        akademikUpdates.push({ id: d.id, doc_name: d.doc_name + suffix })
        akademikIds.push(d.id)
      }
    })

    for (const upd of akademikUpdates) {
      await admin
        .from('user_submitted_docs')
        .update({ doc_name: upd.doc_name })
        .eq('id', upd.id)
    }

    if (akademikIds.length > 0) {
      docs = docs.map((d: any) =>
        akademikIds.includes(d.id)
          ? { ...d, doc_name: d.doc_name + suffix }
          : d
      )
    }
  }

  return NextResponse.json({ docs })
}
