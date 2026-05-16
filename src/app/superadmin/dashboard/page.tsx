'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const PLAN_PRICES: Record<string, number> = { basic: 2999, pro: 5499 }
const PLAN_LIMITS: Record<string, number> = { basic: 30, pro: 100 }

const statusLabels: Record<string, string> = {
  missing: 'Evrak Eksik',
  appointment_waiting: 'Randevu Bekleniyor',
  appointment: 'Randevu Alındı',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
}

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({})
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'genel' | 'gelir' | 'saglik' | 'destek' | 'firmalar' | 'evraklar'>('genel')

  // Saglik state
  const [saglik, setSaglik] = useState<{ leads: number; monthlyApps: number; activeUsers7d: number; logs: any[] }>({ leads: 0, monthlyApps: 0, activeUsers7d: 0, logs: [] })

  // Destek state
  const [destekFirmaId, setDestekFirmaId] = useState('')
  const [destekLogs, setDestekLogs] = useState<any[]>([])
  const [destekMsg, setDestekMsg] = useState('')
  const [destekSent, setDestekSent] = useState(false)
  const [sendingDestek, setSendingDestek] = useState(false)

  // Evrak state
  const [visaDocs, setVisaDocs] = useState<any[]>([])
  const [visaOptions, setVisaOptions] = useState<{ country: string; visa_type: string }[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedVisa, setSelectedVisa] = useState('')
  const [showEvrakModal, setShowEvrakModal] = useState(false)
  const [editEvrak, setEditEvrak] = useState<any>(null)
  const [evrakForm, setEvrakForm] = useState({ country: '', visa_type: '', doc_name: '', delivery_type: 'digital', order_num: 1 })
  const [savingEvrak, setSavingEvrak] = useState(false)
  const [newCountry, setNewCountry] = useState('')
  const [newVisa, setNewVisa] = useState('')
  const [showNewCombo, setShowNewCombo] = useState(false)

  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/superadmin/login'); return }
    const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
    if (!sa) { router.push('/superadmin/login'); return }
    await Promise.all([fetchCompanies(), fetchVisaDocs(), fetchVisaOptions(), fetchActivities(), fetchSaglik()])
    setLoading(false)
  }

  async function fetchCompanies() {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    const list = data || []
    setCompanies(list)
    const counts: Record<string, number> = {}
    await Promise.all(list.map(async (c: any) => {
      const { data: cnt } = await supabase.rpc('get_monthly_application_count', { p_company_id: c.id })
      counts[c.id] = cnt || 0
    }))
    setMonthlyCounts(counts)
  }

  async function fetchActivities() {
    const { data } = await supabase
      .from('applications')
      .select('id, status, country, visa_type, created_at, clients(full_name, companies(name))')
      .order('created_at', { ascending: false })
      .limit(10)
    setActivities(data || [])
  }

  async function fetchSaglik() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const [
      { count: leads },
      { count: monthlyApps },
      { data: recentActivity },
      { data: logs },
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
      supabase.from('activity_logs').select('user_id').gte('created_at', sevenDaysAgo.toISOString()),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20),
    ])
    const activeUsers = new Set(recentActivity?.map((r: any) => r.user_id).filter(Boolean)).size
    setSaglik({ leads: leads || 0, monthlyApps: monthlyApps || 0, activeUsers7d: activeUsers, logs: logs || [] })
  }

  async function fetchDestekLogs(firmaId: string) {
    if (!firmaId) return
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('company_id', firmaId)
      .order('created_at', { ascending: false })
      .limit(50)
    setDestekLogs(data || [])
  }

  async function fetchVisaDocs() {
    const { data } = await supabase.from('visa_documents').select('*').order('country').order('visa_type').order('order_num')
    setVisaDocs(data || [])
  }

  async function fetchVisaOptions() {
    const { data } = await supabase.from('visa_documents').select('country, visa_type').order('country')
    const unique = Array.from(new Map(data?.map((d: any) => [`${d.country}__${d.visa_type}`, d])).values()) as { country: string; visa_type: string }[]
    setVisaOptions(unique)
    if (unique.length > 0) {
      setSelectedCountry(unique[0].country)
      setSelectedVisa(unique[0].visa_type)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/superadmin/login')
  }

  async function saveEvrak() {
    if (!evrakForm.country || !evrakForm.visa_type || !evrakForm.doc_name) return
    setSavingEvrak(true)
    if (editEvrak) {
      await supabase.from('visa_documents').update({
        country: evrakForm.country, visa_type: evrakForm.visa_type,
        doc_name: evrakForm.doc_name, delivery_type: evrakForm.delivery_type, order_num: evrakForm.order_num,
      }).eq('id', editEvrak.id)
    } else {
      await supabase.from('visa_documents').insert({
        country: evrakForm.country, visa_type: evrakForm.visa_type,
        doc_name: evrakForm.doc_name, delivery_type: evrakForm.delivery_type, order_num: evrakForm.order_num,
      })
    }
    setSavingEvrak(false)
    setShowEvrakModal(false)
    setEditEvrak(null)
    setEvrakForm({ country: '', visa_type: '', doc_name: '', delivery_type: 'digital', order_num: 1 })
    await fetchVisaDocs()
    await fetchVisaOptions()
  }

  async function deleteEvrak(id: string) {
    if (!confirm('Bu evrakı silmek istediğinizden emin misiniz?')) return
    await supabase.from('visa_documents').delete().eq('id', id)
    fetchVisaDocs()
  }

  async function addNewCombo() {
    if (!newCountry || !newVisa) return
    setSelectedCountry(newCountry)
    setSelectedVisa(newVisa)
    setEvrakForm({ country: newCountry, visa_type: newVisa, doc_name: '', delivery_type: 'digital', order_num: 1 })
    setShowNewCombo(false)
    setNewCountry('')
    setNewVisa('')
    setShowEvrakModal(true)
  }

  async function handleDestekSend() {
    if (!destekMsg.trim() || !destekFirmaId) return
    setSendingDestek(true)
    await new Promise(r => setTimeout(r, 800))
    setSendingDestek(false)
    setDestekSent(true)
    setDestekMsg('')
    setTimeout(() => setDestekSent(false), 3000)
  }

  const countries = [...new Set(visaOptions.map(v => v.country))].sort()
  const visaTypesForCountry = [...new Set(visaOptions.filter(v => v.country === selectedCountry).map(v => v.visa_type))].sort()
  const filteredDocs = visaDocs.filter(d => d.country === selectedCountry && d.visa_type === selectedVisa)

  const basicFirms = companies.filter(c => c.plan === 'basic')
  const proFirms = companies.filter(c => c.plan === 'pro')
  const monthlyRevenue = basicFirms.length * PLAN_PRICES.basic + proFirms.length * PLAN_PRICES.pro

  // Gelir tab computed values
  const now = new Date()
  const last12Months = Array.from({ length: 12 }, (_, i) =>
    new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
  )
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthFirms = companies.filter(c => new Date(c.created_at) >= thisMonthStart)
  const activeFirms = companies.filter(c => !c.trial_ends_at || new Date(c.trial_ends_at) > now)
  const avgRevenue = companies.length > 0 ? Math.round(monthlyRevenue / companies.length) : 0

  const mrrChartData = {
    labels: last12Months.map(m => m.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })),
    datasets: [
      {
        label: 'Basic (₺)',
        data: last12Months.map(m => {
          const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
          return companies.filter(c => c.plan === 'basic' && new Date(c.created_at) <= end).length * PLAN_PRICES.basic
        }),
        backgroundColor: 'rgba(90,106,122,0.7)',
        borderRadius: 4,
      },
      {
        label: 'Pro (₺)',
        data: last12Months.map(m => {
          const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
          return companies.filter(c => c.plan === 'pro' && new Date(c.created_at) <= end).length * PLAN_PRICES.pro
        }),
        backgroundColor: 'rgba(55,138,221,0.85)',
        borderRadius: 4,
      },
    ],
  }

  const mrrChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ₺${Number(ctx.raw).toLocaleString('tr-TR')}`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        ticks: { callback: (v: any) => v === 0 ? '₺0' : `₺${(v / 1000).toFixed(0)}K` },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ background: '#1c1c24', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="37" stroke="white" strokeWidth="2.5"/>
            <circle cx="40" cy="40" r="27" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
            <polygon points="40,4 45.5,37 40,31 34.5,37" fill="white"/>
            <polygon points="40,76 45.5,43 40,49 34.5,43" fill="rgba(255,255,255,0.3)"/>
            <line x1="3" y1="40" x2="13" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="67" y1="40" x2="77" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="40" cy="40" r="3.5" fill="white"/>
            <circle cx="40" cy="40" r="1.5" fill="#1c1c24"/>
          </svg>
          <span style={{ color: 'white', fontWeight: '500', fontSize: '14px', letterSpacing: '1px', fontFamily: "'Playfair Display', serif" }}>VECTROPUS</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: '4px' }}>/ Süper Admin</span>
        </div>
        <button onClick={logout} style={{ padding: '6px 14px', fontSize: '12px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer' }}>Çıkış</button>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e2e8', padding: '0 2rem', display: 'flex', gap: '0', overflowX: 'auto' }}>
        {([
          ['genel', '📊 Genel'],
          ['gelir', '💰 Gelir'],
          ['saglik', '🔍 Sistem'],
          ['destek', '💬 Destek'],
          ['firmalar', '🏢 Firmalar'],
          ['evraklar', '📋 Evraklar'],
        ] as [string, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key as any)} style={{
            padding: '14px 18px', fontSize: '13px', fontWeight: '500',
            border: 'none', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap',
            color: activeTab === key ? '#1c1c24' : '#9aaabb',
            borderBottom: activeTab === key ? '2px solid #378ADD' : '2px solid transparent',
            fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '2rem' }}>

        {/* GENEL BAKIŞ */}
        {activeTab === 'genel' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '2rem' }}>
              {[
                { label: 'Toplam Firma', value: companies.length, color: '#1c1c24', sub: 'Aktif müşteri' },
                { label: 'Basic Plan', value: basicFirms.length, color: '#5a6a7a', sub: '₺2.999/ay' },
                { label: 'Pro Plan', value: proFirms.length, color: '#1a5fa5', sub: '₺5.499/ay' },
                { label: 'Aylık Gelir', value: `₺${monthlyRevenue.toLocaleString('tr-TR')}`, color: '#1a7a45', sub: 'Toplam MRR' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                  <div style={{ fontSize: '26px', fontWeight: '600', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '6px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e2e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#1c1c24' }}>Son Aktiviteler</h3>
                <span style={{ fontSize: '12px', color: '#9aaabb' }}>Son 10 işlem</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Müşteri', 'Firma', 'Vize', 'Durum', 'Tarih'].map(h => (
                      <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4', background: '#f5f5f7' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>Henüz aktivite yok.</td></tr>
                  )}
                  {activities.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{a.clients?.full_name || '—'}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0f0f4' }}>{(a.clients as any)?.companies?.name || '—'}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0f0f4' }}>{a.country} {a.visa_type}</td>
                      <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: '#f0f0f4', color: '#5a6a7a' }}>
                          {statusLabels[a.status] || a.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', color: '#9aaabb', borderBottom: '1px solid #f0f0f4' }}>
                        {new Date(a.created_at).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* GELİR TAKİBİ */}
        {activeTab === 'gelir' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '2rem' }}>
              {[
                { label: 'Toplam Firma', value: companies.length, color: '#1c1c24', sub: 'Kayıtlı' },
                { label: 'Aktif Firma', value: activeFirms.length, color: '#1a7a45', sub: 'Deneme dışı' },
                { label: 'Bu Ay Kazanılan', value: thisMonthFirms.length, color: '#1a5fa5', sub: 'Yeni kayıt' },
                { label: 'Ort. Gelir/Firma', value: `₺${avgRevenue.toLocaleString('tr-TR')}`, color: '#92600a', sub: 'Aylık ortalama' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                  <div style={{ fontSize: '26px', fontWeight: '600', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '6px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1c1c24' }}>Aylık MRR Tahmini (Son 12 Ay)</h3>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a7a45' }}>₺{monthlyRevenue.toLocaleString('tr-TR')}</div>
              </div>
              <div style={{ height: '280px' }}>
                <Bar data={mrrChartData} options={mrrChartOptions} />
              </div>
              <div style={{ marginTop: '1rem', fontSize: '11px', color: '#9aaabb', textAlign: 'center' }}>
                * Firmalar mevcut planlarına göre hesaplanmıştır. Plan değişiklikleri tarihlenmez.
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden', marginTop: '1.5rem' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e2e8', background: '#f5f5f7' }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1c1c24' }}>Plan Dağılımı</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Plan', 'Firma Sayısı', 'Aylık Ücret', 'Toplam Gelir'].map(h => (
                      <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: 'Basic', count: basicFirms.length, price: PLAN_PRICES.basic, color: '#5a6a7a', bg: '#f0f0f4' },
                    { plan: 'Pro', count: proFirms.length, price: PLAN_PRICES.pro, color: '#1a5fa5', bg: '#eef4fb' },
                  ].map(row => (
                    <tr key={row.plan}>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: row.bg, color: row.color, textTransform: 'uppercase' }}>{row.plan}</span>
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '14px', fontWeight: '600', color: '#1c1c24', borderBottom: '1px solid #f0f0f4' }}>{row.count}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', color: '#5a6a7a', borderBottom: '1px solid #f0f0f4' }}>₺{row.price.toLocaleString('tr-TR')}/ay</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '14px', fontWeight: '700', color: '#1a7a45', borderBottom: '1px solid #f0f0f4' }}>₺{(row.count * row.price).toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f5f5f7' }}>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', color: '#1c1c24' }}>Toplam</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '14px', fontWeight: '700', color: '#1c1c24' }}>{companies.length}</td>
                    <td style={{ padding: '12px 1.25rem' }}></td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '16px', fontWeight: '700', color: '#1a7a45' }}>₺{monthlyRevenue.toLocaleString('tr-TR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SİSTEM SAĞLIĞI */}
        {activeTab === 'saglik' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '2rem' }}>
              {[
                { label: 'Son 7 Gün Aktif Kullanıcı', value: saglik.activeUsers7d, color: '#1a5fa5', sub: 'Activity log\'a göre' },
                { label: 'Toplam Lead', value: saglik.leads, color: '#92600a', sub: 'Tüm firmalar' },
                { label: 'Bu Ay Başvuru', value: saglik.monthlyApps, color: '#1a7a45', sub: 'Tüm firmalar' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                  <div style={{ fontSize: '30px', fontWeight: '600', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '6px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e2e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f7' }}>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1c1c24' }}>Son 20 Sistem Aktivitesi</h3>
                <button onClick={fetchSaglik} style={{ padding: '5px 12px', fontSize: '11px', background: 'white', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '6px', cursor: 'pointer' }}>Yenile</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Kullanıcı', 'İşlem', 'Tür', 'Tarih & Saat'].map(h => (
                      <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {saglik.logs.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>Kayıt yok.</td></tr>
                  )}
                  {saglik.logs.map((log: any) => (
                    <tr key={log.id}>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{log.user_name || '—'}</td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0f0f4' }}>{log.action}</td>
                      <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        {log.entity_type && (
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', background: '#f0f0f4', color: '#5a6a7a' }}>
                            {log.entity_type}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '11px', color: '#9aaabb', borderBottom: '1px solid #f0f0f4' }}>
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* DESTEK */}
        {activeTab === 'destek' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
            {/* Sol: Firma Activity Log */}
            <div>
              <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Firma Seç</label>
                <select
                  value={destekFirmaId}
                  onChange={e => { setDestekFirmaId(e.target.value); fetchDestekLogs(e.target.value) }}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">— Firma seçin —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e2e8', background: '#f5f5f7', display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1c1c24' }}>
                    {destekFirmaId ? `${companies.find(c => c.id === destekFirmaId)?.name} — Activity Log` : 'Activity Log'}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#9aaabb' }}>Son 50 kayıt</span>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {!destekFirmaId && (
                    <div style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>Yukarıdan bir firma seçin.</div>
                  )}
                  {destekFirmaId && destekLogs.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>Bu firmaya ait kayıt yok.</div>
                  )}
                  {destekLogs.map((log: any) => (
                    <div key={log.id} style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0f0f4', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#378ADD', marginTop: '6px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: '#1c1c24' }}>{log.action}</div>
                        {log.entity_name && <div style={{ fontSize: '11px', color: '#5a6a7a', marginTop: '1px' }}>{log.entity_name}</div>}
                        <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>
                          {log.user_name} · {new Date(log.created_at).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sağ: Bildirim Gönder */}
            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '600', color: '#1c1c24' }}>📢 Bildirim Gönder</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Alıcı Firma</label>
                <select
                  value={destekFirmaId}
                  onChange={e => { setDestekFirmaId(e.target.value); fetchDestekLogs(e.target.value) }}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}
                >
                  <option value="">— Firma seçin —</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mesaj</label>
                <textarea
                  value={destekMsg}
                  onChange={e => setDestekMsg(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  rows={5}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              {destekSent && (
                <div style={{ background: '#edfaf3', border: '1px solid #a3e4bf', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#1a7a45' }}>
                  ✓ Bildirim gönderildi.
                </div>
              )}
              <button
                onClick={handleDestekSend}
                disabled={sendingDestek || !destekFirmaId || !destekMsg.trim()}
                style={{ width: '100%', padding: '11px', background: !destekFirmaId || !destekMsg.trim() ? '#e2e2e8' : '#1c1c24', color: !destekFirmaId || !destekMsg.trim() ? '#9aaabb' : 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: !destekFirmaId || !destekMsg.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: sendingDestek ? 0.7 : 1 }}
              >
                {sendingDestek ? 'Gönderiliyor...' : 'Gönder'}
              </button>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#9aaabb', textAlign: 'center' }}>
                WhatsApp / sistem bildirimi entegrasyonu için API bağlantısı gereklidir.
              </div>
            </div>
          </div>
        )}

        {/* FİRMALAR */}
        {activeTab === 'firmalar' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1c1c24' }}>Firmalar</h2>
                <p style={{ fontSize: '13px', color: '#5a6a7a', marginTop: '4px' }}>{companies.length} firma kayıtlı</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => router.push('/superadmin/firma')} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '500', background: 'white', color: '#1c1c24', border: '1px solid #e2e2e8', borderRadius: '10px', cursor: 'pointer' }}>
                  Firma Yönetimi →
                </button>
                <button onClick={() => router.push('/superadmin/firma/yeni')} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '500', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                  + Yeni Firma Ekle
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {companies.map(c => {
                const limit = PLAN_LIMITS[c.plan] || 0
                const used = monthlyCounts[c.id] || 0
                const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                return (
                  <div key={c.id} style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#eef4fb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏢</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c24' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: '#9aaabb', marginTop: '2px' }}>{c.city || c.email}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', background: c.plan === 'pro' ? '#eef4fb' : '#f0f0f4', color: c.plan === 'pro' ? '#1a5fa5' : '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {c.plan || 'basic'}
                      </span>
                    </div>
                    {limit > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a6a7a', marginBottom: '5px' }}>
                          <span>Bu Ayki Dosya</span>
                          <span style={{ fontWeight: '600', color: pct >= 90 ? '#c0392b' : '#1c1c24' }}>{used}/{limit}</span>
                        </div>
                        <div style={{ height: '6px', background: '#f0f0f4', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#c0392b' : '#378ADD', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    )}
                    {[
                      ['Kayıt', new Date(c.created_at).toLocaleDateString('tr-TR')],
                      ['Aylık Ücret', `₺${(PLAN_PRICES[c.plan] || 0).toLocaleString('tr-TR')}`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f4', fontSize: '12px' }}>
                        <span style={{ color: '#9aaabb' }}>{label}</span>
                        <span style={{ color: '#1c1c24', fontWeight: '500' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* EVRAK ŞABLONLARI */}
        {activeTab === 'evraklar' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1c1c24' }}>Evrak Şablonları</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowNewCombo(true)} style={{ padding: '8px 14px', fontSize: '12px', background: '#f5f5f7', color: '#1c1c24', border: '1px solid #e2e2e8', borderRadius: '8px', cursor: 'pointer' }}>
                  + Yeni Ülke/Vize Tipi
                </button>
                <button onClick={() => {
                  setEditEvrak(null)
                  setEvrakForm({ country: selectedCountry, visa_type: selectedVisa, doc_name: '', delivery_type: 'digital', order_num: filteredDocs.length + 1 })
                  setShowEvrakModal(true)
                }} style={{ padding: '8px 14px', fontSize: '12px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  + Evrak Ekle
                </button>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: '#9aaabb', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Ülke</label>
                <select value={selectedCountry} onChange={e => {
                  const c = e.target.value
                  const firstVisa = visaOptions.find(v => v.country === c)?.visa_type || ''
                  setSelectedCountry(c)
                  setSelectedVisa(firstVisa)
                }} style={{ padding: '7px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none' }}>
                  {countries.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: '#9aaabb', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Vize Tipi</label>
                <select value={selectedVisa} onChange={e => setSelectedVisa(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none' }}>
                  {visaTypesForCountry.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <span style={{ fontSize: '12px', color: '#9aaabb' }}>{filteredDocs.length} evrak</span>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Evrak Adı', 'Teslimat Tipi', ''].map(h => (
                      <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4', background: '#f5f5f7' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>Bu kombinasyon için evrak tanımlanmamış.</td></tr>
                  )}
                  {filteredDocs.map((d, idx) => (
                    <tr key={d.id}>
                      <td style={{ padding: '11px 1.25rem', fontSize: '12px', color: '#9aaabb', borderBottom: '1px solid #f0f0f4', width: '40px' }}>{idx + 1}</td>
                      <td style={{ padding: '11px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{d.doc_name}</td>
                      <td style={{ padding: '11px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
                          background: d.delivery_type === 'digital' ? '#eef4fb' : d.delivery_type === 'physical' ? '#fff8ec' : '#edfaf3',
                          color: d.delivery_type === 'digital' ? '#1a5fa5' : d.delivery_type === 'physical' ? '#92600a' : '#1a7a45',
                        }}>
                          {d.delivery_type === 'digital' ? 'Dijital' : d.delivery_type === 'physical' ? 'Elden' : 'Firma'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => {
                            setEditEvrak(d)
                            setEvrakForm({ country: d.country, visa_type: d.visa_type, doc_name: d.doc_name, delivery_type: d.delivery_type, order_num: d.order_num })
                            setShowEvrakModal(true)
                          }} style={{ padding: '4px 10px', fontSize: '11px', background: '#eef4fb', color: '#1a5fa5', border: '1px solid #b8d4f0', borderRadius: '6px', cursor: 'pointer' }}>Düzenle</button>
                          <button onClick={() => deleteEvrak(d.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer' }}>Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Evrak Modal */}
      {showEvrakModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '400px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#1c1c24' }}>
              {editEvrak ? 'Evrak Düzenle' : 'Yeni Evrak Ekle'}
            </h3>
            {[
              { label: 'Ülke', key: 'country', readOnly: !!editEvrak },
              { label: 'Vize Tipi', key: 'visa_type', readOnly: !!editEvrak },
              { label: 'Evrak Adı', key: 'doc_name', readOnly: false, placeholder: 'Pasaport fotokopisi' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{f.label}</label>
                <input value={(evrakForm as any)[f.key]} readOnly={f.readOnly} placeholder={f.placeholder}
                  onChange={e => setEvrakForm({ ...evrakForm, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: f.readOnly ? '#f5f5f7' : 'white', fontFamily: 'inherit' }} />
              </div>
            ))}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Teslimat Tipi</label>
              <select value={evrakForm.delivery_type} onChange={e => setEvrakForm({ ...evrakForm, delivery_type: e.target.value })} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}>
                <option value="digital">Dijital (portal üzerinden yüklenir)</option>
                <option value="physical">Elden (randevu günü teslim)</option>
                <option value="company">Firma (danışmanlık firması ekler)</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Sıra No</label>
              <input type="number" value={evrakForm.order_num} onChange={e => setEvrakForm({ ...evrakForm, order_num: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowEvrakModal(false); setEditEvrak(null) }} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={saveEvrak} disabled={savingEvrak} style={{ flex: 2, padding: '10px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {savingEvrak ? 'Kaydediliyor...' : editEvrak ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Ülke/Vize Tipi Modal */}
      {showNewCombo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#1c1c24' }}>Yeni Ülke / Vize Tipi</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
              <input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="Avustralya" style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
              <input value={newVisa} onChange={e => setNewVisa(e.target.value)} placeholder="Turist, İş, Öğrenci..." style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowNewCombo(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={addNewCombo} style={{ flex: 2, padding: '10px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                Oluştur ve Evrak Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
