import { NextResponse } from 'next/server'

export const revalidate = 300 // 5 dakika cache

export async function GET() {
  try {
    const [r1, r2] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY', { next: { revalidate: 300 } }).then(r => r.json()),
      fetch('https://api.frankfurter.app/latest?from=USD&to=TRY', { next: { revalidate: 300 } }).then(r => r.json()),
    ])
    const EUR_TRY: number = r1?.rates?.TRY ?? 0
    const USD_TRY: number = r2?.rates?.TRY ?? 0
    if (!EUR_TRY || !USD_TRY) throw new Error('empty rates')
    return NextResponse.json({ EUR_TRY, USD_TRY }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } })
  } catch {
    // Frankfurter başarısız olursa open.er-api.com'u dene
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 300 } }).then(r => r.json())
      const USD_TRY: number = r?.rates?.TRY ?? 0
      const EUR_USD: number = 1 / (r?.rates?.EUR ?? 1)
      return NextResponse.json({ EUR_TRY: EUR_USD * USD_TRY, USD_TRY }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } })
    } catch {
      return NextResponse.json({ EUR_TRY: 0, USD_TRY: 0 }, { status: 503 })
    }
  }
}
