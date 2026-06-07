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

    // Vize türleri: visa_doc_master'dan DISTINCT include_visa_types (UNNEST karşılığı)
    const { data: vtData } = await admin
      .from('visa_doc_master')
      .select('include_visa_types')
      .not('include_visa_types', 'is', null)

    const allVisaTypes = [
      ...new Set(
        (vtData || []).flatMap((r: { include_visa_types: string[] }) => r.include_visa_types ?? [])
      ),
    ].sort((a, b) => a.localeCompare(b, 'tr'))

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

    // Her ülke için tüm vize türlerini döndür
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
