import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const revalidate = 60

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const VIZE_TURLERI = [
  'Turistik',
  'Ticari/İş Gezisi',
  'Aile/Arkadaş Ziyareti',
  'Eğitim/Öğrenci',
  'Çalışma/İş Vizesi',
  'Aile Birleşimi Vizesi',
  'Kültürel Vize',
  'Resmi Vize',
  'Tedavi/Sağlık Vizesi',
  'Transit Vize',
]

export async function GET() {
  try {
    const admin = getAdmin()

    // Ülke listesi: visa_doc_master'dan DISTINCT include_countries
    const { data: countryData } = await admin
      .from('visa_doc_master')
      .select('include_countries')
      .not('include_countries', 'is', null)

    const countries = [
      ...new Set(
        (countryData || []).flatMap((r: { include_countries: string[] }) => r.include_countries ?? [])
      ),
    ].sort((a, b) => a.localeCompare(b, 'tr'))

    // Her ülke için sabit vize türü listesini döndür
    const result: Record<string, string[]> = {}
    for (const country of countries) {
      result[country] = VIZE_TURLERI
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
