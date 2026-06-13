'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'
import { fetchFxRates, amountToTRY, fmtRateNote, CUR_SYM, CUR_ORDER, type FxRates } from '@/lib/fxRates'

type CurrencyBucket = { total: number; collected: number }

export default function AdminPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [stats, setStats] = useState({
    toplamMusteri: 0, tamamlanan: 0, bekleyen: 0,
    toplamOdeme: 0, tahsilEdilen: 0, tahsilEdilmemis: 0,
  })
  const [aylikCiro, setAylikCiro] = useState<number[]>([])
  const [ayLabels, setAyLabels] = useState<string[]>([])
  const [ulkeCiro, setUlkeCiro] = useState<{label: string, value: number}[]>([])
  const [tipData, setTipData] = useState<{label: string, value: number}[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [monthlyLimit, setMonthlyLimit] = useState(0)
  const [fxRates, setFxRates] = useState<FxRates | null>(null)
  const [currencyBreakdown, setCurrencyBreakdown] = useState<Record<string, CurrencyBucket>>({})

  const PLAN_MONTHLY_LIMITS: Record<string, number> = { basic: 30, pro: 100 }
  const ciroRef = useRef<HTMLCanvasElement>(null)
  const ulkeRef = useRef<HTMLCanvasElement>(null)
  const tipRef = useRef<HTMLCanvasElement>(null)
  const ciroChart = useRef<any>(null)
  const ulkeChart = useRef<any>(null)
  const tipChart = useRef<any>(null)

  const TR_AYLAR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) { setLoading(false); return }
    async function fetchData() {
      const [{ data: clients }, { data: applications }, { data: payments }, { data: company }, { data: count }, rates] = await Promise.all([
        supabase.from('clients').select('*').eq('company_id', companyId),
        supabase.from('applications').select('*').eq('company_id', companyId),
        supabase.from('payments').select('*, applications(country, visa_type, created_at)').eq('company_id', companyId),
        supabase.from('companies').select('plan').eq('id', companyId).single(),
        supabase.rpc('get_monthly_application_count', { p_company_id: companyId }),
        fetchFxRates(),
      ])
      setFxRates(rates)
      setMonthlyCount(count || 0)
      setMonthlyLimit(PLAN_MONTHLY_LIMITS[company?.plan] || 0)

      // Group by currency
      const breakdown: Record<string, CurrencyBucket> = {}
      payments?.forEach(p => {
        const cur = (p.currency as string | undefined) || 'TRY'
        if (!breakdown[cur]) breakdown[cur] = { total: 0, collected: 0 }
        breakdown[cur].total += p.total_amount
        breakdown[cur].collected += p.paid_amount
      })
      setCurrencyBreakdown(breakdown)

      const toplamOdeme = Object.entries(breakdown).reduce((s, [c, v]) => s + amountToTRY(v.total, c, rates), 0)
      const tahsilEdilen = Object.entries(breakdown).reduce((s, [c, v]) => s + amountToTRY(v.collected, c, rates), 0)

      setStats({
        toplamMusteri: clients?.length || 0,
        tamamlanan: applications?.filter(a => a.status === 'approved').length || 0,
        bekleyen: applications?.filter(a => a.status !== 'approved').length || 0,
        toplamOdeme, tahsilEdilen, tahsilEdilmemis: toplamOdeme - tahsilEdilen,
      })

      const now = new Date()
      const labels: string[] = []
      const ciroArr: number[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        labels.push(TR_AYLAR[d.getMonth()])
        const ayOdeme = payments?.filter(p => {
          const pd = new Date(p.created_at)
          return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth()
        }).reduce((sum, p) => {
          const cur = (p.currency as string | undefined) || 'TRY'
          return sum + amountToTRY(p.total_amount, cur, rates)
        }, 0) || 0
        ciroArr.push(ayOdeme)
      }
      setAyLabels(labels)
      setAylikCiro(ciroArr)

      const ulkeMap: Record<string, number> = {}
      payments?.forEach(p => {
        const ulke = p.applications?.country || 'Diğer'
        const cur = (p.currency as string | undefined) || 'TRY'
        ulkeMap[ulke] = (ulkeMap[ulke] || 0) + amountToTRY(p.total_amount, cur, rates)
      })
      setUlkeCiro(Object.entries(ulkeMap).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value))

      const tipMap: Record<string, number> = {}
      applications?.forEach(a => {
        const tip = a.visa_type || 'Diğer'
        tipMap[tip] = (tipMap[tip] || 0) + 1
      })
      setTipData(Object.entries(tipMap).map(([label, value]) => ({ label, value })))

      setLoading(false)
    }
    fetchData()
  }, [companyId, companyLoading])

  useEffect(() => {
    if (loading || !aylikCiro.length) return
    async function initCharts() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      const navy = '#0d1f35'
      const cols = ['#0d1f35','#1a3a5c','#378add','#5b9bd5','#89c0e8','#b5d4f4']

      if (ciroRef.current) {
        if (ciroChart.current) ciroChart.current.destroy()
        ciroChart.current = new Chart(ciroRef.current, {
          type: 'bar',
          data: { labels: ayLabels, datasets: [{ data: aylikCiro, backgroundColor: navy, borderRadius: 4, borderSkipped: false }] },
          options: { responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ' ' + Math.round(ctx.raw).toLocaleString('tr-TR') + '₺' } } }, scales: { y: { grid: { color: '#f0ede6' }, ticks: { font: { size: 10 }, color: '#9aaabb', callback: (v: any) => v >= 1000 ? (v/1000)+'K₺' : v+'₺' }, border: { display: false } }, x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9aaabb' }, border: { display: false } } } }
        })
      }
      if (ulkeRef.current && ulkeCiro.length) {
        if (ulkeChart.current) ulkeChart.current.destroy()
        ulkeChart.current = new Chart(ulkeRef.current, {
          type: 'bar',
          data: { labels: ulkeCiro.map(u => u.label), datasets: [{ data: ulkeCiro.map(u => u.value), backgroundColor: cols, borderRadius: 4, borderSkipped: false }] },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f0ede6' }, ticks: { font: { size: 10 }, color: '#9aaabb', callback: (v: any) => v >= 1000 ? (v/1000)+'K₺' : v }, border: { display: false } }, x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9aaabb' }, border: { display: false } } } }
        })
      }
      if (tipRef.current && tipData.length) {
        if (tipChart.current) tipChart.current.destroy()
        tipChart.current = new Chart(tipRef.current, {
          type: 'doughnut',
          data: { labels: tipData.map(t => t.label), datasets: [{ data: tipData.map(t => t.value), backgroundColor: ['#0d1f35','#1a3a5c','#378add','#89c0e8','#b5d4f4'], borderWidth: 0 }] },
          options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#9aaabb', padding: 12, boxWidth: 12 } } } }
        })
      }
    }
    initCharts()
    return () => {
      ciroChart.current?.destroy()
      ulkeChart.current?.destroy()
      tipChart.current?.destroy()
    }
  }, [loading, aylikCiro, ulkeCiro, tipData])

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const fmt = (n: number) => Math.round(n).toLocaleString('tr-TR') + '₺'
  const hasForeign = Object.keys(currencyBreakdown).some(c => c !== 'TRY')
  const hasEUR = (currencyBreakdown['EUR']?.total ?? 0) > 0
  const hasUSD = (currencyBreakdown['USD']?.total ?? 0) > 0
  const ratesOk = (!hasEUR || (fxRates?.EUR_TRY ?? 0) > 0) && (!hasUSD || (fxRates?.USD_TRY ?? 0) > 0)
  const rateNote = fxRates ? fmtRateNote(fxRates) : null

  function multiLine(key: 'total' | 'collected'): string {
    return CUR_ORDER
      .filter(c => (currencyBreakdown[c]?.[key] ?? 0) > 0)
      .map(c => `${CUR_SYM[c]} ${currencyBreakdown[c][key].toLocaleString('tr-TR')}`)
      .join('\n') || '₺ 0'
  }

  function multiLineRemaining(): string {
    return CUR_ORDER
      .filter(c => ((currencyBreakdown[c]?.total ?? 0) - (currencyBreakdown[c]?.collected ?? 0)) > 0)
      .map(c => {
        const rem = (currencyBreakdown[c]?.total ?? 0) - (currencyBreakdown[c]?.collected ?? 0)
        return `${CUR_SYM[c]} ${rem.toLocaleString('tr-TR')}`
      })
      .join('\n') || '₺ 0'
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid rgba(188,204,226,0.3)', padding: '0.875rem 1.5rem', flexShrink: 0 }}>
        <h2 style={{ fontSize: '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Genel Bakış</h2>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e4eaf5' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? '8px' : '12px', marginBottom: '0.75rem' }}>
          {[
            { label: 'Toplam Ciro',       value: hasForeign ? multiLine('total')       : fmt(stats.toplamOdeme),    icon: '💰', iconBg: '#f0fdf4', accent: '#22c55e', numColor: '#14532d', sub: hasForeign && ratesOk ? `~${fmt(stats.toplamOdeme)} TL` : null },
            { label: 'Tahsil Edilmemiş',  value: hasForeign ? multiLineRemaining()    : fmt(stats.tahsilEdilmemis), icon: '⏳', iconBg: '#fef2f2', accent: '#ef4444', numColor: '#991b1b', sub: hasForeign && ratesOk ? `~${fmt(stats.tahsilEdilmemis)} TL` : null },
            { label: 'Aktif Dosya',       value: stats.toplamMusteri,                  icon: '📂', iconBg: '#eff6ff', accent: '#3b82f6', numColor: '#1e3a8a', sub: null },
            { label: 'Tamamlanan',        value: stats.tamamlanan,                     icon: '✅', iconBg: '#f0fdf4', accent: '#22c55e', numColor: '#065f46', sub: null },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid rgba(188,204,226,0.4)', borderTop: `4px solid ${s.accent}`, borderRadius: isMobile ? '12px' : '14px', padding: isMobile ? '0.875rem' : '1.25rem', boxShadow: '0 4px 16px rgba(15,23,42,0.07)', transition: 'box-shadow 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{s.icon}</div>
              </div>
              <div style={{ fontSize: (hasForeign && i < 2) ? (isMobile ? '13px' : '15px') : (isMobile ? '22px' : '28px'), fontWeight: '700', color: s.numColor, wordBreak: 'break-word', whiteSpace: 'pre-line', lineHeight: '1.3' }}>{s.value}</div>
              {s.sub && (
                <>
                  <div style={{ borderTop: '1px solid rgba(188,204,226,0.3)', margin: '6px 0 4px' }} />
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.sub}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {rateNote && (
          <div style={{ fontSize: '11px', color: '#9aaabb', marginBottom: isMobile ? '0.75rem' : '1rem', paddingLeft: '2px' }}>
            {rateNote}
          </div>
        )}

        {monthlyLimit > 0 && (
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(15,23,42,0.06)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#5a6a7a' }}>Bu Ayki Dosya Kullanımı</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0d1f35' }}>{monthlyCount}/{monthlyLimit}</span>
            </div>
            <div style={{ height: '8px', background: '#f0ede6', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((monthlyCount / monthlyLimit) * 100, 100)}%`, background: '#378ADD', borderRadius: '99px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Aylık Ciro Trendi {hasForeign ? '(₺ karşılığı)' : ''}</h3>
            <canvas ref={ciroRef} height={160} />
          </div>
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Hızlı Özet</h3>
            {hasForeign ? (
              <>
                {[
                  ['Toplam ciro', multiLine('total'), '#0d1f35'],
                  ['Toplam ciro (₺)', fmt(stats.toplamOdeme), '#0d1f35'],
                  ['Tahsil edilen', multiLine('collected'), '#1a7a45'],
                  ['Tahsil edilen (₺)', fmt(stats.tahsilEdilen), '#1a7a45'],
                  ['Tahsil edilmemiş', multiLineRemaining(), '#c0392b'],
                  ['Tahsil edilmemiş (₺)', fmt(stats.tahsilEdilmemis), '#c0392b'],
                  ['Toplam müşteri', stats.toplamMusteri.toString(), '#0d1f35'],
                  ['Tamamlanan dosya', stats.tamamlanan.toString(), '#1a7a45'],
                  ['Devam eden', stats.bekleyen.toString(), '#1a5fa5'],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(188,204,226,0.3)', fontSize: '13px' }}>
                    <span style={{ color: '#5a6a7a' }}>{label}</span>
                    <span style={{ fontWeight: '600', color, whiteSpace: 'pre-line', textAlign: 'right', lineHeight: '1.5' }}>{value}</span>
                  </div>
                ))}
                {rateNote && <div style={{ fontSize: '10px', color: '#9aaabb', marginTop: '8px', lineHeight: '1.5' }}>{rateNote}</div>}
              </>
            ) : (
              <>
                {[
                  ['Toplam ciro', fmt(stats.toplamOdeme), '#0d1f35'],
                  ['Tahsil edilen', fmt(stats.tahsilEdilen), '#1a7a45'],
                  ['Tahsil edilmemiş', fmt(stats.tahsilEdilmemis), '#c0392b'],
                  ['Toplam müşteri', stats.toplamMusteri.toString(), '#0d1f35'],
                  ['Tamamlanan dosya', stats.tamamlanan.toString(), '#1a7a45'],
                  ['Devam eden', stats.bekleyen.toString(), '#1a5fa5'],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(188,204,226,0.3)', fontSize: '13px' }}>
                    <span style={{ color: '#5a6a7a' }}>{label}</span>
                    <span style={{ fontWeight: '600', color }}>{value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '8px' : '1.25rem' }}>
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Ülke Bazlı Ciro {hasForeign ? '(₺ karşılığı)' : ''}</h3>
            <canvas ref={ulkeRef} height={180} />
          </div>
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Vize Tipi Dağılımı</h3>
            <canvas ref={tipRef} height={180} />
          </div>
        </div>
      </div>
    </div>
  )
}
