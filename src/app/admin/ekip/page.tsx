'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { checkUserLimit } from '@/lib/planCheck'
import { logAction } from '@/lib/activityLog'
import { useIsMobile } from '@/lib/useIsMobile'

type DanisanStat = {
  danisan_id: string
  full_name: string
  musteri_sayisi: number
  tamamlanan: number
  toplam_ciro: number
}

export default function EkipPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [stats, setStats] = useState<DanisanStat[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'danisan' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    if (!companyId) return
    fetchData()
  }, [companyId])

  async function fetchData() {
    // 1. Şirketteki tüm kullanıcılar
    const { data: usersData } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('company_id', companyId)

    // 2. Şirketteki müşteriler + başvuruları
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, danisan_id, applications(id, status)')
      .eq('company_id', companyId)

    // 3. Şirketteki tüm ödemeler
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('application_id, total_amount, currency')
      .eq('company_id', companyId)

    // Başvuru → ödeme haritası
    const paymentByApp = new Map<string, { total_amount: number; currency: string }>()
    for (const pay of (paymentsData || [])) {
      if (!paymentByApp.has(pay.application_id)) {
        paymentByApp.set(pay.application_id, pay)
      }
    }

    // Her danışman için istatistik hesapla
    const statsMap = new Map<string, DanisanStat>()
    for (const u of (usersData || [])) {
      statsMap.set(u.id, {
        danisan_id: u.id,
        full_name: u.full_name || u.email || '—',
        musteri_sayisi: 0,
        tamamlanan: 0,
        toplam_ciro: 0,
      })
    }

    for (const client of (clientsData || [])) {
      const did = client.danisan_id
      if (!did || !statsMap.has(did)) continue

      const stat = statsMap.get(did)!
      stat.musteri_sayisi++

      const app = client.applications?.[0]
      if (app?.status === 'approved') stat.tamamlanan++

      if (app?.id) {
        const payment = paymentByApp.get(app.id)
        if (payment) stat.toplam_ciro += payment.total_amount || 0
      }
    }

    const statsArr = Array.from(statsMap.values())
      .sort((a, b) => b.toplam_ciro - a.toplam_ciro)

    setStats(statsArr)
    setUsers(usersData || [])
    setLoading(false)
  }

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
          }],
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: '#f0ede6' },
              ticks: { font: { size: 10 }, color: '#9aaabb', callback: (v: any) => v >= 1000 ? (v / 1000) + 'K₺' : v },
              border: { display: false },
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 12 }, color: '#0d1f35' },
              border: { display: false },
            },
          },
        },
      })
    }
    initChart()
    return () => { chartInstance.current?.destroy() }
  }, [loading, stats])

  async function danismanEkle() {
    if (!form.full_name || !form.email || !form.password || !companyId) return
    setSaving(true)
    setError('')

    const limitCheck = await checkUserLimit(companyId)
    if (!limitCheck.allowed) {
      setError(limitCheck.message || 'Kullanıcı limitine ulaşıldı.')
      setSaving(false)
      return
    }

    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, company_id: companyId }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    const actingUser = users.find(u => u.id === user?.id)
    logAction(companyId!, user?.id, actingUser?.full_name || 'Bilinmeyen', `Danışman eklendi`, 'user', null, form.full_name)

    setSaving(false)
    setShowModal(false)
    setForm({ full_name: '', email: '', password: '', role: 'danisan' })
    fetchData()
  }

  async function danismanSil(userId: string) {
    if (!confirm('Bu danışmanı silmek istediğinizden emin misiniz?')) return
    const deletedUser = users.find(u => u.id === userId)
    const res = await fetch('/api/create-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (data.error) { alert('Hata: ' + data.error); return }
    const { data: { user } } = await supabase.auth.getUser()
    const actingUser = users.find(u => u.id === user?.id)
    logAction(companyId!, user?.id, actingUser?.full_name || 'Bilinmeyen', `Danışman silindi`, 'user', null, deletedUser?.full_name)
    fetchData()
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const topDanisan = stats.length > 0 ? stats[0] : null
  const toplamCiro = stats.reduce((sum, s) => sum + s.toplam_ciro, 0)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Ekip Performansı</h2>
        <button onClick={() => setShowModal(true)} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: '500', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'opacity 0.2s' }}>
          + Danışman Ekle
        </button>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#e4eaf5' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Toplam Danışman</div>
            <div style={{ fontSize: '26px', fontWeight: '500', color: '#0d1f35' }}>{users.length}</div>
          </div>
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>En Yüksek Ciro</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0d1f35' }}>{topDanisan?.full_name || '—'}</div>
            <div style={{ fontSize: '12px', color: '#1a7a45', marginTop: '4px' }}>{(topDanisan?.toplam_ciro || 0).toLocaleString('tr-TR')}₺</div>
          </div>
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Toplam Ekip Cirosu</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a7a45' }}>{toplamCiro.toLocaleString('tr-TR')}₺</div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Danışman Listesi</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
              <thead>
                <tr>
                  {['Ad Soyad', 'Email', 'Rol', 'Müşteri', 'Tamamlanan', 'Ciro', ''].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid rgba(188,204,226,0.3)', background: '#e4eaf5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const s = stats.find(st => st.danisan_id === u.id)
                  return (
                    <tr key={u.id}>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{u.full_name}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{u.email}</td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <span style={{ background: u.role === 'admin' ? '#eef4fb' : '#faf8f3', color: u.role === 'admin' ? '#1a5fa5' : '#5a6a7a', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(188,204,226,0.45)' }}>
                          {u.role === 'admin' ? 'Admin' : 'Danışman'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{s?.musteri_sayisi ?? 0}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', color: '#1a7a45', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{s?.tamamlanan ?? 0}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{(s?.toplam_ciro ?? 0).toLocaleString('tr-TR')}₺</td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <button onClick={() => danismanSil(u.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer' }}>Sil</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {stats.length > 0 && (
          <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>Ciro Karşılaştırması</h3>
            <canvas ref={chartRef} height={120} />
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '400px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>Yeni Danışman Ekle</h3>
            {[
              { label: 'Ad Soyad', key: 'full_name', type: 'text', placeholder: 'Ahmet Yılmaz' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'ahmet@firma.com' },
              { label: 'Şifre', key: 'password', type: 'password', placeholder: 'En az 6 karakter' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Rol</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', background: '#e4eaf5', outline: 'none', fontFamily: 'inherit' }}>
                <option value="danisan">Danışman</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowModal(false); setError('') }} style={{ flex: 1, padding: '10px', background: '#e4eaf5', color: '#5a6a7a', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={danismanEkle} disabled={saving} style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Ekleniyor...' : 'Danışman Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
