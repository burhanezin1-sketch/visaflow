'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PLAN_LIMITS: Record<string, number> = { basic: 30, pro: 100 }
const PLAN_PRICES: Record<string, number> = { basic: 2999, pro: 5499 }

const PLAN_OPTIONS = [
  { key: 'basic', label: 'Basic', price: '2.999 TL/ay', features: ['1 Admin + 2 Danışman', '30 Dosya/Ay', 'AI Kısıtlı'] },
  { key: 'pro', label: 'Pro', price: '5.499 TL/ay', features: ['1 Admin + 4 Danışman', '100 Dosya/Ay', 'Tüm AI Açık'] },
]

const PAYMENT_OPTS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  paid:    { bg: 'rgba(0,212,100,0.12)', color: '#00D464', border: 'rgba(0,212,100,0.25)', label: 'Ödendi' },
  pending: { bg: 'rgba(255,168,0,0.12)', color: '#FFB800', border: 'rgba(255,168,0,0.25)', label: 'Bekliyor' },
  overdue: { bg: 'rgba(255,80,80,0.12)', color: '#FF6B6B', border: 'rgba(255,80,80,0.25)', label: 'Gecikmiş' },
}

// ── styles ──────────────────────────────────────────────
const C = {
  bg: '#050810',
  header: '#0a0f1e',
  accent: '#6C47FF',
  cyan: '#00D4FF',
  card: 'rgba(108,71,255,0.05)',
  cardBorder: 'rgba(108,71,255,0.15)',
  text: 'white',
  muted: 'rgba(255,255,255,0.45)',
  faint: 'rgba(255,255,255,0.12)',
}

const thStyle: React.CSSProperties = {
  fontSize: '10px',
  color: C.muted,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  padding: '12px 1.25rem',
  textAlign: 'left',
  borderBottom: 'rgba(108,71,255,0.12)',
  background: 'rgba(108,71,255,0.1)',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 1.25rem',
  fontSize: '13px',
  borderBottom: '1px solid rgba(108,71,255,0.08)',
  color: C.text,
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(5,8,16,0.88)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 500,
  backdropFilter: 'blur(8px)',
}

const modalBoxStyle: React.CSSProperties = {
  background: '#0d1428',
  border: '1px solid rgba(108,71,255,0.3)',
  borderRadius: '18px',
  padding: '2rem',
  maxWidth: '95vw',
  boxShadow: '0 0 80px rgba(108,71,255,0.2)',
}

const saInpStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  background: 'rgba(108,71,255,0.08)',
  border: '1px solid rgba(108,71,255,0.25)',
  borderRadius: '8px',
  fontSize: '13px',
  color: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

