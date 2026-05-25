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
    const allRows: { country: string; visa_type: string }[] = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await admin
        .from('visa_documents')
        .select('country, visa_type')
        .range(from, from + pageSize - 1)
      if (error || !data?.length) break
      allRows.push(...data)
      if (data.length < pageSize) break
      from += pageSize
    }

    // Build country → sorted visa_types[] map
    const map: Record<string, Set<string>> = {}
    for (const row of allRows) {
      if (!map[row.country]) map[row.country] = new Set()
      map[row.country].add(row.visa_type)
    }

    const result: Record<string, string[]> = {}
    for (const country of Object.keys(map).sort((a, b) => a.localeCompare(b, 'tr'))) {
      result[country] = [...map[country]].sort((a, b) => a.localeCompare(b, 'tr'))
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}
