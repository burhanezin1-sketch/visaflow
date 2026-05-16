'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PLAN_LIMITS: Record<string, number> = { basic: 30, pro: 100 }
const PLAN_PRICES: Record<string, number> = { basic: 2999, pro: 5499 }

const PLAN_OPTIONS = [
  {
    key: 'basic',
    label: 'Basic',
    price: '2.999 TL/ay',
    features: ['1 Admin + 2 Danışman', '30 Dosya/Ay', 'AI Kısıtlı'],
    color: '#5a6a7a',
    bg: '#f0f0f4',
    border: '#d8dce4',
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '5.499 TL/ay',
    features: ['1 Admin + 4 Danışman', '100 Dosya/Ay', 'Tüm AI Açık'],
    color: '#1a5fa5',
    bg: '#eef4fb',
    border: '#b8d4f0',
  },
]

const PAYMENT_OPTS: Record<string, { bg: string; color: string; label: string }> = {
  paid:    { bg: '#edfaf3', color: '#1a7a45', label: 'Ödendi' },
  pending: { bg: '#fff8ec', color: '#92600a', label: 'Bekliyor' },
  overdue: { bg: '#fef0ee', color: '#c0392b', label: 'Gecikmiş' },
}

export default function FirmaListPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [userCounts, setUserCounts] = useState<Record<string, number>>({})
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Plan modal
  const [planModal, setPlanModal] = useState<{ id: string; name: string; current: string } | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [savingPlan, setSavingPlan] = useState(false)
  const [planSuccess, setPlanSuccess] = useState(false)

  // Notes modal
  const [editNoteId, setEditNoteId] = useState<string | null>(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  // Trial modal
  const [editTrialId, setEditTrialId] = useState<string | null>(null)
  const [editTrialDate, setEditTrialDate] = useState('')

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null)

  const router = useRouter()
  const now = new Date()

  useEffect(() => {
    checkAuth()
  }, [])

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ background: '#1c1c24', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.push('/superadmin/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px', padding: 0 }}>← Dashboard</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>Firma Yönetimi</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' }}>{companies.length} firma</span>
        </div>
        <button onClick={() => router.push('/superadmin/firma/yeni')} style={{ padding: '7px 16px', fontSize: '12px', background: '#378ADD', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
          + Yeni Firma
        </button>
      </div>

      <div style={{ padding: '2rem' }}>
        <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Firma', 'Plan', 'Ödeme', 'Kullanıcı', 'Aylık Kullanım', 'Kayıt Tarihi', 'İşlemler'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '12px 1.25rem', textAlign: 'left', borderBottom: '1px solid #e2e2e8', background: '#f5f5f7' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>Henüz kayıtlı firma yok.</td></tr>
              )}
              {companies.map(c => {
                const limit = PLAN_LIMITS[c.plan] || 0
                const used = monthlyCounts[c.id] || 0
                const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                const trialActive = c.trial_ends_at && new Date(c.trial_ends_at) > now
                const trialExpired = c.trial_ends_at && new Date(c.trial_ends_at) <= now
                const payOpt = PAYMENT_OPTS[c.payment_status || 'pending'] || PAYMENT_OPTS.pending
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f4' }}>
                    {/* Firma */}
                    <td style={{ padding: '14px 1.25rem', maxWidth: '220px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c24' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{c.email}</div>
                      {c.city && <div style={{ fontSize: '11px', color: '#c0c8d4', marginTop: '1px' }}>{c.city}</div>}
                      {c.notes && (
                        <div title={c.notes} style={{ fontSize: '11px', color: '#5a6a7a', marginTop: '4px', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📝 {c.notes}
                        </div>
                      )}
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '14px 1.25rem' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: c.plan === 'pro' ? '#eef4fb' : '#f0f0f4', color: c.plan === 'pro' ? '#1a5fa5' : '#5a6a7a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>
                        {c.plan || 'basic'}
                      </span>
                      {trialActive && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '20px', background: '#fff8ec', color: '#92600a' }}>
                            Deneme: {new Date(c.trial_ends_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                      {trialExpired && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '20px', background: '#fef0ee', color: '#c0392b' }}>
                            Deneme Sona Erdi
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Ödeme */}
                    <td style={{ padding: '14px 1.25rem' }}>
                      <select
                        value={c.payment_status || 'pending'}
                        onChange={e => savePaymentStatus(c.id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '600', background: payOpt.bg, color: payOpt.color, border: '1px solid transparent', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
                      >
                        <option value="paid">Ödendi</option>
                        <option value="pending">Bekliyor</option>
                        <option value="overdue">Gecikmiş</option>
                      </select>
                    </td>

                    {/* Kullanıcı */}
                    <td style={{ padding: '14px 1.25rem', fontSize: '13px', fontWeight: '500', color: '#1c1c24' }}>
                      {userCounts[c.id] || 0}
                    </td>

                    {/* Aylık Kullanım */}
                    <td style={{ padding: '14px 1.25rem' }}>
                      {limit > 0 ? (
                        <div style={{ minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                            <span style={{ color: '#5a6a7a' }}>{used}/{limit}</span>
                            <span style={{ fontWeight: '600', color: pct >= 90 ? '#c0392b' : '#9aaabb' }}>{Math.round(pct)}%</span>
                          </div>
                          <div style={{ height: '5px', background: '#f0f0f4', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#c0392b' : '#378ADD', borderRadius: '99px' }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#c0c8d4' }}>—</span>
                      )}
                    </td>

                    {/* Kayıt Tarihi */}
                    <td style={{ padding: '14px 1.25rem', fontSize: '12px', color: '#5a6a7a' }}>
                      {new Date(c.created_at).toLocaleDateString('tr-TR')}
                    </td>

                    {/* İşlemler */}
                    <td style={{ padding: '14px 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button onClick={() => openPlanModal(c.id, c.name, c.plan)} style={{ padding: '5px 9px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', background: '#f5f5f7', color: '#1c1c24', border: '1px solid #e2e2e8' }}>
                          Plan
                        </button>
                        <button onClick={() => { setEditNoteId(c.id); setEditNoteText(c.notes || '') }} style={{ padding: '5px 9px', fontSize: '11px', cursor: 'pointer', borderRadius: '6px', background: c.notes ? '#edfaf3' : '#f0f0f4', color: c.notes ? '#1a7a45' : '#5a6a7a', border: '1px solid #e2e2e8' }}>
                          Not
                        </button>
                        <button onClick={() => { setEditTrialId(c.id); setEditTrialDate(c.trial_ends_at ? c.trial_ends_at.split('T')[0] : '') }} style={{ padding: '5px 9px', fontSize: '11px', cursor: 'pointer', borderRadius: '6px', background: trialActive ? '#fff8ec' : '#f0f0f4', color: trialActive ? '#92600a' : '#5a6a7a', border: '1px solid #e2e2e8' }}>
                          Deneme
                        </button>
                        <button onClick={() => deleteFirma(c.id, c.name)} disabled={deleting === c.id} style={{ padding: '5px 9px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer', opacity: deleting === c.id ? 0.6 : 1 }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '18px', padding: '2rem', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(13,31,53,0.18)' }}>
            {planSuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a7a45' }}>Plan Güncellendi</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#1c1c24', margin: 0 }}>Plan Değiştir</h3>
                  <p style={{ fontSize: '13px', color: '#5a6a7a', marginTop: '4px' }}>{planModal.name}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  {PLAN_OPTIONS.map(opt => {
                    const isSelected = selectedPlan === opt.key
                    const isCurrent = planModal.current === opt.key
                    return (
                      <button key={opt.key} onClick={() => setSelectedPlan(opt.key)} style={{ padding: '14px 16px', borderRadius: '12px', border: isSelected ? `2px solid ${opt.border === '#d8dce4' ? '#378ADD' : opt.border}` : '2px solid #e2e2e8', background: isSelected ? opt.bg : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease', fontFamily: 'system-ui' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: isSelected ? opt.color : '#1c1c24', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{opt.label}</span>
                            {isCurrent && <span style={{ fontSize: '10px', fontWeight: '600', padding: '1px 7px', borderRadius: '20px', background: '#f0f0f4', color: '#9aaabb' }}>Mevcut</span>}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? opt.color : '#9aaabb' }}>{opt.price}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {opt.features.map(f => <span key={f} style={{ fontSize: '11px', color: isSelected ? opt.color : '#9aaabb' }}>• {f}</span>)}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setPlanModal(null)} style={{ flex: 1, padding: '11px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
                  <button onClick={confirmPlanChange} disabled={savingPlan || selectedPlan === planModal.current} style={{ flex: 2, padding: '11px', background: selectedPlan === planModal.current ? '#e2e2e8' : '#1c1c24', color: selectedPlan === planModal.current ? '#9aaabb' : 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: selectedPlan === planModal.current ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: savingPlan ? 0.7 : 1 }}>
                    {savingPlan ? 'Güncelleniyor...' : selectedPlan === planModal.current ? 'Değişiklik Yok' : `${selectedPlan.toUpperCase()} Planına Geç`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Not Düzenle Modal */}
      {editNoteId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(13,31,53,0.18)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1c1c24', margin: '0 0 1.25rem' }}>
              Firma Notu — {companies.find(c => c.id === editNoteId)?.name}
            </h3>
            <textarea
              value={editNoteText}
              onChange={e => setEditNoteText(e.target.value)}
              placeholder="Ödeme durumu, müşteri talebi, özel koşullar..."
              rows={4}
              style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setEditNoteId(null)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={saveNote} disabled={savingNote} style={{ flex: 2, padding: '10px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', opacity: savingNote ? 0.7 : 1 }}>
                {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deneme Süresi Modal */}
      {editTrialId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '360px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(13,31,53,0.18)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1c1c24', margin: '0 0 1.25rem' }}>
              Deneme Süresi — {companies.find(c => c.id === editTrialId)?.name}
            </h3>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Deneme Bitiş Tarihi</label>
              <input
                type="date"
                value={editTrialDate}
                onChange={e => setEditTrialDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '5px' }}>Boş bırakırsanız deneme süresi kaldırılır.</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditTrialId(null)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={saveTrial} style={{ flex: 2, padding: '10px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
