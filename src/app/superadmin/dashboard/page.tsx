'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

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

// ── styles ──────────────────────────────────────────────
const C = {
  bg: '#050810',
  sidebar: '#0a0f1e',
  accent: '#6C47FF',
  cyan: '#00D4FF',
  card: 'rgba(108,71,255,0.05)',
  cardBorder: 'rgba(108,71,255,0.15)',
  rowHover: 'rgba(108,71,255,0.07)',
  text: 'white',
  muted: 'rgba(255,255,255,0.45)',
  faint: 'rgba(255,255,255,0.15)',
  sidebarBorder: 'rgba(108,71,255,0.2)',
}

const cardStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: '12px',
  padding: '1.25rem',
}

const thStyle: React.CSSProperties = {
  fontSize: '10px',
  color: C.muted,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  padding: '10px 1.25rem',
  textAlign: 'left',
  borderBottom: `1px solid rgba(108,71,255,0.12)`,
  background: 'rgba(108,71,255,0.08)',
}

const tdStyle: React.CSSProperties = {
  padding: '11px 1.25rem',
  fontSize: '13px',
  borderBottom: `1px solid rgba(108,71,255,0.08)`,
  color: C.text,
}

function modalOverlay(children: React.ReactNode) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,16,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(8px)' }}>
      {children}
    </div>
  )
}

const modalBox: React.CSSProperties = {
  background: '#0d1428',
  border: `1px solid rgba(108,71,255,0.3)`,
  borderRadius: '18px',
  padding: '2rem',
  width: '420px',
  maxWidth: '95vw',
  boxShadow: '0 0 80px rgba(108,71,255,0.2)',
}

