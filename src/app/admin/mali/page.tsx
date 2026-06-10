'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'
import { fetchFxRates, amountToTRY, fmtRateNote, CUR_SYM, CUR_ORDER, type FxRates } from '@/lib/fxRates'

type CurrencyBucket = { total: number; collected: number }

export default function MaliPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fxRates, setFxRates] = useState<FxRates | null>(null)
  const [currencyBreakdown, setCurrencyBreakdown] = useState<Record<string, CurrencyBucket>>({})

  useEffect(() => {
    if (!companyId) return
    async function fetchData() {
      const [{ data }, rates] = await Promise.all([
        supabase
          .from('payments')
          .select('*, applications(country, visa_type, company_id, client_id, clients(full_name, users(full_name)))')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
        fetchFxRates(),
      ])
      setFxRates(rates)

      const clientMap = new Map<string, any>()
      const breakdown: Record<string, CurrencyBucket> = {}

      for (const p of (data || [])) {
        const clientId = p.applications?.client_id as string | undefined
        const key = clientId ?? `no_client_${p.id}`
        if (!clientMap.has(key)) clientMap.set(key, p)

        const cur = (p.currency as string | undefined) || 'TRY'
        if (!breakdown[cur]) breakdown[cur] = { total: 0, collected: 0 }
        breakdown[cur].total += p.total_amount
        breakdown[cur].collected += p.paid_amount
      }

      setCurrencyBreakdown(breakdown)
      setPayments(Array.from(clientMap.values()))
      setLoading(false)
    }
    fetchData()
  }, [companyId])

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const hasForeign = Object.keys(currencyBreakdown).some(c => c !== 'TRY')
  const rates = fxRates || { EUR_TRY: 0, USD_TRY: 0 }

  // Yalnızca kur verisi mevcut olan para birimlerini TL'ye çevir
  const hasEUR = (currencyBreakdown['EUR']?.total ?? 0) > 0
  const hasUSD = (currencyBreakdown['USD']?.total ?? 0) > 0
  const ratesOk = (!hasEUR || rates.EUR_TRY > 0) && (!hasUSD || rates.USD_TRY > 0)

  const toplamCiroTRY      = ratesOk ? Object.entries(currencyBreakdown).reduce((sum, [cur, b]) => sum + amountToTRY(b.total,     cur, rates), 0) : null
  const tahsilEdilenTRY    = ratesOk ? Object.entries(currencyBreakdown).reduce((sum, [cur, b]) => sum + amountToTRY(b.collected, cur, rates), 0) : null
  const tahsilEdilmemisTRY = (toplamCiroTRY != null && tahsilEdilenTRY != null) ? toplamCiroTRY - tahsilEdilenTRY : null

  const multiLineRemaining = () => {
    if (!hasForeign) return `${(tahsilEdilmemisTRY ?? 0).toLocaleString('tr-TR')} ₺`
    return CUR_ORDER
      .filter(c => ((currencyBreakdown[c]?.total ?? 0) - (currencyBreakdown[c]?.collected ?? 0)) > 0)
      .map(c => {
        const rem = (currencyBreakdown[c]?.total ?? 0) - (currencyBreakdown[c]?.collected ?? 0)
        return `${CUR_SYM[c]} ${rem.toLocaleString('tr-TR')}`
      })
      .join('\n') || `${(tahsilEdilmemisTRY ?? 0).toLocaleString('tr-TR')} ₺`
  }

  const bekleyenler = payments.filter(p => p.total_amount - p.paid_amount > 0)
  const fmtTRY = (n: number) => `~${n.toLocaleString('tr-TR')} ₺`
  const rateNote = fmtRateNote(rates)

  // TL karşılığı yalnızca kur verisi geçerliyse göster
  const tryValOf = (n: number | null) => (n != null ? fmtTRY(n) : null)

  const multiLine = (key: 'total' | 'collected') => {
    if (!hasForeign) {
      const b = currencyBreakdown['TRY'] || { total: 0, collected: 0 }
      return `${b[key].toLocaleString('tr-TR')} ₺`
    }
    return CUR_ORDER
      .filter(c => (currencyBreakdown[c]?.[key] ?? 0) > 0)
      .map(c => `${CUR_SYM[c]} ${currencyBreakdown[c][key].toLocaleString('tr-TR')}`)
      .join('\n')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Mali Durum</h2>
      </div>

      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: isMobile ? '8px' : '12px', marginBottom: hasForeign ? '0.5rem' : isMobile ? '0.75rem' : '1.5rem' }}>
          {[
            { label: 'Toplam Ciro',       value: multiLine('total'),      tryVal: hasForeign ? tryValOf(toplamCiroTRY)      : null, color: '#0d1f35' },
            { label: 'Tahsil Edilen',     value: multiLine('collected'),  tryVal: hasForeign ? tryValOf(tahsilEdilenTRY)    : null, color: '#1a7a45' },
            { label: 'Tahsil Edilmemiş',  value: multiLineRemaining(),    tryVal: hasForeign ? tryValOf(tahsilEdilmemisTRY) : null, color: '#c0392b' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: isMobile ? '10px' : '12px', padding: isMobile ? '0.75rem' : '1.25rem' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#9aaabb', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</div>
              <div style={{ fontSize: hasForeign ? (isMobile ? '12px' : '14px') : (isMobile ? '14px' : '22px'), fontWeight: '600', color: s.color, lineHeight: '1.6', whiteSpace: 'pre-line' }}>{s.value}</div>
              {s.tryVal && (
                <>
                  <div style={{ borderTop: '1px solid #f0ede6', margin: '6px 0 4px' }} />
                  <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#9aaabb' }}>Toplam (TL karşılığı): {s.tryVal}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {hasForeign && !ratesOk && (
          <div style={{ marginBottom: isMobile ? '0.75rem' : '1.5rem', background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#92600a' }}>
            ⚠️ Döviz kuru alınamadı — TL karşılıkları hesaplanamıyor. Sayfayı yenilemeyi deneyin.
          </div>
        )}

        {rateNote && (
          <div style={{ marginBottom: isMobile ? '0.75rem' : '1.5rem', fontSize: '11px', color: '#9aaabb', textAlign: 'right' }}>
            {rateNote}
          </div>
        )}

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden', marginBottom: isMobile ? '0.75rem' : '1.25rem' }}>
          <div style={{ padding: isMobile ? '0.625rem 0.875rem' : '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: isMobile ? '13px' : '14px', fontWeight: '500' }}>Ödeme Bekleyen Müşteriler</h3>
            <span style={{ background: '#fef0ee', color: '#c0392b', fontSize: '11px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', border: '1px solid #f5b8b0' }}>{bekleyenler.length} kişi</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
              <thead>
                <tr>
                  {['Müşteri', 'Danışman', 'Vize', 'Toplam', 'Ödenen', 'Kalan', 'Durum'].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bekleyenler.map(p => {
                  const kalan = p.total_amount - p.paid_amount
                  const musteri = p.applications?.clients
                  const cur = (p.currency as string | undefined) || 'TRY'
                  const sym = CUR_SYM[cur] || '₺'
                  return (
                    <tr key={p.id}>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{musteri?.full_name || '-'}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0ede6' }}>{musteri?.users?.full_name || '-'}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', borderBottom: '1px solid #f0ede6' }}>{p.applications?.country} {p.applications?.visa_type}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>{p.total_amount.toLocaleString('tr-TR')}{sym}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', color: '#1a7a45', borderBottom: '1px solid #f0ede6' }}>{p.paid_amount.toLocaleString('tr-TR')}{sym}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', color: '#c0392b', fontWeight: '600', borderBottom: '1px solid #f0ede6' }}>{kalan.toLocaleString('tr-TR')}{sym}</td>
                      <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                        <span style={{ background: p.paid_amount > 0 ? '#fff8ec' : '#fef0ee', color: p.paid_amount > 0 ? '#92600a' : '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>
                          {p.paid_amount > 0 ? 'Kısmi Ödeme' : 'Ödeme Bekleniyor'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {bekleyenler.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9aaabb', fontSize: '13px' }}>Tüm ödemeler tahsil edildi! 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: isMobile ? '0.625rem 0.875rem' : '1rem 1.25rem', borderBottom: '1px solid #f0ede6' }}>
            <h3 style={{ margin: 0, fontSize: isMobile ? '13px' : '14px', fontWeight: '500' }}>Tüm Ödemeler</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '460px' }}>
              <thead>
                <tr>
                  {['Müşteri', 'Vize', 'Toplam', 'Ödenen', 'Durum'].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const kalan = p.total_amount - p.paid_amount
                  const musteri = p.applications?.clients
                  const cur = (p.currency as string | undefined) || 'TRY'
                  const sym = CUR_SYM[cur] || '₺'
                  return (
                    <tr key={p.id}>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{musteri?.full_name || '-'}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', borderBottom: '1px solid #f0ede6' }}>{p.applications?.country} {p.applications?.visa_type}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>{p.total_amount.toLocaleString('tr-TR')}{sym}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', color: '#1a7a45', borderBottom: '1px solid #f0ede6' }}>{p.paid_amount.toLocaleString('tr-TR')}{sym}</td>
                      <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                        <span style={{ background: kalan <= 0 ? '#edfaf3' : p.paid_amount > 0 ? '#fff8ec' : '#fef0ee', color: kalan <= 0 ? '#1a7a45' : p.paid_amount > 0 ? '#92600a' : '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>
                          {kalan <= 0 ? 'Tahsil Edildi' : p.paid_amount > 0 ? 'Kısmi Ödeme' : 'Ödeme Bekleniyor'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
