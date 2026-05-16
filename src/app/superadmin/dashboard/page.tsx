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

const S = {
  bg: '#0f172a',
  sidebar: '#1e293b',
  card: '#1e293b',
  border: '#334155',
  accent: '#6366f1',
  text: 'white',
  muted: '#94a3b8',
  faint: '#475569',
}

const thS: React.CSSProperties = {
  fontSize: '11px', fontWeight: '600', color: S.muted, textTransform: 'uppercase',
  letterSpacing: '0.6px', padding: '10px 1rem', textAlign: 'left',
  borderBottom: `1px solid ${S.border}`, background: '#1e293b',
}

const tdS: React.CSSProperties = {
  padding: '12px 1rem', fontSize: '13px', borderBottom: `1px solid #1e3a5f20`, color: S.text,
}

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
        backgroundColor: '#334155',
        borderRadius: 4,
      },
      {
        label: 'Pro (₺)',
        data: last12Months.map(m => {
          const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59)
          return companies.filter(c => c.plan === 'pro' && new Date(c.created_at) <= end).length * PLAN_PRICES.pro
        }),
        backgroundColor: '#6366f1',
        borderRadius: 4,
      },
    ],
  }

  const mrrChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#94a3b8', font: { size: 12 } } },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: 'white',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ₺${Number(ctx.raw).toLocaleString('tr-TR')}` },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: '#475569' }, border: { color: '#334155' } },
      y: { stacked: true, ticks: { color: '#475569', callback: (v: any) => v === 0 ? '₺0' : `₺${(v / 1000).toFixed(0)}K` }, grid: { color: '#1e293b' }, border: { color: '#334155' } },
    },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: S.bg, fontFamily: 'system-ui' }}>
      <div style={{ color: S.muted, fontSize: '13px' }}>Yükleniyor...</div>
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

  const inpS: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#0f172a', border: `1px solid ${S.border}`, borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const selS: React.CSSProperties = { ...inpS }

  return (
    <>
      <style>{`
        .sd-inp::placeholder { color: #475569; }
        .sd-inp:focus { border-color: #6366f1 !important; outline: none; }
        .sd-sel option { background: #1e293b; color: white; }
        .sd-row:hover td { background: #1e293b; }
        .sd-btn-ghost { background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 8px; padding: 9px 16px; font-size: 13px; cursor: pointer; font-family: inherit; }
        .sd-btn-ghost:hover { background: #273548; }
        .sd-btn-primary { background: #6366f1; color: white; border: none; border-radius: 8px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .sd-btn-primary:hover { background: #4f46e5; }
        .sd-btn-primary:disabled { background: #334155; color: #475569; cursor: not-allowed; }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', background: S.bg, fontFamily: 'system-ui' }}>

        {/* ── Sidebar ── */}
        <div style={{ width: '216px', flexShrink: 0, background: S.sidebar, borderRight: `1px solid ${S.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0 }}>
          {/* Logo */}
          <div style={{ padding: '1.25rem 1rem', borderBottom: `1px solid ${S.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '28px', height: '28px', background: S.accent, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="37" stroke="white" strokeWidth="4"/>
                  <polygon points="40,4 45.5,37 40,31 34.5,37" fill="white"/>
                  <circle cx="40" cy="40" r="4" fill="white"/>
                </svg>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '13px', letterSpacing: '0.5px' }}>Vectropus</div>
                <div style={{ color: S.faint, fontSize: '10px', letterSpacing: '0.3px' }}>Admin Panel</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0.5rem 0' }}>
            {navItems.map(([key, label]) => {
              const active = activeTab === key
              return (
                <button key={key} onClick={() => setActiveTab(key)} style={{ width: '100%', padding: '9px 1rem', display: 'block', background: active ? '#273548' : 'transparent', borderLeft: `3px solid ${active ? S.accent : 'transparent'}`, color: active ? 'white' : S.muted, fontSize: '13px', fontWeight: active ? '500' : '400', border: 'none', borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeftWidth: '3px', borderLeftStyle: 'solid', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '1rem', borderTop: `1px solid ${S.border}` }}>
            <button onClick={logout} style={{ width: '100%', padding: '8px', background: 'transparent', color: S.muted, border: `1px solid ${S.border}`, borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ marginLeft: '216px', flex: 1, padding: '2rem', minHeight: '100vh' }}>

          {/* Page header */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${S.border}` }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'white' }}>
              {navItems.find(([k]) => k === activeTab)?.[1]}
            </h2>
          </div>

          {/* ── GENEL BAKIŞ ── */}
          {activeTab === 'genel' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Toplam Firma', value: companies.length },
                  { label: 'Basic Plan', value: basicFirms.length },
                  { label: 'Pro Plan', value: proFirms.length },
                  { label: 'Aylık Gelir', value: `₺${monthlyRevenue.toLocaleString('tr-TR')}` },
                ].map((s, i) => (
                  <div key={i} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${S.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>Son Aktiviteler</span>
                  <span style={{ fontSize: '12px', color: S.muted }}>Son 10 işlem</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Müşteri', 'Firma', 'Vize', 'Durum', 'Tarih'].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>
                    {activities.length === 0 && <tr><td colSpan={5} style={{ ...tdS, textAlign: 'center', color: S.muted, padding: '2rem' }}>Henüz aktivite yok.</td></tr>}
                    {activities.map((a: any) => (
                      <tr key={a.id} className="sd-row">
                        <td style={{ ...tdS, fontWeight: '500' }}>{a.clients?.full_name || '—'}</td>
                        <td style={{ ...tdS, color: S.muted }}>{(a.clients as any)?.companies?.name || '—'}</td>
                        <td style={{ ...tdS, color: S.muted }}>{a.country} {a.visa_type}</td>
                        <td style={tdS}>
                          <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: '#273548', color: S.muted }}>
                            {statusLabels[a.status] || a.status}
                          </span>
                        </td>
                        <td style={{ ...tdS, color: S.muted }}>{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Toplam Firma', value: companies.length },
                  { label: 'Aktif Firma', value: activeFirms.length },
                  { label: 'Bu Ay Kazanılan', value: thisMonthFirms.length },
                  { label: 'Ort. Gelir/Firma', value: `₺${avgRevenue.toLocaleString('tr-TR')}` },
                ].map((s, i) => (
                  <div key={i} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>Aylık MRR Tahmini (Son 12 Ay)</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>₺{monthlyRevenue.toLocaleString('tr-TR')}</span>
                </div>
                <div style={{ height: '260px' }}>
                  <Bar data={mrrChartData} options={mrrChartOptions} />
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '11px', color: S.faint, textAlign: 'right' }}>
                  * Mevcut plan bazında hesaplanmıştır.
                </div>
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${S.border}` }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>Plan Dağılımı</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Plan', 'Firma Sayısı', 'Aylık Ücret', 'Toplam Gelir'].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[
                      { plan: 'Basic', count: basicFirms.length, price: PLAN_PRICES.basic },
                      { plan: 'Pro', count: proFirms.length, price: PLAN_PRICES.pro },
                    ].map(row => (
                      <tr key={row.plan} className="sd-row">
                        <td style={tdS}>
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: row.plan === 'Pro' ? '#312e81' : '#273548', color: row.plan === 'Pro' ? '#a5b4fc' : S.muted, textTransform: 'uppercase' }}>{row.plan}</span>
                        </td>
                        <td style={{ ...tdS, fontWeight: '600' }}>{row.count}</td>
                        <td style={{ ...tdS, color: S.muted }}>₺{row.price.toLocaleString('tr-TR')}/ay</td>
                        <td style={{ ...tdS, fontWeight: '600' }}>₺{(row.count * row.price).toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#273548' }}>
                      <td style={{ ...tdS, fontWeight: '600' }}>Toplam</td>
                      <td style={{ ...tdS, fontWeight: '700' }}>{companies.length}</td>
                      <td style={tdS} />
                      <td style={{ ...tdS, fontWeight: '700' }}>₺{monthlyRevenue.toLocaleString('tr-TR')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SİSTEM SAĞLIĞI ── */}
          {activeTab === 'saglik' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Son 7 Gün Aktif Kullanıcı', value: saglik.activeUsers7d, sub: 'Activity log\'a göre' },
                  { label: 'Toplam Lead', value: saglik.leads, sub: 'Tüm firmalar' },
                  { label: 'Bu Ay Başvuru', value: saglik.monthlyApps, sub: 'Tüm firmalar' },
                ].map((s, i) => (
                  <div key={i} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: S.faint, marginTop: '5px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${S.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>Son 20 Sistem Aktivitesi</span>
                  <button onClick={fetchSaglik} className="sd-btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }}>Yenile</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Kullanıcı', 'İşlem', 'Tür', 'Tarih & Saat'].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>
                    {saglik.logs.length === 0 && <tr><td colSpan={4} style={{ ...tdS, textAlign: 'center', color: S.muted, padding: '2rem' }}>Kayıt yok.</td></tr>}
                    {saglik.logs.map((log: any) => (
                      <tr key={log.id} className="sd-row">
                        <td style={{ ...tdS, fontWeight: '500' }}>{log.user_name || '—'}</td>
                        <td style={{ ...tdS, color: S.muted }}>{log.action}</td>
                        <td style={tdS}>
                          {log.entity_type && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px', background: '#273548', color: S.muted }}>{log.entity_type}</span>}
                        </td>
                        <td style={{ ...tdS, color: S.faint }}>{new Date(log.created_at).toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── DESTEK ── */}
          {activeTab === 'destek' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
              <div>
                <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Firma Seç</label>
                  <select className="sd-sel" value={destekFirmaId} onChange={e => { setDestekFirmaId(e.target.value); fetchDestekLogs(e.target.value) }} style={selS}>
                    <option value="">— Firma seçin —</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${S.border}`, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>
                      {destekFirmaId ? `${companies.find(c => c.id === destekFirmaId)?.name} — Log` : 'Activity Log'}
                    </span>
                    <span style={{ fontSize: '11px', color: S.muted }}>Son 50 kayıt</span>
                  </div>
                  <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                    {!destekFirmaId && <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '13px', color: S.muted }}>Yukarıdan bir firma seçin.</div>}
                    {destekFirmaId && destekLogs.length === 0 && <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: '13px', color: S.muted }}>Bu firmaya ait kayıt yok.</div>}
                    {destekLogs.map((log: any) => (
                      <div key={log.id} style={{ padding: '10px 1rem', borderBottom: `1px solid ${S.border}`, display: 'flex', gap: '10px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: S.accent, marginTop: '7px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '13px', color: 'white' }}>{log.action}</div>
                          {log.entity_name && <div style={{ fontSize: '11px', color: S.muted, marginTop: '1px' }}>{log.entity_name}</div>}
                          <div style={{ fontSize: '11px', color: S.faint, marginTop: '2px' }}>{log.user_name} · {new Date(log.created_at).toLocaleString('tr-TR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>Bildirim Gönder</div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Alıcı Firma</label>
                  <select className="sd-sel" value={destekFirmaId} onChange={e => { setDestekFirmaId(e.target.value); fetchDestekLogs(e.target.value) }} style={selS}>
                    <option value="">— Firma seçin —</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Mesaj</label>
                  <textarea value={destekMsg} onChange={e => setDestekMsg(e.target.value)} placeholder="Mesajınızı yazın..." rows={4} className="sd-inp" style={{ ...inpS, resize: 'vertical' }} />
                </div>
                {destekSent && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '13px', color: '#4ade80' }}>✓ Bildirim gönderildi.</div>}
                <button onClick={handleDestekSend} disabled={sendingDestek || !destekFirmaId || !destekMsg.trim()} className="sd-btn-primary" style={{ width: '100%', padding: '10px' }}>
                  {sendingDestek ? 'Gönderiliyor...' : 'Gönder'}
                </button>
                <div style={{ marginTop: '8px', fontSize: '11px', color: S.faint, textAlign: 'center' }}>API entegrasyonu gereklidir.</div>
              </div>
            </div>
          )}

          {/* ── FİRMALAR ── */}
          {activeTab === 'firmalar' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '1.25rem' }}>
                <button onClick={() => router.push('/superadmin/firma')} className="sd-btn-ghost">Firma Yönetimi →</button>
                <button onClick={() => router.push('/superadmin/firma/yeni')} className="sd-btn-primary">+ Yeni Firma</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {companies.map(c => {
                  const limit = PLAN_LIMITS[c.plan] || 0
                  const used = monthlyCounts[c.id] || 0
                  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                  return (
                    <div key={c.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '1.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: S.muted, marginTop: '2px' }}>{c.city || c.email}</div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px', background: c.plan === 'pro' ? '#312e81' : '#273548', color: c.plan === 'pro' ? '#a5b4fc' : S.muted, textTransform: 'uppercase' }}>
                          {c.plan || 'basic'}
                        </span>
                      </div>
                      {limit > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: S.muted, marginBottom: '4px' }}>
                            <span>Bu Ayki Dosya</span>
                            <span style={{ fontWeight: '600', color: pct >= 90 ? '#f87171' : 'white' }}>{used}/{limit}</span>
                          </div>
                          <div style={{ height: '4px', background: '#273548', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#ef4444' : S.accent, borderRadius: '99px' }} />
                          </div>
                        </div>
                      )}
                      {[['Kayıt', new Date(c.created_at).toLocaleDateString('tr-TR')], ['Aylık Ücret', `₺${(PLAN_PRICES[c.plan] || 0).toLocaleString('tr-TR')}`]].map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${S.border}`, fontSize: '12px' }}>
                          <span style={{ color: S.muted }}>{label}</span>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '1.25rem' }}>
                <button onClick={() => setShowNewCombo(true)} className="sd-btn-ghost">+ Yeni Ülke/Vize Tipi</button>
                <button onClick={() => { setEditEvrak(null); setEvrakForm({ country: selectedCountry, visa_type: selectedVisa, doc_name: '', delivery_type: 'digital', order_num: filteredDocs.length + 1 }); setShowEvrakModal(true) }} className="sd-btn-primary">+ Evrak Ekle</button>
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { label: 'Ülke', value: selectedCountry, options: countries, onChange: (v: string) => { const f = visaOptions.find(o => o.country === v)?.visa_type || ''; setSelectedCountry(v); setSelectedVisa(f) } },
                  { label: 'Vize Tipi', value: selectedVisa, options: visaTypesForCountry, onChange: setSelectedVisa },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: S.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{f.label}</label>
                    <select className="sd-sel" value={f.value} onChange={e => f.onChange(e.target.value)} style={{ ...selS, width: 'auto', padding: '7px 10px' }}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <span style={{ fontSize: '12px', color: S.muted }}>{filteredDocs.length} evrak</span>
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['#', 'Evrak Adı', 'Teslimat Tipi', ''].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredDocs.length === 0 && <tr><td colSpan={4} style={{ ...tdS, textAlign: 'center', color: S.muted, padding: '2rem' }}>Bu kombinasyon için evrak tanımlanmamış.</td></tr>}
                    {filteredDocs.map((d, idx) => {
                      const dtColors = d.delivery_type === 'digital' ? { bg: '#1e3a5f', color: '#7dd3fc' } : d.delivery_type === 'physical' ? { bg: '#312e1a', color: '#fcd34d' } : { bg: '#1a2e1e', color: '#86efac' }
                      return (
                        <tr key={d.id} className="sd-row">
                          <td style={{ ...tdS, color: S.muted, width: '40px' }}>{idx + 1}</td>
                          <td style={{ ...tdS, fontWeight: '500' }}>{d.doc_name}</td>
                          <td style={tdS}>
                            <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: dtColors.bg, color: dtColors.color }}>
                              {d.delivery_type === 'digital' ? 'Dijital' : d.delivery_type === 'physical' ? 'Elden' : 'Firma'}
                            </span>
                          </td>
                          <td style={tdS}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => { setEditEvrak(d); setEvrakForm({ country: d.country, visa_type: d.visa_type, doc_name: d.doc_name, delivery_type: d.delivery_type, order_num: d.order_num }); setShowEvrakModal(true) }} className="sd-btn-ghost" style={{ padding: '4px 10px', fontSize: '11px' }}>Düzenle</button>
                              <button onClick={() => deleteEvrak(d.id)} style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>Sil</button>
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
        {showEvrakModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#1e293b', border: `1px solid ${S.border}`, borderRadius: '14px', padding: '1.75rem', width: '400px', maxWidth: '95vw', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0 0 1.25rem' }}>{editEvrak ? 'Evrak Düzenle' : 'Yeni Evrak Ekle'}</h3>
              {([
                { label: 'Ülke', key: 'country', readOnly: !!editEvrak },
                { label: 'Vize Tipi', key: 'visa_type', readOnly: !!editEvrak },
                { label: 'Evrak Adı', key: 'doc_name', readOnly: false, placeholder: 'Pasaport fotokopisi' },
              ] as { label: string; key: string; readOnly: boolean; placeholder?: string }[]).map(f => (
                <div key={f.key} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{f.label}</label>
                  <input value={(evrakForm as any)[f.key]} readOnly={f.readOnly} placeholder={f.placeholder} onChange={e => setEvrakForm({ ...evrakForm, [f.key]: e.target.value })} className="sd-inp" style={{ ...inpS, background: f.readOnly ? '#0f172a' : '#0f172a' }} />
                </div>
              ))}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Teslimat Tipi</label>
                <select className="sd-sel" value={evrakForm.delivery_type} onChange={e => setEvrakForm({ ...evrakForm, delivery_type: e.target.value })} style={selS}>
                  <option value="digital">Dijital (portal üzerinden)</option>
                  <option value="physical">Elden (randevu günü teslim)</option>
                  <option value="company">Firma (danışmanlık firması ekler)</option>
                </select>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Sıra No</label>
                <input type="number" value={evrakForm.order_num} onChange={e => setEvrakForm({ ...evrakForm, order_num: parseInt(e.target.value) })} className="sd-inp" style={inpS} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setShowEvrakModal(false); setEditEvrak(null) }} className="sd-btn-ghost" style={{ flex: 1 }}>İptal</button>
                <button onClick={saveEvrak} disabled={savingEvrak} className="sd-btn-primary" style={{ flex: 2 }}>
                  {savingEvrak ? 'Kaydediliyor...' : editEvrak ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Yeni Combo Modal ── */}
        {showNewCombo && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#1e293b', border: `1px solid ${S.border}`, borderRadius: '14px', padding: '1.75rem', width: '380px', maxWidth: '95vw', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0 0 1.25rem' }}>Yeni Ülke / Vize Tipi</h3>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Ülke</label>
                <input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="Avustralya" className="sd-inp" style={inpS} />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Vize Tipi</label>
                <input value={newVisa} onChange={e => setNewVisa(e.target.value)} placeholder="Turist, İş, Öğrenci..." className="sd-inp" style={inpS} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowNewCombo(false)} className="sd-btn-ghost" style={{ flex: 1 }}>İptal</button>
                <button onClick={addNewCombo} className="sd-btn-primary" style={{ flex: 2 }}>Oluştur ve Evrak Ekle</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