// ── component ────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({})
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'genel' | 'gelir' | 'saglik' | 'destek' | 'firmalar' | 'evraklar'>('genel')

  const [saglik, setSaglik] = useState<{ leads: number; monthlyApps: number; activeUsers7d: number; logs: any[] }>({ leads: 0, monthlyApps: 0, activeUsers7d: 0, logs: [] })

  const [destekFirmaId, setDestekFirmaId] = useState('')
  const [destekLogs, setDestekLogs] = useState<any[]>([])
  const [destekMsg, setDestekMsg] = useState('')
  const [destekSent, setDestekSent] = useState(false)
  const [sendingDestek, setSendingDestek] = useState(false)

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

  useEffect(() => { checkAuth() }, [])

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
    const { data } = await supabase.from('applications').select('id, status, country, visa_type, created_at, clients(full_name, companies(name))').order('created_at', { ascending: false }).limit(10)
    setActivities(data || [])
  }

  async function fetchSaglik() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const [{ count: leads }, { count: monthlyApps }, { data: recentActivity }, { data: logs }] = await Promise.all([
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
    const { data } = await supabase.from('activity_logs').select('*').eq('company_id', firmaId).order('created_at', { ascending: false }).limit(50)
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
    if (unique.length > 0) { setSelectedCountry(unique[0].country); setSelectedVisa(unique[0].visa_type) }
  }

  async function logout() { await supabase.auth.signOut(); router.push('/superadmin/login') }

  async function saveEvrak() {
    if (!evrakForm.country || !evrakForm.visa_type || !evrakForm.doc_name) return
    setSavingEvrak(true)
    if (editEvrak) {
      await supabase.from('visa_documents').update({ country: evrakForm.country, visa_type: evrakForm.visa_type, doc_name: evrakForm.doc_name, delivery_type: evrakForm.delivery_type, order_num: evrakForm.order_num }).eq('id', editEvrak.id)
    } else {
      await supabase.from('visa_documents').insert({ country: evrakForm.country, visa_type: evrakForm.visa_type, doc_name: evrakForm.doc_name, delivery_type: evrakForm.delivery_type, order_num: evrakForm.order_num })
    }
    setSavingEvrak(false); setShowEvrakModal(false); setEditEvrak(null)
    setEvrakForm({ country: '', visa_type: '', doc_name: '', delivery_type: 'digital', order_num: 1 })
    await fetchVisaDocs(); await fetchVisaOptions()
  }

  async function deleteEvrak(id: string) {
    if (!confirm('Bu evrakı silmek istediğinizden emin misiniz?')) return
    await supabase.from('visa_documents').delete().eq('id', id)
    fetchVisaDocs()
  }

  async function addNewCombo() {
    if (!newCountry || !newVisa) return
    setSelectedCountry(newCountry); setSelectedVisa(newVisa)
    setEvrakForm({ country: newCountry, visa_type: newVisa, doc_name: '', delivery_type: 'digital', order_num: 1 })
    setShowNewCombo(false); setNewCountry(''); setNewVisa(''); setShowEvrakModal(true)
  }

  async function handleDestekSend() {
    if (!destekMsg.trim() || !destekFirmaId) return
    setSendingDestek(true)
    await new Promise(r => setTimeout(r, 800))
    setSendingDestek(false); setDestekSent(true); setDestekMsg('')
    setTimeout(() => setDestekSent(false), 3000)
  }

  const countries = [...new Set(visaOptions.map(v => v.country))].sort()
  const visaTypesForCountry = [...new Set(visaOptions.filter(v => v.country === selectedCountry).map(v => v.visa_type))].sort()
  const filteredDocs = visaDocs.filter(d => d.country === selectedCountry && d.visa_type === selectedVisa)

  const basicFirms = companies.filter(c => c.plan === 'basic')
  const proFirms = companies.filter(c => c.plan === 'pro')
  const monthlyRevenue = basicFirms.length * PLAN_PRICES.basic + proFirms.length * PLAN_PRICES.pro

  const now = new Date()
  const last12Months = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (11 - i), 1))
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
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 5,
      },
      {
        label: 'Pro (₺)',
        data: last12Months.map(m => {
          const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
          return companies.filter(c => c.plan === 'pro' && new Date(c.created_at) <= end).length * PLAN_PRICES.pro
        }),
        backgroundColor: 'rgba(108,71,255,0.75)',
        borderRadius: 5,
      },
    ],
  }

  const mrrChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: 'rgba(255,255,255,0.6)', font: { size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(13,20,45,0.98)',
        titleColor: 'white',
        bodyColor: 'rgba(255,255,255,0.7)',
        borderColor: 'rgba(108,71,255,0.4)',
        borderWidth: 1,
        callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ₺${Number(ctx.raw).toLocaleString('tr-TR')}` },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.35)' }, border: { color: 'rgba(108,71,255,0.15)' } },
      y: { stacked: true, ticks: { color: 'rgba(255,255,255,0.35)', callback: (v: any) => v === 0 ? '₺0' : `₺${(v / 1000).toFixed(0)}K` }, grid: { color: 'rgba(108,71,255,0.08)' }, border: { color: 'rgba(108,71,255,0.15)' } },
    },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid rgba(108,71,255,0.3)', borderTop: '2px solid #6C47FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ color: C.muted, fontSize: '13px', letterSpacing: '1px' }}>Yükleniyor...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const navItems: [typeof activeTab, string][] = [
    ['genel', 'Genel Bakış'],
    ['gelir', 'Gelir Takibi'],
    ['saglik', 'Sistem Sağlığı'],
    ['destek', 'Destek'],
    ['firmalar', 'Firmalar'],
    ['evraklar', 'Evrak Şablonları'],
  ]

  return (
    <>
      <style>{`
        .sa-inp::placeholder { color: rgba(255,255,255,0.25); }
        .sa-inp:focus { border-color: rgba(108,71,255,0.55) !important; outline: none; }
        .sa-sel option { background: #0d1428; color: white; }
        .sa-row:hover { background: rgba(108,71,255,0.07) !important; }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', background: C.bg, fontFamily: 'system-ui' }}>

        {/* ── Sidebar ── */}
        <div style={{ width: '220px', flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.sidebarBorder}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50 }}>
          {/* Logo */}
          <div style={{ padding: '1.5rem 1.25rem', borderBottom: `1px solid rgba(108,71,255,0.12)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6C47FF, #00D4FF)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(108,71,255,0.45)', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="37" stroke="white" strokeWidth="3"/>
                  <polygon points="40,4 45.5,37 40,31 34.5,37" fill="white"/>
                  <circle cx="40" cy="40" r="3.5" fill="white"/>
                </svg>
              </div>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '13px', letterSpacing: '2px' }}>VECTROPUS</span>
            </div>
            <div style={{ fontSize: '9px', color: C.accent, letterSpacing: '3px', fontWeight: '600', textTransform: 'uppercase', paddingLeft: '42px' }}>CONTROL</div>
            <div style={{ marginTop: '10px', height: '1px', background: `linear-gradient(90deg, ${C.accent}, transparent)`, opacity: 0.5 }} />
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.75rem 0' }}>
            {navItems.map(([key, label]) => {
              const active = activeTab === key
              return (
                <button key={key} onClick={() => setActiveTab(key)} style={{ width: '100%', padding: '10px 1.25rem', display: 'flex', alignItems: 'center', gap: '10px', background: active ? 'rgba(108,71,255,0.15)' : 'transparent', borderLeft: `3px solid ${active ? C.accent : 'transparent'}`, color: active ? 'white' : C.muted, fontSize: '13px', fontWeight: active ? '600' : '400', border: 'none', borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeftWidth: '3px', borderLeftStyle: 'solid', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s', boxSizing: 'border-box' }}>
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '1rem 1.25rem', borderTop: `1px solid rgba(108,71,255,0.12)` }}>
            <button onClick={logout} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.04)', color: C.muted, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ marginLeft: '220px', flex: 1, padding: '2rem', overflowY: 'auto', minHeight: '100vh' }}>

          {/* Page title */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'white' }}>
              {navItems.find(([k]) => k === activeTab)?.[1]}
            </h2>
            <div style={{ height: '2px', width: '32px', background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`, borderRadius: '99px', marginTop: '8px' }} />
          </div>

          {/* ── GENEL BAKIŞ ── */}
          {activeTab === 'genel' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '2rem' }}>
                {[
                  { label: 'Toplam Firma', value: companies.length, accent: C.accent },
                  { label: 'Basic Plan', value: basicFirms.length, accent: C.muted },
                  { label: 'Pro Plan', value: proFirms.length, accent: C.cyan },
                  { label: 'Aylık Gelir', value: `₺${monthlyRevenue.toLocaleString('tr-TR')}`, accent: '#00D464' },
                ].map((s, i) => (
                  <div key={i} style={{ ...cardStyle, borderTop: `2px solid ${s.accent}` }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid rgba(108,71,255,0.12)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'white' }}>Son Aktiviteler</h3>
                  <span style={{ fontSize: '11px', color: C.muted }}>Son 10 işlem</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Müşteri', 'Firma', 'Vize', 'Durum', 'Tarih'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {activities.length === 0 && <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: C.muted, padding: '2.5rem' }}>Henüz aktivite yok.</td></tr>}
                    {activities.map((a: any) => (
                      <tr key={a.id} className="sa-row">
                        <td style={{ ...tdStyle, fontWeight: '500' }}>{a.clients?.full_name || '—'}</td>
                        <td style={{ ...tdStyle, color: C.muted }}>{(a.clients as any)?.companies?.name || '—'}</td>
                        <td style={{ ...tdStyle, color: C.muted }}>{a.country} {a.visa_type}</td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px', background: 'rgba(108,71,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                            {statusLabels[a.status] || a.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: C.muted }}>{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── GELİR TAKİBİ ── */}
          {activeTab === 'gelir' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '2rem' }}>
                {[
                  { label: 'Toplam Firma', value: companies.length, accent: C.accent },
                  { label: 'Aktif Firma', value: activeFirms.length, accent: '#00D464' },
                  { label: 'Bu Ay Kazanılan', value: thisMonthFirms.length, accent: C.cyan },
                  { label: 'Ort. Gelir/Firma', value: `₺${avgRevenue.toLocaleString('tr-TR')}`, accent: '#FFB800' },
                ].map((s, i) => (
                  <div key={i} style={{ ...cardStyle, borderTop: `2px solid ${s.accent}` }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'white', lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'white' }}>Aylık MRR Tahmini (Son 12 Ay)</h3>
                  <div style={{ fontSize: '22px', fontWeight: '700', background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₺{monthlyRevenue.toLocaleString('tr-TR')}</div>
                </div>
                <div style={{ height: '280px' }}>
                  <Bar data={mrrChartData} options={mrrChartOptions} />
                </div>
                <div style={{ marginTop: '1rem', fontSize: '11px', color: C.muted, textAlign: 'center' }}>
                  * Mevcut plan bazında hesaplanmıştır. Plan değişiklikleri tarihlenmez.
                </div>
              </div>

              <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid rgba(108,71,255,0.12)`, background: 'rgba(108,71,255,0.08)' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>Plan Dağılımı</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Plan', 'Firma Sayısı', 'Aylık Ücret', 'Toplam Gelir'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {[
                      { plan: 'Basic', count: basicFirms.length, price: PLAN_PRICES.basic, isBasic: true },
                      { plan: 'Pro', count: proFirms.length, price: PLAN_PRICES.pro, isBasic: false },
                    ].map(row => (
                      <tr key={row.plan} className="sa-row">
                        <td style={tdStyle}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: row.isBasic ? 'rgba(255,255,255,0.1)' : 'rgba(108,71,255,0.25)', color: row.isBasic ? 'rgba(255,255,255,0.6)' : '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{row.plan}</span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{row.count}</td>
                        <td style={{ ...tdStyle, color: C.muted }}>₺{row.price.toLocaleString('tr-TR')}/ay</td>
                        <td style={{ ...tdStyle, fontWeight: '700', color: '#00D464' }}>₺{(row.count * row.price).toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'rgba(108,71,255,0.06)' }}>
                      <td style={{ ...tdStyle, fontWeight: '600' }}>Toplam</td>
                      <td style={{ ...tdStyle, fontWeight: '700' }}>{companies.length}</td>
                      <td style={tdStyle} />
                      <td style={{ ...tdStyle, fontSize: '16px', fontWeight: '700', color: '#00D464' }}>₺{monthlyRevenue.toLocaleString('tr-TR')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SİSTEM SAĞLIĞI ── */}
          {activeTab === 'saglik' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '2rem' }}>
                {[
                  { label: 'Son 7 Gün Aktif Kullanıcı', value: saglik.activeUsers7d, accent: C.cyan, sub: 'Activity log\'a göre' },
                  { label: 'Toplam Lead', value: saglik.leads, accent: '#FFB800', sub: 'Tüm firmalar' },
                  { label: 'Bu Ay Başvuru', value: saglik.monthlyApps, accent: '#00D464', sub: 'Tüm firmalar' },
                ].map((s, i) => (
                  <div key={i} style={{ ...cardStyle, borderTop: `2px solid ${s.accent}` }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '6px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid rgba(108,71,255,0.12)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(108,71,255,0.08)' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>Son 20 Sistem Aktivitesi</h3>
                  <button onClick={fetchSaglik} style={{ padding: '5px 12px', fontSize: '11px', background: 'rgba(108,71,255,0.15)', color: '#a78bfa', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>Yenile</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Kullanıcı', 'İşlem', 'Tür', 'Tarih & Saat'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {saglik.logs.length === 0 && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: C.muted, padding: '2rem' }}>Kayıt yok.</td></tr>}
                    {saglik.logs.map((log: any) => (
                      <tr key={log.id} className="sa-row">
                        <td style={{ ...tdStyle, fontWeight: '500' }}>{log.user_name || '—'}</td>
                        <td style={{ ...tdStyle, color: C.muted }}>{log.action}</td>
                        <td style={tdStyle}>
                          {log.entity_type && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: 'rgba(108,71,255,0.15)', color: '#a78bfa' }}>{log.entity_type}</span>}
                        </td>
                        <td style={{ ...tdStyle, color: C.muted }}>{new Date(log.created_at).toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── DESTEK ── */}
          {activeTab === 'destek' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Sol: Activity log */}
              <div>
                <div style={{ ...cardStyle, marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Firma Seç</label>
                  <select className="sa-sel" value={destekFirmaId} onChange={e => { setDestekFirmaId(e.target.value); fetchDestekLogs(e.target.value) }} style={{ width: '100%', padding: '10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', fontFamily: 'inherit' }}>
                    <option value="">— Firma seçin —</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid rgba(108,71,255,0.12)`, display: 'flex', justifyContent: 'space-between', background: 'rgba(108,71,255,0.08)' }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'white' }}>
                      {destekFirmaId ? `${companies.find(c => c.id === destekFirmaId)?.name} — Log` : 'Activity Log'}
                    </h3>
                    <span style={{ fontSize: '11px', color: C.muted }}>Son 50 kayıt</span>
                  </div>
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {!destekFirmaId && <div style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: C.muted }}>Yukarıdan bir firma seçin.</div>}
                    {destekFirmaId && destekLogs.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: C.muted }}>Bu firmaya ait kayıt yok.</div>}
                    {destekLogs.map((log: any) => (
                      <div key={log.id} style={{ padding: '10px 1.25rem', borderBottom: `1px solid rgba(108,71,255,0.08)`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.accent, marginTop: '6px', flexShrink: 0, boxShadow: `0 0 6px ${C.accent}` }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: 'white' }}>{log.action}</div>
                          {log.entity_name && <div style={{ fontSize: '11px', color: C.muted, marginTop: '1px' }}>{log.entity_name}</div>}
                          <div style={{ fontSize: '11px', color: C.faint, marginTop: '2px' }}>{log.user_name} · {new Date(log.created_at).toLocaleString('tr-TR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sağ: Bildirim */}
              <div style={{ ...cardStyle }}>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: 'white' }}>Bildirim Gönder</h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Alıcı Firma</label>
                  <select className="sa-sel" value={destekFirmaId} onChange={e => { setDestekFirmaId(e.target.value); fetchDestekLogs(e.target.value) }} style={{ width: '100%', padding: '10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', fontFamily: 'inherit' }}>
                    <option value="">— Firma seçin —</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mesaj</label>
                  <textarea value={destekMsg} onChange={e => setDestekMsg(e.target.value)} placeholder="Mesajınızı yazın..." rows={5} className="sa-inp" style={{ width: '100%', padding: '10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                {destekSent && <div style={{ background: 'rgba(0,212,100,0.1)', border: '1px solid rgba(0,212,100,0.2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#00D464' }}>✓ Bildirim gönderildi.</div>}
                <button onClick={handleDestekSend} disabled={sendingDestek || !destekFirmaId || !destekMsg.trim()} style={{ width: '100%', padding: '11px', background: !destekFirmaId || !destekMsg.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: !destekFirmaId || !destekMsg.trim() ? C.muted : 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: !destekFirmaId || !destekMsg.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: !destekFirmaId || !destekMsg.trim() ? 'none' : '0 0 20px rgba(108,71,255,0.3)', opacity: sendingDestek ? 0.7 : 1 }}>
                  {sendingDestek ? 'Gönderiliyor...' : 'Gönder'}
                </button>
                <div style={{ marginTop: '8px', fontSize: '11px', color: C.faint, textAlign: 'center' }}>WhatsApp / sistem bildirimi için API bağlantısı gereklidir.</div>
              </div>
            </div>
          )}

          {/* ── FİRMALAR ── */}
          {activeTab === 'firmalar' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>{companies.length} firma kayıtlı</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => router.push('/superadmin/firma')} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: '500', background: 'rgba(108,71,255,0.1)', color: '#a78bfa', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Firma Yönetimi →
                  </button>
                  <button onClick={() => router.push('/superadmin/firma/yeni')} style={{ padding: '9px 18px', fontSize: '13px', fontWeight: '600', background: 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(108,71,255,0.35)' }}>
                    + Yeni Firma
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {companies.map(c => {
                  const limit = PLAN_LIMITS[c.plan] || 0
                  const used = monthlyCounts[c.id] || 0
                  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                  return (
                    <div key={c.id} style={{ ...cardStyle }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{c.city || c.email}</div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', background: c.plan === 'pro' ? 'rgba(108,71,255,0.25)' : 'rgba(255,255,255,0.08)', color: c.plan === 'pro' ? '#a78bfa' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {c.plan || 'basic'}
                        </span>
                      </div>
                      {limit > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: C.muted, marginBottom: '5px' }}>
                            <span>Bu Ayki Dosya</span>
                            <span style={{ fontWeight: '600', color: pct >= 90 ? '#FF6B6B' : 'white' }}>{used}/{limit}</span>
                          </div>
                          <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#FF6B6B' : `linear-gradient(90deg, ${C.accent}, ${C.cyan})`, borderRadius: '99px' }} />
                          </div>
                        </div>
                      )}
                      {[
                        ['Kayıt', new Date(c.created_at).toLocaleDateString('tr-TR')],
                        ['Aylık Ücret', `₺${(PLAN_PRICES[c.plan] || 0).toLocaleString('tr-TR')}`],
                      ].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid rgba(108,71,255,0.08)`, fontSize: '12px' }}>
                          <span style={{ color: C.muted }}>{label}</span>
                          <span style={{ color: 'white', fontWeight: '500' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── EVRAK ŞABLONLARI ── */}
          {activeTab === 'evraklar' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                <div />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowNewCombo(true)} style={{ padding: '8px 14px', fontSize: '12px', background: 'rgba(108,71,255,0.1)', color: '#a78bfa', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    + Yeni Ülke/Vize Tipi
                  </button>
                  <button onClick={() => { setEditEvrak(null); setEvrakForm({ country: selectedCountry, visa_type: selectedVisa, doc_name: '', delivery_type: 'digital', order_num: filteredDocs.length + 1 }); setShowEvrakModal(true) }} style={{ padding: '8px 14px', fontSize: '12px', background: 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 16px rgba(108,71,255,0.35)' }}>
                    + Evrak Ekle
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle, marginBottom: '1rem', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { label: 'Ülke', value: selectedCountry, options: countries, onChange: (v: string) => { const firstVisa = visaOptions.find(o => o.country === v)?.visa_type || ''; setSelectedCountry(v); setSelectedVisa(firstVisa) } },
                  { label: 'Vize Tipi', value: selectedVisa, options: visaTypesForCountry, onChange: (v: string) => setSelectedVisa(v) },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: C.muted, fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{f.label}</label>
                    <select className="sa-sel" value={f.value} onChange={e => f.onChange(e.target.value)} style={{ padding: '7px 10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', fontFamily: 'inherit' }}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <span style={{ fontSize: '12px', color: C.muted }}>{filteredDocs.length} evrak</span>
              </div>

              <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['#', 'Evrak Adı', 'Teslimat Tipi', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredDocs.length === 0 && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: C.muted, padding: '2rem' }}>Bu kombinasyon için evrak tanımlanmamış.</td></tr>}
                    {filteredDocs.map((d, idx) => {
                      const dtColor = d.delivery_type === 'digital' ? { bg: 'rgba(0,212,255,0.12)', color: '#00D4FF' } : d.delivery_type === 'physical' ? { bg: 'rgba(255,168,0,0.12)', color: '#FFB800' } : { bg: 'rgba(108,71,255,0.15)', color: '#a78bfa' }
                      return (
                        <tr key={d.id} className="sa-row">
                          <td style={{ ...tdStyle, color: C.muted, width: '40px' }}>{idx + 1}</td>
                          <td style={{ ...tdStyle, fontWeight: '500' }}>{d.doc_name}</td>
                          <td style={tdStyle}>
                            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: dtColor.bg, color: dtColor.color }}>
                              {d.delivery_type === 'digital' ? 'Dijital' : d.delivery_type === 'physical' ? 'Elden' : 'Firma'}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => { setEditEvrak(d); setEvrakForm({ country: d.country, visa_type: d.visa_type, doc_name: d.doc_name, delivery_type: d.delivery_type, order_num: d.order_num }); setShowEvrakModal(true) }} style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(108,71,255,0.15)', color: '#a78bfa', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>Düzenle</button>
                              <button onClick={() => deleteEvrak(d.id)} style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(255,80,80,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>Sil</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ── Evrak Modal ── */}
        {showEvrakModal && modalOverlay(
          <div style={modalBox}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>{editEvrak ? 'Evrak Düzenle' : 'Yeni Evrak Ekle'}</h3>
            {([
              { label: 'Ülke', key: 'country', readOnly: !!editEvrak },
              { label: 'Vize Tipi', key: 'visa_type', readOnly: !!editEvrak },
              { label: 'Evrak Adı', key: 'doc_name', readOnly: false, placeholder: 'Pasaport fotokopisi' },
            ] as { label: string; key: string; readOnly: boolean; placeholder?: string }[]).map(f => (
              <div key={f.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{f.label}</label>
                <input value={(evrakForm as any)[f.key]} readOnly={f.readOnly} placeholder={f.placeholder} onChange={e => setEvrakForm({ ...evrakForm, [f.key]: e.target.value })} className="sa-inp" style={{ width: '100%', padding: '10px', background: f.readOnly ? 'rgba(255,255,255,0.04)' : 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            ))}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Teslimat Tipi</label>
              <select className="sa-sel" value={evrakForm.delivery_type} onChange={e => setEvrakForm({ ...evrakForm, delivery_type: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', fontFamily: 'inherit' }}>
                <option value="digital">Dijital (portal üzerinden yüklenir)</option>
                <option value="physical">Elden (randevu günü teslim)</option>
                <option value="company">Firma (danışmanlık firması ekler)</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Sıra No</label>
              <input type="number" value={evrakForm.order_num} onChange={e => setEvrakForm({ ...evrakForm, order_num: parseInt(e.target.value) })} className="sa-inp" style={{ width: '100%', padding: '10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowEvrakModal(false); setEditEvrak(null) }} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: C.muted, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={saveEvrak} disabled={savingEvrak} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(108,71,255,0.3)', opacity: savingEvrak ? 0.7 : 1 }}>
                {savingEvrak ? 'Kaydediliyor...' : editEvrak ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* ── Yeni Ülke/Vize Tipi Modal ── */}
        {showNewCombo && modalOverlay(
          <div style={modalBox}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>Yeni Ülke / Vize Tipi</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
              <input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="Avustralya" className="sa-inp" style={{ width: '100%', padding: '10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
              <input value={newVisa} onChange={e => setNewVisa(e.target.value)} placeholder="Turist, İş, Öğrenci..." className="sa-inp" style={{ width: '100%', padding: '10px', background: 'rgba(108,71,255,0.08)', border: `1px solid rgba(108,71,255,0.25)`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowNewCombo(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: C.muted, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={addNewCombo} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(108,71,255,0.3)' }}>
                Oluştur ve Evrak Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
