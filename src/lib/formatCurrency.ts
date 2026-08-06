const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', TRY: '₺', TL: '₺' }

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₺'
  return `${symbol}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
}
