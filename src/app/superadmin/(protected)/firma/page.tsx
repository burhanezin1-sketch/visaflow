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

const PAYMENT_OPTS: Record<string, { bg: string; color: string; label: string }> = {
  paid:    { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', label: 'Ödendi' },
  pending: { bg: 'rgba(234,179,8,0.12)', color: '#fbbf24', label: 'Bekliyor' },
  overdue: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: 'Gecikmiş' },
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
  padding: '13px 1rem', fontSize: '13px', borderBottom: `1px solid #1e3a5f30`, color: S.text,
}

const inpS: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: '#0f172a', border: `1px solid ${S.border}`,
  borderRadius: '8px', fontSize: '13px', color: 'white', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: S.bg, fontFamily: 'system-ui' }}>
      <div style={{ color: S.muted, fontSize: '13px' }}>Yükleniyor...</div>
    </div>
  )

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 500, backdropFilter: 'blur(4px)',
  }

  const modalBox: React.CSSProperties = {
    background: '#1e293b', border: `1px solid ${S.border}`, borderRadius: '14px',
    padding: '1.75rem', maxWidth: '95vw', boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  }

  return (
    <>
      <style>{`
        .fp-inp::placeholder { color: #475569; }
        .fp-inp:focus { border-color: #6366f1 !important; outline: none; }
        .fp-sel option { background: #1e293b; color: white; }
        .fp-row:hover td { background: #273548; }
        .fp-btn-ghost { background: #1e293b; color: #94a3b8; border: 1px solid #334155; border-radius: 7px; padding: 5px 10px; font-size: 11px; cursor: pointer; font-family: inherit; }
        .fp-btn-ghost:hover { background: #273548; }
        .fp-btn-primary { background: #6366f1; color: white; border: none; border-radius: 7px; padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .fp-btn-primary:hover { background: #4f46e5; }
        .fp-btn-primary:disabled { background: #334155; color: #475569; cursor: not-allowed; }
        .fp-btn-danger { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 5px 10px; font-size: 11px; cursor: pointer; font-family: inherit; }
      `}</style>
      <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'system-ui' }}>

        {/* Header */}
        <div style={{ background: S.sidebar, borderBottom: `1px solid ${S.border}`, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => router.push('/superadmin/dashboard')} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: '13px', padding: 0, fontFamily: 'inherit' }}>← Dashboard</button>
            <span style={{ color: S.border }}>|</span>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Firma Yönetimi</span>
            <span style={{ background: '#273548', color: S.muted, fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px' }}>{companies.length}</span>
          </div>
          <button onClick={() => router.push('/superadmin/firma/yeni')} className="fp-btn-primary">+ Yeni Firma</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Firma', 'Plan', 'Ödeme', 'Kullanıcı', 'Aylık Kullanım', 'Kayıt', 'İşlemler'].map(h => (
                    <th key={h} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: S.muted }}>Henüz kayıtlı firma yok.</td></tr>
                )}
                {companies.map(c => {
                  const limit = PLAN_LIMITS[c.plan] || 0
                  const used = monthlyCounts[c.id] || 0
                  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                  const trialActive = c.trial_ends_at && new Date(c.trial_ends_at) > now
                  const trialExpired = c.trial_ends_at && new Date(c.trial_ends_at) <= now
                  const payOpt = PAYMENT_OPTS[c.payment_status || 'pending'] || PAYMENT_OPTS.pending
                  return (
                    <tr key={c.id} className="fp-row">
                      {/* Firma */}
                      <td style={{ ...tdS, maxWidth: '200px' }}>
                        <div style={{ fontWeight: '600', color: 'white' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: S.muted, marginTop: '2px' }}>{c.email}</div>
                        {c.city && <div style={{ fontSize: '11px', color: S.faint }}>{c.city}</div>}
                        {c.notes && (
                          <div title={c.notes} style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '3px', fontStyle: 'italic', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.notes}
                          </div>
                        )}
                      </td>

                      {/* Plan */}
                      <td style={tdS}>
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px', background: c.plan === 'pro' ? '#312e81' : '#273548', color: c.plan === 'pro' ? '#a5b4fc' : S.muted, textTransform: 'uppercase', display: 'inline-block' }}>
                          {c.plan || 'basic'}
                        </span>
                        {trialActive && <div style={{ marginTop: '3px' }}><span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(234,179,8,0.1)', color: '#fbbf24' }}>Deneme: {new Date(c.trial_ends_at).toLocaleDateString('tr-TR')}</span></div>}
                        {trialExpired && <div style={{ marginTop: '3px' }}><span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>Sona Erdi</span></div>}
                      </td>

                      {/* Ödeme */}
                      <td style={tdS}>
                        <select className="fp-sel" value={c.payment_status || 'pending'} onChange={e => savePaymentStatus(c.id, e.target.value)} style={{ padding: '3px 8px', fontSize: '11px', fontWeight: '600', background: payOpt.bg, color: payOpt.color, border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
                          <option value="paid">Ödendi</option>
                          <option value="pending">Bekliyor</option>
                          <option value="overdue">Gecikmiş</option>
                        </select>
                      </td>

                      {/* Kullanıcı */}
                      <td style={{ ...tdS, fontWeight: '500' }}>{userCounts[c.id] || 0}</td>

                      {/* Aylık Kullanım */}
                      <td style={tdS}>
                        {limit > 0 ? (
                          <div style={{ minWidth: '110px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                              <span style={{ color: S.muted }}>{used}/{limit}</span>
                              <span style={{ fontWeight: '600', color: pct >= 90 ? '#f87171' : S.muted }}>{Math.round(pct)}%</span>
                            </div>
                            <div style={{ height: '4px', background: '#273548', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#ef4444' : S.accent, borderRadius: '99px' }} />
                            </div>
                          </div>
                        ) : <span style={{ fontSize: '11px', color: S.faint }}>—</span>}
                      </td>

                      {/* Kayıt */}
                      <td style={{ ...tdS, color: S.muted }}>{new Date(c.created_at).toLocaleDateString('tr-TR')}</td>

                      {/* İşlemler */}
                      <td style={tdS}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button onClick={() => openPlanModal(c.id, c.name, c.plan)} className="fp-btn-ghost">Plan</button>
                          <button onClick={() => { setEditNoteId(c.id); setEditNoteText(c.notes || '') }} className="fp-btn-ghost" style={{ color: c.notes ? '#a5b4fc' : S.muted }}>Not</button>
                          <button onClick={() => { setEditTrialId(c.id); setEditTrialDate(c.trial_ends_at ? c.trial_ends_at.split('T')[0] : '') }} className="fp-btn-ghost" style={{ color: trialActive ? '#fbbf24' : S.muted }}>Deneme</button>
                          <button onClick={() => deleteFirma(c.id, c.name)} disabled={deleting === c.id} className="fp-btn-danger" style={{ opacity: deleting === c.id ? 0.5 : 1 }}>
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

        {/* Plan Modal */}
        {planModal && (
          <div style={modalOverlay}>
            <div style={{ ...modalBox, width: '420px' }}>
              {planSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#4ade80' }}>✓ Plan güncellendi</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: 0 }}>Plan Değiştir</h3>
                    <p style={{ fontSize: '13px', color: S.muted, marginTop: '3px' }}>{planModal.name}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
                    {PLAN_OPTIONS.map(opt => {
                      const isSelected = selectedPlan === opt.key
                      const isPro = opt.key === 'pro'
                      const isCurrent = planModal.current === opt.key
                      return (
                        <button key={opt.key} onClick={() => setSelectedPlan(opt.key)} style={{ padding: '12px 14px', borderRadius: '10px', border: isSelected ? `2px solid ${isPro ? S.accent : '#64748b'}` : `2px solid ${S.border}`, background: isSelected ? (isPro ? 'rgba(99,102,241,0.1)' : '#273548') : S.bg, cursor: 'pointer', textAlign: 'left', fontFamily: 'system-ui' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? (isPro ? '#a5b4fc' : 'white') : S.muted, textTransform: 'uppercase' }}>{opt.label}</span>
                              {isCurrent && <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: '#273548', color: S.faint }}>Mevcut</span>}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: isSelected ? (isPro ? '#a5b4fc' : 'white') : S.muted }}>{opt.price}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {opt.features.map(f => <span key={f} style={{ fontSize: '11px', color: isSelected ? (isPro ? '#a5b4fc' : S.muted) : S.faint }}>· {f}</span>)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setPlanModal(null)} className="fp-btn-ghost" style={{ flex: 1, padding: '9px' }}>İptal</button>
                    <button onClick={confirmPlanChange} disabled={savingPlan || selectedPlan === planModal.current} className="fp-btn-primary" style={{ flex: 2 }}>
                      {savingPlan ? 'Güncelleniyor...' : selectedPlan === planModal.current ? 'Değişiklik Yok' : `${selectedPlan.toUpperCase()} Planına Geç`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Not Modal */}
        {editNoteId !== null && (
          <div style={modalOverlay}>
            <div style={{ ...modalBox, width: '420px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0 0 1rem' }}>
                Not — {companies.find(c => c.id === editNoteId)?.name}
              </h3>
              <textarea value={editNoteText} onChange={e => setEditNoteText(e.target.value)} placeholder="Ödeme durumu, müşteri talebi, özel koşullar..." rows={4} className="fp-inp" style={{ ...inpS, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setEditNoteId(null)} className="fp-btn-ghost" style={{ flex: 1, padding: '9px' }}>İptal</button>
                <button onClick={saveNote} disabled={savingNote} className="fp-btn-primary" style={{ flex: 2 }}>
                  {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deneme Modal */}
        {editTrialId !== null && (
          <div style={modalOverlay}>
            <div style={{ ...modalBox, width: '360px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', margin: '0 0 1rem' }}>
                Deneme Süresi — {companies.find(c => c.id === editTrialId)?.name}
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Bitiş Tarihi</label>
                <input type="date" value={editTrialDate} onChange={e => setEditTrialDate(e.target.value)} className="fp-inp" style={inpS} />
                <div style={{ fontSize: '11px', color: S.faint, marginTop: '4px' }}>Boş bırakırsanız deneme süresi kaldırılır.</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditTrialId(null)} className="fp-btn-ghost" style={{ flex: 1, padding: '9px' }}>İptal</button>
                <button onClick={saveTrial} className="fp-btn-primary" style={{ flex: 2 }}>Kaydet</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