// ── component ────────────────────────────────────────────
export default function FirmaListPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [userCounts, setUserCounts] = useState<Record<string, number>>({})
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const [planModal, setPlanModal] = useState<{ id: string; name: string; current: string } | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [savingPlan, setSavingPlan] = useState(false)
  const [planSuccess, setPlanSuccess] = useState(false)

  const [editNoteId, setEditNoteId] = useState<string | null>(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const [editTrialId, setEditTrialId] = useState<string | null>(null)
  const [editTrialDate, setEditTrialDate] = useState('')

  const [deleting, setDeleting] = useState<string | null>(null)

  const router = useRouter()
  const now = new Date()

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/superadmin/login'); return }
    const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
    if (!sa) { router.push('/superadmin/login'); return }
    await fetchAll()
  }

  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    const list = data || []
    setCompanies(list)

    const { data: users } = await supabase.from('users').select('company_id')
    const counts: Record<string, number> = {}
    users?.forEach((u: any) => { counts[u.company_id] = (counts[u.company_id] || 0) + 1 })
    setUserCounts(counts)

    const monthlyData: Record<string, number> = {}
    await Promise.all(list.map(async (c: any) => {
      const { data: cnt } = await supabase.rpc('get_monthly_application_count', { p_company_id: c.id })
      monthlyData[c.id] = cnt || 0
    }))
    setMonthlyCounts(monthlyData)
    setLoading(false)
  }

  function openPlanModal(id: string, name: string, current: string) {
    setSelectedPlan(current || 'basic')
    setPlanSuccess(false)
    setPlanModal({ id, name, current: current || 'basic' })
  }

  async function confirmPlanChange() {
    if (!planModal || selectedPlan === planModal.current) { setPlanModal(null); return }
    setSavingPlan(true)
    const { error } = await supabase.from('companies').update({ plan: selectedPlan }).eq('id', planModal.id)
    setSavingPlan(false)
    if (!error) {
      setPlanSuccess(true)
      setCompanies(prev => prev.map(c => c.id === planModal.id ? { ...c, plan: selectedPlan } : c))
      setTimeout(() => setPlanModal(null), 800)
    }
  }

  async function savePaymentStatus(companyId: string, status: string) {
    await supabase.from('companies').update({ payment_status: status }).eq('id', companyId)
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, payment_status: status } : c))
  }

  async function saveNote() {
    if (!editNoteId) return
    setSavingNote(true)
    await supabase.from('companies').update({ notes: editNoteText || null }).eq('id', editNoteId)
    setCompanies(prev => prev.map(c => c.id === editNoteId ? { ...c, notes: editNoteText || null } : c))
    setSavingNote(false)
    setEditNoteId(null)
  }

  async function saveTrial() {
    if (!editTrialId) return
    const val = editTrialDate ? new Date(editTrialDate).toISOString() : null
    await supabase.from('companies').update({ trial_ends_at: val }).eq('id', editTrialId)
    setCompanies(prev => prev.map(c => c.id === editTrialId ? { ...c, trial_ends_at: val } : c))
    setEditTrialId(null)
  }

  async function deleteFirma(companyId: string, name: string) {
    if (!confirm(`"${name}" firmasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`)) return
    setDeleting(companyId)
    await supabase.from('companies').delete().eq('id', companyId)
    setCompanies(prev => prev.filter(c => c.id !== companyId))
    setDeleting(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '2px solid rgba(108,71,255,0.25)', borderTop: `2px solid ${C.accent}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ color: C.muted, fontSize: '13px' }}>Yükleniyor...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        .sa-inp::placeholder { color: rgba(255,255,255,0.25); }
        .sa-inp:focus { border-color: rgba(108,71,255,0.55) !important; outline: none; }
        .sa-sel option { background: #0d1428; color: white; }
        .firma-row:hover { background: rgba(108,71,255,0.07) !important; }
      `}</style>
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui' }}>

        {/* ── Header ── */}
        <div style={{ background: C.header, borderBottom: `1px solid rgba(108,71,255,0.2)`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => router.push('/superadmin/dashboard')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '13px', padding: 0, fontFamily: 'inherit' }}>← Dashboard</button>
            <span style={{ color: 'rgba(108,71,255,0.4)', fontSize: '16px' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Firma Yönetimi</span>
              <span style={{ background: 'rgba(108,71,255,0.18)', color: '#a78bfa', fontSize: '11px', fontWeight: '600', padding: '2px 9px', borderRadius: '20px', border: '1px solid rgba(108,71,255,0.25)' }}>{companies.length} firma</span>
            </div>
          </div>
          <button onClick={() => router.push('/superadmin/firma/yeni')} style={{ padding: '8px 18px', fontSize: '12px', fontWeight: '600', background: 'linear-gradient(135deg, #6C47FF 0%, #00D4FF 100%)', color: 'white', border: 'none', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 24px rgba(108,71,255,0.45)', letterSpacing: '0.5px' }}>
            + Yeni Firma
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Firma', 'Plan', 'Ödeme', 'Kullanıcı', 'Aylık Kullanım', 'Kayıt Tarihi', 'İşlemler'].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: C.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '12px 1.25rem', textAlign: 'left', borderBottom: '1px solid rgba(108,71,255,0.12)', background: 'rgba(108,71,255,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: C.muted }}>Henüz kayıtlı firma yok.</td></tr>
                )}
                {companies.map(c => {
                  const limit = PLAN_LIMITS[c.plan] || 0
                  const used = monthlyCounts[c.id] || 0
                  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                  const trialActive = c.trial_ends_at && new Date(c.trial_ends_at) > now
                  const trialExpired = c.trial_ends_at && new Date(c.trial_ends_at) <= now
                  const payOpt = PAYMENT_OPTS[c.payment_status || 'pending'] || PAYMENT_OPTS.pending
                  return (
                    <tr key={c.id} className="firma-row" style={{ borderBottom: '1px solid rgba(108,71,255,0.07)' }}>
                      {/* Firma */}
                      <td style={{ ...tdStyle, maxWidth: '220px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{c.email}</div>
                        {c.city && <div style={{ fontSize: '11px', color: C.faint, marginTop: '1px' }}>{c.city}</div>}
                        {c.notes && (
                          <div title={c.notes} style={{ fontSize: '11px', color: '#a78bfa', marginTop: '4px', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            📝 {c.notes}
                          </div>
                        )}
                      </td>

                      {/* Plan */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: c.plan === 'pro' ? 'rgba(108,71,255,0.25)' : 'rgba(255,255,255,0.08)', color: c.plan === 'pro' ? '#a78bfa' : 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>
                          {c.plan || 'basic'}
                        </span>
                        {trialActive && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', background: 'rgba(255,168,0,0.12)', color: '#FFB800' }}>
                              Deneme: {new Date(c.trial_ends_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        )}
                        {trialExpired && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', background: 'rgba(255,80,80,0.1)', color: '#FF6B6B' }}>
                              Deneme Sona Erdi
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Ödeme */}
                      <td style={tdStyle}>
                        <select
                          className="sa-sel"
                          value={c.payment_status || 'pending'}
                          onChange={e => savePaymentStatus(c.id, e.target.value)}
                          style={{ padding: '5px 9px', fontSize: '11px', fontWeight: '600', background: payOpt.bg, color: payOpt.color, border: `1px solid ${payOpt.border}`, borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
                        >
                          <option value="paid">Ödendi</option>
                          <option value="pending">Bekliyor</option>
                          <option value="overdue">Gecikmiş</option>
                        </select>
                      </td>

                      {/* Kullanıcı */}
                      <td style={{ ...tdStyle, fontWeight: '500' }}>{userCounts[c.id] || 0}</td>

                      {/* Aylık Kullanım */}
                      <td style={tdStyle}>
                        {limit > 0 ? (
                          <div style={{ minWidth: '120px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                              <span style={{ color: C.muted }}>{used}/{limit}</span>
                              <span style={{ fontWeight: '600', color: pct >= 90 ? '#FF6B6B' : C.muted }}>{Math.round(pct)}%</span>
                            </div>
                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#FF6B6B' : `linear-gradient(90deg, ${C.accent}, ${C.cyan})`, borderRadius: '99px' }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: C.faint }}>—</span>
                        )}
                      </td>

                      {/* Kayıt Tarihi */}
                      <td style={{ ...tdStyle, color: C.muted }}>{new Date(c.created_at).toLocaleDateString('tr-TR')}</td>

                      {/* İşlemler */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <button onClick={() => openPlanModal(c.id, c.name, c.plan)} style={{ padding: '5px 9px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', background: 'rgba(108,71,255,0.15)', color: '#a78bfa', border: '1px solid rgba(108,71,255,0.25)', fontFamily: 'inherit' }}>
                            Plan
                          </button>
                          <button onClick={() => { setEditNoteId(c.id); setEditNoteText(c.notes || '') }} style={{ padding: '5px 9px', fontSize: '11px', cursor: 'pointer', borderRadius: '6px', background: c.notes ? 'rgba(0,212,100,0.1)' : 'rgba(255,255,255,0.05)', color: c.notes ? '#00D464' : C.muted, border: c.notes ? '1px solid rgba(0,212,100,0.2)' : '1px solid rgba(255,255,255,0.1)', fontFamily: 'inherit' }}>
                            Not
                          </button>
                          <button onClick={() => { setEditTrialId(c.id); setEditTrialDate(c.trial_ends_at ? c.trial_ends_at.split('T')[0] : '') }} style={{ padding: '5px 9px', fontSize: '11px', cursor: 'pointer', borderRadius: '6px', background: trialActive ? 'rgba(255,168,0,0.1)' : 'rgba(255,255,255,0.05)', color: trialActive ? '#FFB800' : C.muted, border: trialActive ? '1px solid rgba(255,168,0,0.2)' : '1px solid rgba(255,255,255,0.1)', fontFamily: 'inherit' }}>
                            Deneme
                          </button>
                          <button onClick={() => deleteFirma(c.id, c.name)} disabled={deleting === c.id} style={{ padding: '5px 9px', fontSize: '11px', background: 'rgba(255,80,80,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', opacity: deleting === c.id ? 0.6 : 1 }}>
                            {deleting === c.id ? '...' : 'Sil'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Plan Modal ── */}
        {planModal && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalBoxStyle, width: '440px' }}>
              {planSuccess ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>✨</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#00D464' }}>Plan Güncellendi</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'white', margin: 0 }}>Plan Değiştir</h3>
                    <p style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>{planModal.name}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                    {PLAN_OPTIONS.map(opt => {
                      const isSelected = selectedPlan === opt.key
                      const isPro = opt.key === 'pro'
                      const isCurrent = planModal.current === opt.key
                      return (
                        <button key={opt.key} onClick={() => setSelectedPlan(opt.key)} style={{ padding: '14px 16px', borderRadius: '12px', border: isSelected ? `2px solid ${isPro ? C.accent : 'rgba(255,255,255,0.3)'}` : '2px solid rgba(255,255,255,0.08)', background: isSelected ? (isPro ? 'rgba(108,71,255,0.15)' : 'rgba(255,255,255,0.06)') : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', fontFamily: 'system-ui' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: isSelected ? (isPro ? '#a78bfa' : 'white') : C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{opt.label}</span>
                              {isCurrent && <span style={{ fontSize: '10px', fontWeight: '600', padding: '1px 7px', borderRadius: '20px', background: 'rgba(255,255,255,0.08)', color: C.muted }}>Mevcut</span>}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? (isPro ? '#a78bfa' : 'rgba(255,255,255,0.7)') : C.muted }}>{opt.price}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {opt.features.map(f => <span key={f} style={{ fontSize: '11px', color: isSelected ? (isPro ? '#a78bfa' : 'rgba(255,255,255,0.6)') : C.muted }}>• {f}</span>)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPlanModal(null)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.05)', color: C.muted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
                    <button onClick={confirmPlanChange} disabled={savingPlan || selectedPlan === planModal.current} style={{ flex: 2, padding: '11px', background: selectedPlan === planModal.current ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: selectedPlan === planModal.current ? C.muted : 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: selectedPlan === planModal.current ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: savingPlan ? 0.7 : 1, boxShadow: selectedPlan === planModal.current ? 'none' : '0 0 20px rgba(108,71,255,0.3)' }}>
                      {savingPlan ? 'Güncelleniyor...' : selectedPlan === planModal.current ? 'Değişiklik Yok' : `${selectedPlan.toUpperCase()} Planına Geç`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Not Düzenle Modal ── */}
        {editNoteId !== null && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalBoxStyle, width: '440px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: '0 0 1.25rem' }}>
                Firma Notu — {companies.find(c => c.id === editNoteId)?.name}
              </h3>
              <textarea
                value={editNoteText}
                onChange={e => setEditNoteText(e.target.value)}
                placeholder="Ödeme durumu, müşteri talebi, özel koşullar..."
                rows={4}
                className="sa-inp"
                style={{ ...saInpStyle, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => setEditNoteId(null)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: C.muted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
                <button onClick={saveNote} disabled={savingNote} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', opacity: savingNote ? 0.7 : 1, boxShadow: '0 0 20px rgba(108,71,255,0.3)' }}>
                  {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Deneme Süresi Modal ── */}
        {editTrialId !== null && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalBoxStyle, width: '380px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: '0 0 1.25rem' }}>
                Deneme Süresi — {companies.find(c => c.id === editTrialId)?.name}
              </h3>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: C.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Deneme Bitiş Tarihi</label>
                <input
                  type="date"
                  value={editTrialDate}
                  onChange={e => setEditTrialDate(e.target.value)}
                  className="sa-inp"
                  style={{ ...saInpStyle }}
                />
                <div style={{ fontSize: '11px', color: C.muted, marginTop: '5px' }}>Boş bırakırsanız deneme süresi kaldırılır.</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditTrialId(null)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', color: C.muted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
                <button onClick={saveTrial} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #6C47FF, #00D4FF)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(108,71,255,0.3)' }}>Kaydet</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
