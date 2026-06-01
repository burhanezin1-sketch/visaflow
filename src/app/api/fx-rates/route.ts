import { NextResponse } from 'next/server'

export const revalidate = 300 // 5 dakika cache

export async function GET() {
  try {
    // Tek istek: USD bazlı EUR ve TRY oranlarını çek
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,TRY', { next: { revalidate: 300 } }).then(r => r.json())
    const USD_TRY: number = r?.rates?.TRY ?? 0
    const USD_EUR: number = r?.rates?.EUR ?? 0
    // EUR→TRY = USD→TRY ÷ USD→EUR
    const EUR_TRY: number = USD_EUR > 0 ? USD_TRY / USD_EUR : 0
    if (!EUR_TRY || !USD_TRY) throw new Error('empty rates')
    return NextResponse.json({ EUR_TRY, USD_TRY }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } })
  } catch {
    // Fallback: open.er-api.com
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 300 } }).then(r => r.json())
      const USD_TRY: number = r?.rates?.TRY ?? 0
      const USD_EUR: number = r?.rates?.EUR ?? 0
      const EUR_TRY: number = USD_EUR > 0 ? USD_TRY / USD_EUR : 0
      return NextResponse.json({ EUR_TRY, USD_TRY }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } })
    } catch {
      return NextResponse.json({ EUR_TRY: 0, USD_TRY: 0 }, { status: 503 })
    }
  }
}
