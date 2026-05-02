'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'

export default function AdminPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const [stats, setStats] = useState({
    toplamMusteri: 0, tamamlanan: 0, bekleyen: 0,
    toplamOdeme: 0, tahsilEdilen: 0, tahsilEdilmemis: 0,
  })
  const [aylikCiro, setAylikCiro] = useState<number[]>([])
  const [ayLabels, setAyLabels] = useState<string[]>([])
  const [ulkeCiro, setUlkeCiro] = useState<{label: string, value: number}[]>([])
  const [tipData, setTipData] = useState<{label: string, value: number}[]>([])
  const [loading, setLoading] = useState(true)
  const ciroRef = useRef<HTMLCanvasElement>(null)
  const ulkeRef = useRef<HTMLCanvasElement>(null)
  const tipRef = useRef<HTMLCanvasElement>(null)
  const ciroChart = useRef<any>(null)
  const ulkeChart = useRef<any>(null)
  const tipChart = useRef<any>(null)

  const TR_AYLAR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']

  useEffect(() => {
    if (!companyId) return
    async function fetchData() {
      const { data: clients } = await supabase.from('clients').select('*').eq('company_id', companyId)
      const { data: applications } = await supabase.from('applications').select('*').eq('company_id', companyId)
      const { data: payments } = await supabase.from('payments').select('*, applications(country, visa_type, created_at)').eq('company_id', companyId)

      const toplamOdeme = payments?.reduce((sum, p) => sum + p.total_amount, 0) || 0
      const tahsilEdilen = payments?.reduce((sum, p) => sum + p.paid_amount, 0) || 0

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
        }).reduce((sum, p) => sum + p.paid_amount, 0) || 0
        ciroArr.push(ayOdeme)
      }
      setAyLabels(labels)
      setAylikCiro(ciroArr)

      const ulkeMap: Record<string, number> = {}
      payments?.forEach(p => {
        const ulke = p.applications?.country || 'Diğer'
        ulkeMap[ulke] = (ulkeMap[ulke] || 0) + p.paid_amount
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
  }, [companyId])

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
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f0ede6' }, ticks: { font: { size: 10 }, color: '#9aaabb', callback: (v: any) => v >= 1000 ? (v/1000)+'K₺' : v }, border: { display: false } }, x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9aaabb' }, border: { display: false } } } }
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

  const fmt = (n: number) => n.toLocaleString('tr-TR') + '₺'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: '0.875rem 1.5rem', flexShrink: 0 }}>
        <h2 style={{ fontSize: '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Genel Bakış</h2>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Toplam Ciro', value: fmt(stats.toplamOdeme), color: '#1a7a45', sub: stats.toplamMusteri + ' müşteri' },
            { label: 'Tahsil Edilmemiş', value: fmt(stats.tahsilEdilmemis), color: '#c0392b', sub: null },
            { label: 'Aktif Dosya', value: stats.toplamMusteri, color: '#0d1f35', sub: null },
            { label: 'Tamamlanan', value: stats.tamamlanan, color: '#1a5fa5', sub: null },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: s.color }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '4px' }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Aylık Ciro Trendi</h3>
            <canvas ref={ciroRef} height={160} />
          </div>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Hızlı Özet</h3>
            {[
              ['Toplam ciro', fmt(stats.toplamOdeme), '#0d1f35'],
              ['Tahsil edilen', fmt(stats.tahsilEdilen), '#1a7a45'],
              ['Tahsil edilmemiş', fmt(stats.tahsilEdilmemis), '#c0392b'],
              ['Toplam müşteri', stats.toplamMusteri.toString(), '#0d1f35'],
              ['Tamamlanan dosya', stats.tamamlanan.toString(), '#1a7a45'],
              ['Devam eden', stats.bekleyen.toString(), '#1a5fa5'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0ede6', fontSize: '13px' }}>
                <span style={{ color: '#5a6a7a' }}>{label}</span>
                <span style={{ fontWeight: '600', color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Ülke Bazlı Ciro</h3>
            <canvas ref={ulkeRef} height={180} />
          </div>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Vize Tipi Dağılımı</h3>
            <canvas ref={tipRef} height={180} />
          </div>
        </div>
      </div>
    </div>
  )
}