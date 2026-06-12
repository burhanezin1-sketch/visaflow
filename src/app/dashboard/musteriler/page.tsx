'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { checkApplicationLimit } from '@/lib/planCheck'
import { logAction } from '@/lib/activityLog'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTranslations } from 'next-intl'

function formatPrice(price: number, currency: string = 'TRY') {
  const sym: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' }
  return currency === 'TRY'
    ? `${price.toLocaleString('tr-TR')}${sym.TRY}`
    : `${sym[currency] || currency}${price.toLocaleString('en-US')}`
}

const toTitleCase = (str: string) => {
  return str.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase())
}

export default function MusterilerPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const t = useTranslations('musteriler')
  const tc = useTranslations('common')
  const ts = useTranslations('status')
  const tf = useTranslations('fields')
  const tp = useTranslations('placeholders')
  const [clients, setClients] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [prices, setPrices] = useState<any[]>([])
  const [form, setForm] = useState({ ad: '', soyad: '', phone: '', email: '', country: '', visa_type: '', occupation: '', nationality: 'Türkiye Cumhuriyeti', notes: '' })
  const [autoPrice, setAutoPrice] = useState<{ price: number; currency: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [limitError, setLimitError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tumu' | 'benimkiler'>('tumu')
  const [currentUserId, setCurrentUserId] = useState('')
  const [noTemplateModal, setNoTemplateModal] = useState(false)
  const [savedClientId, setSavedClientId] = useState<string | null>(null)
  const [savedAppId, setSavedAppId] = useState<string | null>(null)
  const [globalToast, setGlobalToast] = useState(false)
  const [similarTemplates, setSimilarTemplates] = useState<any[]>([])
  const [usingSimilar, setUsingSimilar] = useState(false)
  const [nationalityMismatch, setNationalityMismatch] = useState(false)
  const isSavingRef = useRef(false)
  const router = useRouter()

  const statusMap: any = {
    missing:             { label: ts('missing'),             bg: '#fef0ee', color: '#c0392b' },
    appointment_waiting: { label: ts('appointment_waiting'), bg: '#fff8ec', color: '#92600a' },
    appointment:         { label: ts('appointment'),         bg: '#eef4fb', color: '#1a5fa5' },
    approved:            { label: ts('approved') + ' ✓',    bg: '#edfaf3', color: '#1a7a45' },
    rejected:            { label: ts('rejected') + ' ✗',    bg: '#fef0ee', color: '#c0392b' },
  }

  const occupationLabels: Record<string, string> = {
    calisan:         t('occupations.calisan'),
    sirket_sahibi:   t('occupations.sirket_sahibi'),
    devlet_memuru:   t('occupations.devlet_memuru'),
    ogrenci:         t('occupations.ogrenci'),
    emekli:          t('occupations.emekli'),
    ev_hanimi:       t('occupations.ev_hanimi'),
    ev_hanimi_meslek:t('occupations.ev_hanimi_meslek'),
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) { setLoading(false); return }
    fetchData()
    fetchPrices()
  }, [companyId, companyLoading])

  async function fetchData() {
    const { data } = await supabase
      .from('clients')
      .select('*, applications(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    setClients(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  async function fetchPrices() {
    const { data } = await supabase
      .from('service_prices')
      .select('*')
      .eq('company_id', companyId)
    setPrices(data || [])
  }

  useEffect(() => {
    let result = clients
    if (search) result = result.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter) result = result.filter(c => c.applications?.[0]?.status === statusFilter)
    setFiltered(result)
  }, [search, statusFilter, clients])

  useEffect(() => {
    const p = prices.find(p => p.country === form.country && p.visa_type === form.visa_type)
    setAutoPrice(p ? { price: p.price, currency: p.currency || 'TRY' } : null)
  }, [form.country, form.visa_type, prices])

  async function saveClient() {
    if (isSavingRef.current || !form.ad || !form.soyad || !companyId) return
    isSavingRef.current = true
    setLimitError(null)
    setSaving(true)

    if (form.phone) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id, full_name')
        .eq('company_id', companyId)
        .eq('phone', form.phone)
        .maybeSingle()
      if (existing) {
        setLimitError(t('addModal.alreadyRegistered', { name: existing.full_name }))
        setSaving(false)
        return
      }
    }

    const limitCheck = await checkApplicationLimit(companyId)
    if (!limitCheck.allowed) {
      setLimitError(limitCheck.message || 'Başvuru limitine ulaşıldı.')
      setSaving(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { data: newClient } = await supabase
      .from('clients')
      .insert({
        company_id: companyId,
        danisan_id: user?.id,
        full_name: form.ad + ' ' + form.soyad,
        phone: form.phone,
        email: form.email,
      })
      .select()
      .single()

    if (newClient) {
      const { data: newApp, error: appInsertError } = await supabase
        .from('applications')
        .insert({
          company_id: companyId,
          client_id: newClient.id,
          country: form.country,
          visa_type: form.visa_type,
          occupation: form.occupation || null,
          nationality: form.nationality || 'Türkiye Cumhuriyeti',
          status: 'missing',
        })
        .select()
        .single()

      let resolvedApp = newApp
      if (!resolvedApp && !appInsertError) {
        const { data: refetched } = await supabase
          .from('applications')
          .select('id')
          .eq('client_id', newClient.id)
          .order('created_at', { ascending: false })
          .maybeSingle()
        resolvedApp = refetched
      }

      let matchedDocs: { doc_name: string; delivery_type: string; description?: string }[] | null = null
      let usedGlobal = false
      const nat = form.nationality || 'Türkiye Cumhuriyeti'

      if (resolvedApp && form.country && form.visa_type) {
        // 1. Firma kendi şablonu — 4-way eşleşme
        const { data: ownTpl } = await supabase
          .from('visa_templates')
          .select('docs')
          .eq('company_id', companyId)
          .neq('status', 'rejected')
          .ilike('country', form.country)
          .ilike('visa_type', form.visa_type)
          .ilike('occupation', form.occupation || '')
          .ilike('nationality', nat)
          .limit(1)
          .maybeSingle()

        if (ownTpl?.docs && Array.isArray(ownTpl.docs) && ownTpl.docs.length > 0) {
          matchedDocs = ownTpl.docs
        } else {
          // 2. Global onaylı şablon — 4-way eşleşme
          const { data: globalTpl } = await supabase
            .from('visa_templates')
            .select('docs')
            .eq('is_global', true)
            .eq('status', 'approved')
            .ilike('country', form.country)
            .ilike('visa_type', form.visa_type)
            .ilike('occupation', form.occupation || '')
            .ilike('nationality', nat)
            .limit(1)
            .maybeSingle()

          if (globalTpl?.docs && Array.isArray(globalTpl.docs) && globalTpl.docs.length > 0) {
            matchedDocs = globalTpl.docs
            usedGlobal = true
          }
        }

        if (matchedDocs) {
          await supabase.from('user_submitted_docs').delete().eq('application_id', resolvedApp!.id)
          await supabase.from('user_submitted_docs').insert(
            matchedDocs.map(d => ({
              application_id: resolvedApp!.id,
              doc_name: d.doc_name,
              delivery_type: d.delivery_type,
              description: d.description || '',
              status: 'pending',
            }))
          )
        }

        if (!matchedDocs) {
          // 3. Aynı ülke+vize+meslek ama farklı uyruk — nationality mismatch önerisi
          const { data: natMismatch } = await supabase
            .from('visa_templates')
            .select('country, visa_type, occupation, nationality, docs, is_global')
            .ilike('country', form.country)
            .ilike('visa_type', form.visa_type)
            .ilike('occupation', form.occupation || '')
            .eq('status', 'approved')
            .limit(6)

          if (natMismatch && natMismatch.length > 0) {
            setSimilarTemplates(natMismatch)
            setNationalityMismatch(true)
          } else {
            // 4. Hiçbiri yoksa: aynı ülkeye ait genel öneriler
            const { data: similar } = await supabase
              .from('visa_templates')
              .select('country, visa_type, occupation, nationality, docs, is_global')
              .ilike('country', form.country)
              .eq('status', 'approved')
              .limit(6)
            setSimilarTemplates(similar || [])
            setNationalityMismatch(false)
          }
        }
      }

      if (newApp && autoPrice) {
        await supabase.from('payments').insert({
          company_id: companyId,
          application_id: newApp.id,
          total_amount: autoPrice.price,
          paid_amount: 0,
          currency: autoPrice.currency || 'TRY',
        })
      }

      const { data: userData } = await supabase.from('users').select('full_name').eq('id', user?.id).single()
      logAction(companyId, user?.id, userData?.full_name || '', 'Yeni müşteri eklendi', 'client', newClient.id, newClient.full_name)

      const clientId = newClient.id
      const appId = resolvedApp?.id ?? null

      await fetchData()
      setShowModal(false)
      setForm({ ad: '', soyad: '', phone: '', email: '', country: '', visa_type: '', occupation: '', nationality: 'Türkiye Cumhuriyeti', notes: '' })

      if (!matchedDocs && resolvedApp && !!(form.country && form.visa_type)) {
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
    isSavingRef.current = false
    setSaving(false)
  }

  async function useSimilarTemplate(tpl: any) {
    if (!savedAppId || usingSimilar) return
    setUsingSimilar(true)
    await supabase.from('user_submitted_docs').delete().eq('application_id', savedAppId)
    await supabase.from('user_submitted_docs').insert(
      (tpl.docs || []).map((d: any) => ({
        application_id: savedAppId,
        doc_name: d.doc_name,
        delivery_type: d.delivery_type,
        description: d.description || '',
        status: 'pending',
      }))
    )
    setNoTemplateModal(false)
    setSimilarTemplates([])
    setUsingSimilar(false)
    router.push(`/dashboard/musteriler/${savedClientId}`)
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>{tc('loading')}</div>
    </div>
  )

  const displayed = activeTab === 'benimkiler'
    ? filtered.filter(c => c.danisan_id === currentUserId)
    : filtered

  const benimkilerCount = clients.filter(c => c.danisan_id === currentUserId).length

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 10px', border: '1.5px solid rgba(188,204,226,0.7)', borderRadius: '10px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    background: '#f7f9fd',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb',
    marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={t('pageTitle')} />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e9eef6' }}>
        <div style={{ background: '#f7f9fd', border: '1px solid rgba(188,204,226,0.5)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(188,204,226,0.35)', flexWrap: 'wrap' }}>
            {([
              { key: 'tumu',       label: t('tabs.all'),  count: clients.length },
              { key: 'benimkiler', label: t('tabs.mine'), count: benimkilerCount },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: isMobile ? '9px 12px' : '11px 18px',
                  fontSize: isMobile ? '12px' : '13px', fontWeight: '500',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: activeTab === tab.key ? '#0d1f35' : '#9aaabb',
                  borderBottom: activeTab === tab.key ? '2px solid #1a5fa5' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  background: activeTab === tab.key ? '#eef4fb' : '#f5f5f7',
                  color: activeTab === tab.key ? '#1a5fa5' : '#9aaabb',
                  padding: '1px 7px', borderRadius: '10px',
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center', padding: '6px 0.75rem', flexWrap: 'wrap' }}>
              {!isMobile && (
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tp('searchName')} style={{ padding: '6px 10px', border: '1.5px solid #e2e2e8', borderRadius: '7px', fontSize: '12px', outline: 'none', width: '130px' }} />
              )}
              {!isMobile && (
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px 8px', border: '1.5px solid #e2e2e8', borderRadius: '7px', fontSize: '12px', background: '#f5f5f7', outline: 'none' }}>
                  <option value="">{t('filters.allStatuses')}</option>
                  <option value="missing">{ts('missing')}</option>
                  <option value="appointment_waiting">{ts('appointment_waiting')}</option>
                  <option value="appointment">{ts('appointment')}</option>
                  <option value="approved">{ts('approved')}</option>
                  <option value="rejected">{ts('rejected')}</option>
                </select>
              )}
              <button onClick={() => setShowModal(true)} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}>
                {tc('new')}
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
              <thead>
                <tr>
                  {[tf('fullName'), tf('phone'), tf('country'), tf('visaType'), tf('occupation'), tf('status'), tf('date')].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid rgba(188,204,226,0.35)', background: '#eef2f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>
                      {activeTab === 'benimkiler' ? t('table.empty.mine') : t('table.empty.all')}
                    </td>
                  </tr>
                )}
                {displayed.map(c => {
                  const app = c.applications?.[0]
                  const s = statusMap[app?.status] || statusMap.missing
                  return (
                    <tr key={c.id} onClick={() => router.push(`/dashboard/musteriler/${c.id}`)} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#edf1f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid rgba(188,204,226,0.35)' }}>{c.full_name}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', borderBottom: '1px solid rgba(188,204,226,0.35)', color: '#5a6a7a' }}>{c.phone}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid rgba(188,204,226,0.35)' }}>{app?.country || '-'}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid rgba(188,204,226,0.35)' }}>{app?.visa_type || '-'}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', borderBottom: '1px solid rgba(188,204,226,0.35)', color: '#5a6a7a' }}>{occupationLabels[app?.occupation] || app?.occupation || '-'}</td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.35)' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#9aaabb', borderBottom: '1px solid rgba(188,204,226,0.35)' }}>
                        {new Date(c.created_at).toLocaleDateString('tr-TR')}
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
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: '#1a7a45', color: 'white', padding: '10px 20px', borderRadius: '8px',
          fontSize: '13px', fontWeight: '500', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}>
          {t('toasts.globalTemplateUsed')}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#f7f9fd', borderRadius: '18px', padding: '2rem', width: '420px', maxWidth: '95vw', boxShadow: '0 16px 48px rgba(15,23,42,0.15)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '500', marginBottom: '1.5rem', color: '#1e293b' }}>{t('addModal.title')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={labelStyle}>{tf('firstName')}</label>
                <input value={form.ad} onChange={e => setForm({...form, ad: toTitleCase(e.target.value)})} placeholder={tp('firstName')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{tf('lastName')}</label>
                <input value={form.soyad} onChange={e => setForm({...form, soyad: toTitleCase(e.target.value)})} placeholder={tp('lastName')} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>{tf('phone')}</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder={tp('phone')} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>{tf('email')}</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder={tp('email')} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={labelStyle}>{tf('country')}</label>
                <input value={form.country} onChange={e => setForm({...form, country: toTitleCase(e.target.value)})} placeholder={tp('country')} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{tf('visaType')}</label>
                <input value={form.visa_type} onChange={e => setForm({...form, visa_type: toTitleCase(e.target.value)})} placeholder={tp('visaType')} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>{tf('occupation')}</label>
              <input value={form.occupation} onChange={e => setForm({...form, occupation: toTitleCase(e.target.value)})} placeholder={tp('occupation')} style={inputStyle} />
              {form.visa_type === 'Resmi Vize' && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#92600a', background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '6px', padding: '6px 10px', lineHeight: '1.5' }}>
                  {t('addModal.officialVisaWarning')}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>{tf('nationality')}</label>
              <input value={form.nationality} onChange={e => setForm({...form, nationality: toTitleCase(e.target.value)})} placeholder="Türkiye Cumhuriyeti" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>{tf('notes')}</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                placeholder={tp('notes')}
                rows={3}
                style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit', color: '#0d1f35', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            {autoPrice ? (
              <div style={{ background: '#edfaf3', border: '1px solid #a8e6c1', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#1a7a45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('addModal.servicePrice')}</span>
                <strong>{formatPrice(autoPrice.price, autoPrice.currency)}</strong>
              </div>
            ) : (
              <div style={{ background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#92600a' }}>
                {t('addModal.noPriceDefined')}
              </div>
            )}
            {limitError && (
              <div style={{ background: '#fef0ee', border: '1px solid #f5c2bb', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#c0392b' }}>
                {limitError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={() => { setShowModal(false); setLimitError(null) }} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('cancel')}</button>
              <button onClick={saveClient} disabled={saving} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(29,78,216,0.25)', transition: 'opacity 0.2s' }}>
                {saving ? tc('saving') : t('addModal.submitBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {noTemplateModal && savedClientId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '460px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f35', marginBottom: '6px' }}>{t('noTemplate.title')}</h3>
              <p style={{ fontSize: '13px', color: '#5a6a7a', lineHeight: '1.6', margin: 0 }}>
                {t('noTemplate.description')}
              </p>
            </div>

            {similarTemplates.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {nationalityMismatch ? (
                  <div style={{ fontSize: '12px', color: '#92600a', background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px' }}>
                    {t('noTemplate.nationalityMismatch')}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#5a6a7a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ flex: 1, height: '1px', background: '#e2e2e8', display: 'inline-block' }} />
                    {t('noTemplate.similarTitle')}
                    <span style={{ flex: 1, height: '1px', background: '#e2e2e8', display: 'inline-block' }} />
                  </div>
                )}
                {similarTemplates.map((tpl, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: `1.5px solid ${nationalityMismatch ? '#f0d896' : '#e2e2e8'}`, borderRadius: '8px', marginBottom: '6px', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tpl.country} · {tpl.visa_type}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>
                        {tpl.occupation || t('noTemplate.noOccupation')}
                        {tpl.nationality && <span style={{ marginLeft: '4px', color: nationalityMismatch ? '#92600a' : '#9aaabb' }}>· {tpl.nationality}</span>}
                        {' · '}{t('noTemplate.docCount', { count: (tpl.docs || []).length })}
                        {tpl.is_global && <span style={{ marginLeft: '6px', color: '#2563eb', fontWeight: '600' }}>{t('noTemplate.globalBadge')}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => useSimilarTemplate(tpl)}
                      disabled={usingSimilar}
                      style={{ flexShrink: 0, padding: '6px 12px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: usingSimilar ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: usingSimilar ? 0.6 : 1 }}
                    >
                      {usingSimilar ? '...' : t('noTemplate.useTemplate')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => router.push('/dashboard/sablonlar')}
                style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(29,78,216,0.25)', transition: 'opacity 0.2s' }}
              >
                {t('noTemplate.createTemplate')}
              </button>
              <button
                onClick={() => router.push('/dashboard/sablonlar?tab=global')}
                style={{ width: '100%', padding: '10px', background: '#f0f4ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {t('noTemplate.viewGlobal')}
              </button>
              <button
                onClick={() => { setNoTemplateModal(false); setSimilarTemplates([]); setNationalityMismatch(false); router.push(`/dashboard/musteriler/${savedClientId}`) }}
                style={{ width: '100%', padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {t('noTemplate.goToProfile')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
