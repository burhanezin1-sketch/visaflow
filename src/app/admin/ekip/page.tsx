'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function EkipPage() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.rpc('get_danisan_stats', {
        p_company_id: 'aaaaaaaa-0000-0000-0000-000000000001'
      })
      setStats(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (loading || !stats.length || !chartRef.current) return

    async function initChart() {
      const { Chart, registerables } = await import('chart.js')
      Chart.register(...registerables)
      if (chartInstance.current) chartInstance.current.destroy()
      chartInstance.current = new Chart(chartRef.current!, {
        type: 'bar',
        data: {
          labels: stats.map(s => s.full_name),
          datasets: [{
            data: stats.map(s => s.toplam_ciro),
            backgroundColor: '#0d1f35',
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: '#f0ede6' }, ticks: { font: { size: 10 }, color: '#9aaabb', callback: (v: any) => v >= 1000 ? (v/1000)+'K₺' : v }, border: { display: false } },
            y: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#0d1f35' }, border: { display: false } }
          }
        }
      })
    }
    initChart()
    return () => { chartInstance.current?.destroy() }
  }, [loading, stats])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const topDanisan = stats.length > 0 ? stats.reduce((a, b) => a.toplam_ciro > b.toplam_ciro ? a : b) : null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Ekip Performansı</h2>
        <div style={{ fontSize: '12px', color: '#9aaabb' }}>Admin · Serdar Çevik</div>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Toplam Danışman</div>
            <div style={{ fontSize: '26px', fontWeight: '500', color: '#0d1f35' }}>{stats.length}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>En Yüksek Ciro</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0d1f35' }}>{topDanisan?.full_name || '-'}</div>
            <div style={{ fontSize: '12px', color: '#1a7a45', marginTop: '4px' }}>{(topDanisan?.toplam_ciro || 0).toLocaleString('tr-TR')}₺</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Toplam Ekip Cirosu</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a7a45' }}>
              {stats.reduce((sum, s) => sum + (s.toplam_ciro || 0), 0).toLocaleString('tr-TR')}₺
            </div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Danışman Performans Tablosu</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Danışman', 'Aktif Müşteri', 'Tamamlanan', 'Toplam Ciro', 'Tahsil Edilen', 'Kalan'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => {
                const kalan = (s.toplam_ciro || 0) - (s.tahsil_edilen || 0)
                return (
                  <tr key={i}>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #f0ede6' }}>{s.full_name}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>{s.musteri_sayisi || 0}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', color: '#1a7a45', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{s.tamamlanan || 0}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #f0ede6' }}>{(s.toplam_ciro || 0).toLocaleString('tr-TR')}₺</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', color: '#1a7a45', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{(s.tahsil_edilen || 0).toLocaleString('tr-TR')}₺</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', color: kalan > 0 ? '#c0392b' : '#1a7a45', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{kalan.toLocaleString('tr-TR')}₺</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Ciro Karşılaştırması</h3>
          <canvas ref={chartRef} height={120} />
        </div>
      </div>
    </div>
  )
}