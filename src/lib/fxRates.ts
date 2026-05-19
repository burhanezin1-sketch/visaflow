export type FxRates = { EUR_TRY: number; USD_TRY: number }

export async function fetchFxRates(): Promise<FxRates> {
  try {
    const [r1, r2] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY').then(r => r.json()),
      fetch('https://api.frankfurter.app/latest?from=USD&to=TRY').then(r => r.json()),
    ])
    return {
      EUR_TRY: r1?.rates?.TRY ?? 0,
      USD_TRY: r2?.rates?.TRY ?? 0,
    }
  } catch {
    return { EUR_TRY: 0, USD_TRY: 0 }
  }
}

export function amountToTRY(amount: number, currency: string, rates: FxRates): number {
  if (currency === 'EUR' && rates.EUR_TRY) return amount * rates.EUR_TRY
  if (currency === 'USD' && rates.USD_TRY) return amount * rates.USD_TRY
  return amount
}

export const CUR_SYM: Record<string, string> = { TRY: '₺', EUR: '€', USD: '$' }
export const CUR_ORDER = ['TRY', 'EUR', 'USD']

export function fmtRateNote(rates: FxRates): string | null {
  const parts: string[] = []
  if (rates.EUR_TRY > 0) parts.push(`1 EUR = ${rates.EUR_TRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`)
  if (rates.USD_TRY > 0) parts.push(`1 USD = ${rates.USD_TRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`)
  return parts.length > 0 ? parts.join(' • ') + ' (anlık kur)' : null
}
