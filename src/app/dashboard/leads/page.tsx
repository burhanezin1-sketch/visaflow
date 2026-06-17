'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTranslations, useLocale } from 'next-intl'
import { tField } from '@/lib/fieldMappings'

function formatPrice(price: number, currency: string = 'TRY') {
  const sym: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' }
  return currency === 'TRY'
    ? `${price.toLocaleString('tr-TR')}${sym.TRY}`
    : `${sym[currency] || currency}${price.toLocaleString('en-US')}`
}

const toTitleCase = (str: string) =>
  str.replace(/(?:^|\s)\S/g, c => c.toUpperCase())

export default function LeadsPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const t = useTranslations('leads')
  const tc = useTranslations('common')
  const ts = useTranslations('status')
  const tf = useTranslations('fields')
  const tp = useTranslations('placeholders')
  const tm = useTranslations('musteriler')
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [usersMap, setUsersMap] = useState<Record<string, string>>({})
  const [showDurumModal, setShowDurumModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [prices, setPrices] = useState<any[]>([])
  const [surcharges, setSurcharges] = useState<any[]>([])
  const [form, setForm] = useState({ country: '', visa_type: '', occupation: '', nationality: 'Türkiye Cumhuriyeti' })
  const [saving, setSaving] = useState(false)
  const isSavingRef = useRef(false)
  const [durumAksiyon, setDurumAksiyon] = useState<'musteri' | 'iptal' | 'sonra' | null>(null)
  const [musteriYapError, setMusteriYapError] = useState<string | null>(null)
  const [globalToast, setGlobalToast] = useState(false)
  const [noTemplateModal, setNoTemplateModal] = useState(false)
  const [savedClientId, setSavedClientId] = useState<string | null>(null)
  const [savedAppId, setSavedAppId] = useState<string | null>(null)
  const [similarTemplates, setSimilarTemplates] = useState<any[]>([])
  const [usingSimilar, setUsingSimilar] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) { setLoading(false); return }
    fetchData()
    fetchPrices()
    fetchCurrentUser()
    fetchUsers()
  }, [companyId, companyLoading])

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('users').select('id, full_name').eq('id', user.id).single()
    setCurrentUser(data)
  }

  async function fetchUsers() {
    const { data } = await supabase.from('users').select('id, full_name').eq('company_id', companyId)
    if (data) {
      const map: Record<string, string> = {}
      data.forEach((u: any) => { map[u.id] = u.full_name })
      setUsersMap(map)
    }
  }

  async function fetchData() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId)
      .not('status', 'in', '("converted","lost")')
      .order('created_at', { ascending: false })
    if (error) console.error('Leads fetch error:', error)
    setLeads(data || [])
    setLoading(false)
  }

  async function fetchPrices() {
    const { data } = await supabase.from('service_prices').select('*').eq('company_id', companyId)
    setPrices(data || [])
    const { data: sur } = await supabase.from('nationality_surcharges').select('*').eq('company_id', companyId)
    setSurcharges(sur || [])
  }

  async function sahiplen(lead: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('leads').update({
      claimed_by: user.id,
      claimed_at: new Date().toISOString(),
      status: 'claimed',
    }).eq('id', lead.id)
    if (!error) fetchData()
  }

  async function musteriYap() {
    if (!selectedLead || !companyId || isSavingRef.current) return
    isSavingRef.current = true
    setMusteriYapError(null)
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (selectedLead.phone) {
      const { data: existing } = await supabase
        .from('clients').select('id, full_name')
        .eq('company_id', companyId).eq('phone', selectedLead.phone).maybeSingle()
      if (existing) {
        setMusteriYapError(tm('addModal.alreadyRegistered', { name: existing.full_name }))
        setSaving(false); isSavingRef.current = false; return
      }
    }

    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({ company_id: companyId, danisan_id: user?.id, full_name: selectedLead.full_name || selectedLead.phone, phone: selectedLead.phone })
      .select().single()

    if (clientError || !newClient) {
      console.error('Client oluşturma hatası:', clientError)
      setSaving(false); isSavingRef.current = false; return
    }

    let { data: app } = await supabase
      .from('applications')
      .insert({ company_id: companyId, client_id: newClient.id, country: form.country, visa_type: form.visa_type, occupation: form.occupation || null, nationality: form.nationality || 'Türkiye Cumhuriyeti', status: 'missing' })
      .select().single()

    // Migration uygulanmamışsa nationality kolonu eksik — retry without it
    if (!app) {
      const { data: retried } = await supabase
        .from('applications')
        .insert({ company_id: companyId, client_id: newClient.id, country: form.country, visa_type: form.visa_type, occupation: form.occupation || null, status: 'missing' })
        .select().single()
      app = retried
    }

    const price = prices.find(p =>
      p.country.toLowerCase() === form.country.toLowerCase() &&
      p.visa_type.toLowerCase() === form.visa_type.toLowerCase()
    )
    const sur = surcharges.find(s => {
      if (s.nationality?.trim().toLowerCase() !== (form.nationality || '').trim().toLowerCase()) return false
      if (s.country && s.country.trim().toLowerCase() !== form.country.toLowerCase()) return false
      if (s.visa_type && s.visa_type.trim().toLowerCase() !== form.visa_type.toLowerCase()) return false
      return true
    })
    if (app && price) {
      const sameCurrency = !sur || sur.currency === price.currency
      const totalAmount = price.price + (sameCurrency && sur ? sur.surcharge_amount : 0)
      await supabase.from('payments').insert({
        company_id: companyId, application_id: app.id,
        total_amount: totalAmount, paid_amount: 0, currency: price.currency || 'TRY',
        notes: sur
          ? `Hizmet: ${price.price} ${price.currency} + Uyruk ek ücreti: ${sur.surcharge_amount} ${sur.currency}${sur.reason ? ` (${sur.reason})` : ''}`
          : null,
      })
    }

    let matchedDocs: any[] | null = null
    let usedGlobal = false
    const nat = form.nationality || 'Türkiye Cumhuriyeti'

    if (app && form.country && form.visa_type) {
      // 1. Firma kendi şablonu — 4-way
      const { data: ownTpl } = await supabase
        .from('visa_templates').select('docs')
        .eq('company_id', companyId).neq('status', 'rejected')
        .ilike('country', form.country).ilike('visa_type', form.visa_type)
        .ilike('occupation', form.occupation || '').ilike('nationality', nat)
        .limit(1).maybeSingle()

      if (ownTpl && Array.isArray(ownTpl.docs) && ownTpl.docs.length > 0) {
        matchedDocs = ownTpl.docs
      } else {
        // 2. Global onaylı — 4-way
        const { data: globalTpl } = await supabase
          .from('visa_templates').select('docs')
          .eq('is_global', true).eq('status', 'approved')
          .ilike('country', form.country).ilike('visa_type', form.visa_type)
          .ilike('occupation', form.occupation || '').ilike('nationality', nat)
          .limit(1).maybeSingle()

        if (globalTpl && Array.isArray(globalTpl.docs) && globalTpl.docs.length > 0) {
          matchedDocs = globalTpl.docs
          usedGlobal = true
        }
      }

      if (matchedDocs) {
        await supabase.from('user_submitted_docs').delete().eq('application_id', app.id)
        await supabase.from('user_submitted_docs').insert(
          matchedDocs.map((d: any) => ({
            application_id: app.id,
            doc_name: d.doc_name, delivery_type: d.delivery_type,
            description: d.description || '', status: 'pending',
          }))
        )
      }

      if (!matchedDocs) {
        const { data: similar } = await supabase
          .from('visa_templates').select('country, visa_type, occupation, nationality, docs, is_global')
          .ilike('country', form.country).eq('status', 'approved').limit(6)
        setSimilarTemplates(similar || [])
      }
    }

    await supabase.from('leads').delete().eq('id', selectedLead.id)

    const clientId = newClient.id
    const appId = app?.id ?? null

    setSaving(false)
    isSavingRef.current = false
    setShowDurumModal(false)
    setForm({ country: '', visa_type: '', occupation: '', nationality: 'Türkiye Cumhuriyeti' })
    fetchData()

    if (!matchedDocs && app && form.country && form.visa_type) {
      setSavedClientId(clientId)
      setSavedAppId(appId)
      setNoTemplateModal(true)
    } else {
      if (usedGlobal) {
        setGlobalToast(true)
        setTimeout(() => setGlobalToast(false), 3000)
      }
      router.push(`/dashboard/musteriler/${clientId}`)
    }
  }

  async function useSimilarTemplate(tpl: any) {
    if (!savedAppId || usingSimilar) return
    setUsingSimilar(true)
    await supabase.from('user_submitted_docs').delete().eq('application_id', savedAppId)
    await supabase.from('user_submitted_docs').insert(
      (tpl.docs || []).map((d: any) => ({
        application_id: savedAppId,
        doc_name: d.doc_name, delivery_type: d.delivery_type,
        description: d.description || '', status: 'pending',
      }))
    )
    setNoTemplateModal(false); setSimilarTemplates([]); setUsingSimilar(false)
    router.push(`/dashboard/musteriler/${savedClientId}`)
  }

  async function iptalEt() {
    if (!selectedLead) return
    setSaving(true)
    await supabase.from('leads').delete().eq('id', selectedLead.id)
    setSaving(false); setShowDurumModal(false); fetchData()
  }

  async function sonraKonusulacak() {
    if (!selectedLead) return
    setSaving(true)
    await supabase.from('leads').update({ status: 'contacted' }).eq('id', selectedLead.id)
    setSaving(false); setShowDurumModal(false); fetchData()
  }

  const statusLabel: any = {
    waiting:   { label: ts('waiting'),   bg: '#fff8ec', color: '#92600a' },
    claimed:   { label: ts('claimed'),   bg: '#eef4fb', color: '#1a5fa5' },
    contacted: { label: ts('contacted'), bg: '#f0eeff', color: '#5b2eb5' },
  }

  const autoPrice = prices.find(p =>
    form.country && form.visa_type &&
    p.country.toLowerCase() === form.country.toLowerCase() &&
    p.visa_type.toLowerCase() === form.visa_type.toLowerCase()
  )

  const autoSurcharge = form.nationality
    ? surcharges.find(s => {
        if (s.nationality?.trim().toLowerCase() !== form.nationality.trim().toLowerCase()) return false
        if (s.country && s.country.trim().toLowerCase() !== (form.country || '').toLowerCase()) return false
        if (s.visa_type && s.visa_type.trim().toLowerCase() !== (form.visa_type || '').toLowerCase()) return false
        return true
      })
    : null

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', border: '1.5px solid rgba(188,204,226,0.7)',
    borderRadius: '10px', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', background: '#f7f9fd',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: '600', color: '#94a3b8',
    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px',
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>{tc('loading')}</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={t('pageTitle')} />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e4eaf5' }}>
        <div style={{ background: '#f7f9fd', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{t('listTitle')}</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t('waitingCount', { count: leads.filter(l => l.status === 'waiting').length })}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr>
                  {[t('table.name'), t('table.wants'), t('table.consultant'), t('table.status'), ''].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid rgba(188,204,226,0.35)', background: '#eef2f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>{t('table.empty')}</td></tr>
                )}
                {leads.map(lead => {
                  const s = statusLabel[lead.status] || statusLabel.waiting
                  const isMine = currentUser && lead.claimed_by === currentUser.id
                  const claimedName = lead.claimed_by ? usersMap[lead.claimed_by] : null
                  return (
                    <tr key={lead.id}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8faff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <div>{lead.full_name || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{lead.phone}</div>
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#475569', borderBottom: '1px solid rgba(188,204,226,0.3)', maxWidth: '320px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                          {lead.ai_summary
                            ? <span style={{ color: '#1e3a5f', fontWeight: '500' }}>{lead.ai_summary}</span>
                            : lead.user_message || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#475569', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        {claimedName ? <span style={{ color: '#1d4ed8', fontWeight: '500' }}>{claimedName}</span> : t('table.notAssigned')}
                      </td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {lead.status === 'waiting' && (
                            <button onClick={() => sahiplen(lead)} style={{ padding: '5px 12px', fontSize: '11px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}>
                              {t('actions.claim')}
                            </button>
                          )}
                          {(lead.status === 'claimed' || lead.status === 'contacted') && isMine && (
                            <button onClick={() => { setSelectedLead(lead); setDurumAksiyon(null); setShowDurumModal(true) }} style={{ padding: '5px 12px', fontSize: '11px', background: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}>
                              {t('actions.updateStatus')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {globalToast && (
        <div style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#1a7a45', color: 'white', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
          {tm('toasts.globalTemplateUsed')}
        </div>
      )}

      {showDurumModal && selectedLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#f7f9fd', borderRadius: '18px', padding: '2rem', width: '460px', maxWidth: '95vw', boxShadow: '0 16px 48px rgba(15,23,42,0.15)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '500', marginBottom: '6px', color: '#1e293b' }}>{t('modal.title')}</h3>

            <div style={{ background: '#eef2fa', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', padding: '10px 12px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>{selectedLead.full_name || '—'}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>📱 {selectedLead.phone}</div>
              {(selectedLead.ai_summary || selectedLead.user_message) && (
                <div style={{ fontSize: '12px', color: '#1e3a5f', fontStyle: selectedLead.ai_summary ? 'normal' : 'italic' }}>
                  {selectedLead.ai_summary ? `📝 ${selectedLead.ai_summary}` : `"${selectedLead.user_message}"`}
                </div>
              )}
            </div>

            {!durumAksiyon && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                <button onClick={() => setDurumAksiyon('musteri')} style={{ padding: '12px', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
                  {t('modal.convertToCustomer')}
                </button>
                <button onClick={() => setDurumAksiyon('sonra')} style={{ padding: '12px', background: '#f0eeff', color: '#5b2eb5', border: '1.5px solid #c9bdf0', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
                  {t('modal.talkLater')}
                </button>
                <button onClick={() => setDurumAksiyon('iptal')} style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
                  {t('modal.cancel')}
                </button>
              </div>
            )}

            {durumAksiyon === 'musteri' && (
              <>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '1rem' }}>{t('modal.visaInfoLabel')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>{tf('country')}</label>
                    <input value={form.country} onChange={e => setForm({ ...form, country: toTitleCase(e.target.value) })} placeholder={tp('country')} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{tf('visaType')}</label>
                    <input value={form.visa_type} onChange={e => setForm({ ...form, visa_type: toTitleCase(e.target.value) })} placeholder={tp('visaType')} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>{tf('occupation')}</label>
                  <input value={form.occupation} onChange={e => setForm({ ...form, occupation: toTitleCase(e.target.value) })} placeholder={tp('occupation')} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>{tf('nationality')}</label>
                  <input value={form.nationality} onChange={e => setForm({ ...form, nationality: toTitleCase(e.target.value) })} placeholder="Türkiye Cumhuriyeti" style={inputStyle} />
                </div>

                {autoPrice ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#16a34a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{tm('addModal.servicePrice')}</span>
                      <strong>{formatPrice(autoPrice.price, autoPrice.currency)}</strong>
                    </div>
                    {autoSurcharge && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #86efac', color: '#854f0b' }}>
                          <span>Uyruk Ek Ücreti{autoSurcharge.reason ? ` (${autoSurcharge.reason})` : ''}</span>
                          <strong>+{formatPrice(autoSurcharge.surcharge_amount, autoSurcharge.currency)}</strong>
                        </div>
                        {autoSurcharge.currency === autoPrice.currency && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #86efac', fontWeight: '700' }}>
                            <span>Toplam</span>
                            <span>{formatPrice(autoPrice.price + autoSurcharge.surcharge_amount, autoPrice.currency)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (form.country && form.visa_type) ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#92400e' }}>
                    {tm('addModal.noPriceDefined')}
                  </div>
                ) : null}

                {musteriYapError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#dc2626' }}>
                    {musteriYapError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setDurumAksiyon(null); setMusteriYapError(null) }} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('back')}</button>
                  <button onClick={musteriYap} disabled={saving || !form.country || !form.visa_type} style={{ flex: 2, padding: '10px', background: saving ? '#aaa' : 'linear-gradient(135deg, #16a34a, #0d9488)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (!form.country || !form.visa_type) ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    {saving ? tc('saving') : t('modal.addAsCustomer')}
                  </button>
                </div>
              </>
            )}

            {durumAksiyon === 'sonra' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDurumAksiyon(null)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('back')}</button>
                <button onClick={sonraKonusulacak} disabled={saving} style={{ flex: 2, padding: '10px', background: saving ? '#aaa' : '#5b2eb5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? tc('saving') : t('modal.talkLaterConfirm')}
                </button>
              </div>
            )}

            {durumAksiyon === 'iptal' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDurumAksiyon(null)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('back')}</button>
                <button onClick={iptalEt} disabled={saving} style={{ flex: 2, padding: '10px', background: saving ? '#aaa' : '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? tc('deleting') : t('modal.cancelConfirm')}
                </button>
              </div>
            )}

            {!durumAksiyon && (
              <button onClick={() => { setShowDurumModal(false); setSaving(false) }} style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {tc('close')}
              </button>
            )}
          </div>
        </div>
      )}

      {noTemplateModal && savedClientId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#f7f9fd', borderRadius: '18px', padding: '2rem', width: '460px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(15,23,42,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>{tm('noTemplate.title')}</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                {tm('noTemplate.description')}
              </p>
            </div>

            {similarTemplates.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '10px', textAlign: 'center' }}>
                  {tm('noTemplate.similarTitle')}
                </div>
                {similarTemplates.map((tpl, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1.5px solid rgba(188,204,226,0.5)', borderRadius: '10px', marginBottom: '6px', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tField(tpl.country, 'country', locale)} · {tField(tpl.visa_type, 'visaType', locale)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {tpl.occupation ? tField(tpl.occupation, 'occupation', locale) : tm('noTemplate.noOccupation')}
                        {tpl.nationality && <span style={{ marginLeft: '4px' }}>· {tpl.nationality}</span>}
                        {' · '}{tm('noTemplate.docCount', { count: (tpl.docs || []).length })}
                        {tpl.is_global && <span style={{ marginLeft: '6px', color: '#2563eb', fontWeight: '600' }}>{tm('noTemplate.globalBadge')}</span>}
                      </div>
                    </div>
                    <button onClick={() => useSimilarTemplate(tpl)} disabled={usingSimilar} style={{ flexShrink: 0, padding: '6px 12px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: usingSimilar ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: usingSimilar ? 0.6 : 1 }}>
                      {usingSimilar ? '...' : tm('noTemplate.useTemplate')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => router.push('/dashboard/sablonlar')} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                {tm('noTemplate.createTemplate')}
              </button>
              <button onClick={() => router.push('/dashboard/sablonlar?tab=global')} style={{ width: '100%', padding: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {tm('noTemplate.viewGlobal')}
              </button>
              <button onClick={() => { setNoTemplateModal(false); setSimilarTemplates([]); router.push(`/dashboard/musteriler/${savedClientId}`) }} style={{ width: '100%', padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {tm('noTemplate.goToProfile')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
