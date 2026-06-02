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

export async function GET() {
  try {
    const admin = getAdmin()

    // 1. Ülke listesi: eski visa_documents tablosundan (sayfalı)
    const countryRows: { country: string; visa_type: string }[] = []
    let from = 0
    const pageSize = 1000
    while (true) {
      const { data, error } = await admin
        .from('visa_documents')
        .select('country, visa_type')
        .range(from, from + pageSize - 1)
      if (error || !data?.length) break
      countryRows.push(...data)
      if (data.length < pageSize) break
      from += pageSize
    }

    // 2. Vize türleri: YALNIZCA visa_package_rules'tan (tek kaynak)
    // visa_documents'tan eski isimler ('Ticari/İş' vb.) karışmasın
    const { data: rulesData } = await admin
      .from('visa_package_rules')
      .select('visa_type')
      .eq('is_active', true)

    const allVisaTypes = [...new Set<string>(
      (rulesData || []).map((r: { visa_type: string }) => r.visa_type)
    )].sort((a, b) => a.localeCompare(b, 'tr'))

    // 3. Ülke listesi: visa_documents'tan DISTINCT ülkeler
    const countries = [...new Set(countryRows.map(r => r.country))].sort(
      (a, b) => a.localeCompare(b, 'tr')
    )

    // 4. Her ülke için tüm vize türlerini döndür
    // 3-katmanlı mimari her ülke + vize tipi kombinasyonunu destekliyor;
    // country_specific_docs'ta kayıt yoksa standard + occupation evrakları gelir.
    const result: Record<string, string[]> = {}
    for (const country of countries) {
      result[country] = allVisaTypes
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
