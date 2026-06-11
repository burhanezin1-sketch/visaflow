'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'

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
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [usersMap, setUsersMap] = useState<Record<string, string>>({})
  const [showDurumModal, setShowDurumModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [prices, setPrices] = useState<any[]>([])
  const [form, setForm] = useState({ country: '', visa_type: '', occupation: '' })
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
        setMusteriYapError(`Bu müşteri zaten kayıtlı: ${existing.full_name}`)
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

    const { data: app } = await supabase
      .from('applications')
      .insert({ company_id: companyId, client_id: newClient.id, country: form.country, visa_type: form.visa_type, occupation: form.occupation || null, status: 'missing' })
      .select().single()

    // Fiyat kaydı
    const price = prices.find(p =>
      p.country.toLowerCase() === form.country.toLowerCase() &&
      p.visa_type.toLowerCase() === form.visa_type.toLowerCase()
    )
    if (app && price) {
      await supabase.from('payments').insert({
        company_id: companyId, application_id: app.id,
        total_amount: price.price, paid_amount: 0, currency: price.currency || 'TRY',
      })
    }

    // Şablon arama
    let matchedDocs: any[] | null = null
    let usedGlobal = false

    if (app && form.country && form.visa_type) {
      // 1. Firma kendi şablonu (rejected hariç)
      const { data: ownTpl } = await supabase
        .from('visa_templates').select('docs')
        .eq('company_id', companyId).neq('status', 'rejected')
        .ilike('country', form.country).ilike('visa_type', form.visa_type)
        .ilike('occupation', form.occupation || '')
        .limit(1).maybeSingle()

      if (ownTpl && Array.isArray(ownTpl.docs) && ownTpl.docs.length > 0) {
        matchedDocs = ownTpl.docs
      } else {
        // 2. Global onaylı şablon
        const { data: globalTpl } = await supabase
          .from('visa_templates').select('docs')
          .eq('is_global', true).eq('status', 'approved')
          .ilike('country', form.country).ilike('visa_type', form.visa_type)
          .ilike('occupation', form.occupation || '')
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

      // 3. Şablon yoksa benzer şablonlar
      if (!matchedDocs) {
        const { data: similar } = await supabase
          .from('visa_templates').select('country, visa_type, occupation, docs, is_global')
          .ilike('country', form.country).eq('status', 'approved').limit(6)
        setSimilarTemplates(similar || [])
      }
    }

    // Lead'i dönüştür
    await supabase.from('leads').delete().eq('id', selectedLead.id)

    const clientId = newClient.id
    const appId = app?.id ?? null

    setSaving(false)
    isSavingRef.current = false
    setShowDurumModal(false)
    setForm({ country: '', visa_type: '', occupation: '' })
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
    waiting:   { label: 'Bekliyor',                  bg: '#fff8ec', color: '#92600a' },
    claimed:   { label: 'Sahiplenildi',              bg: '#eef4fb', color: '#1a5fa5' },
    contacted: { label: 'Daha Sonra Konuşulacak',    bg: '#f0eeff', color: '#5b2eb5' },
  }

  const autoPrice = prices.find(p =>
    form.country && form.visa_type &&
    p.country.toLowerCase() === form.country.toLowerCase() &&
    p.visa_type.toLowerCase() === form.visa_type.toLowerCase()
  )

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
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Potansiyel Müşteriler" />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e4eaf5' }}>
        <div style={{ background: '#f7f9fd', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Lead Listesi</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{leads.filter(l => l.status === 'waiting').length} bekliyor</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr>
                  {['Ad Soyad', 'Ne İstiyor?', 'Danışman', 'Durum', ''].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid rgba(188,204,226,0.35)', background: '#eef2f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Henüz potansiyel müşteri yok</td></tr>
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
                        {claimedName ? <span style={{ color: '#1d4ed8', fontWeight: '500' }}>{claimedName}</span> : 'Atanmadı'}
                      </td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '20px' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {lead.status === 'waiting' && (
                            <button onClick={() => sahiplen(lead)} style={{ padding: '5px 12px', fontSize: '11px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}>
                              Sahiplen
                            </button>
                          )}
                          {(lead.status === 'claimed' || lead.status === 'contacted') && isMine && (
                            <button onClick={() => { setSelectedLead(lead); setDurumAksiyon(null); setShowDurumModal(true) }} style={{ padding: '5px 12px', fontSize: '11px', background: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}>
                              Durum Güncelle
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

      {/* Global şablon toastı */}
      {globalToast && (
        <div style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#1a7a45', color: 'white', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
          ✓ Global şablon kullanıldı
        </div>
      )}

      {/* Durum modalı */}
      {showDurumModal && selectedLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#f7f9fd', borderRadius: '18px', padding: '2rem', width: '460px', maxWidth: '95vw', boxShadow: '0 16px 48px rgba(15,23,42,0.15)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '500', marginBottom: '6px', color: '#1e293b' }}>Durum Güncelle</h3>

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
                  ✓ Müşteriye Dönüştür
                </button>
                <button onClick={() => setDurumAksiyon('sonra')} style={{ padding: '12px', background: '#f0eeff', color: '#5b2eb5', border: '1.5px solid #c9bdf0', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
                  🕐 Daha Sonra Konuşulacak
                </button>
                <button onClick={() => setDurumAksiyon('iptal')} style={{ padding: '12px', background: '#fef2f2', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
                  ✕ İptal — Müşteri Olmayacak
                </button>
              </div>
            )}

            {/* Müşteriye dönüştür formu */}
            {durumAksiyon === 'musteri' && (
              <>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '1rem' }}>Vize bilgilerini girin:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={labelStyle}>Ülke</label>
                    <input
                      value={form.country}
                      onChange={e => setForm({ ...form, country: toTitleCase(e.target.value) })}
                      placeholder="ör. Fransa"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Vize Türü</label>
                    <input
                      value={form.visa_type}
                      onChange={e => setForm({ ...form, visa_type: toTitleCase(e.target.value) })}
                      placeholder="ör. Turist Vizesi"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Meslek</label>
                  <input
                    value={form.occupation}
                    onChange={e => setForm({ ...form, occupation: toTitleCase(e.target.value) })}
                    placeholder="ör. Çalışan (opsiyonel)"
                    style={inputStyle}
                  />
                </div>

                {autoPrice ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#16a34a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Hizmet Bedeli</span>
                    <strong>{formatPrice(autoPrice.price, autoPrice.currency)}</strong>
                  </div>
                ) : (form.country && form.visa_type) ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#92400e' }}>
                    Bu vize tipi için fiyat tanımlanmamış.
                  </div>
                ) : null}

                {musteriYapError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#dc2626' }}>
                    {musteriYapError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setDurumAksiyon(null); setMusteriYapError(null) }} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Geri</button>
                  <button onClick={musteriYap} disabled={saving || !form.country || !form.visa_type} style={{ flex: 2, padding: '10px', background: saving ? '#aaa' : 'linear-gradient(135deg, #16a34a, #0d9488)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (!form.country || !form.visa_type) ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    {saving ? 'Kaydediliyor...' : '✓ Müşteri Olarak Ekle'}
                  </button>
                </div>
              </>
            )}

            {durumAksiyon === 'sonra' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDurumAksiyon(null)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Geri</button>
                <button onClick={sonraKonusulacak} disabled={saving} style={{ flex: 2, padding: '10px', background: saving ? '#aaa' : '#5b2eb5', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? 'Kaydediliyor...' : '🕐 Daha Sonra Konuşulacak'}
                </button>
              </div>
            )}

            {durumAksiyon === 'iptal' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDurumAksiyon(null)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Geri</button>
                <button onClick={iptalEt} disabled={saving} style={{ flex: 2, padding: '10px', background: saving ? '#aaa' : '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? 'Siliniyor...' : '✕ İptal Et ve Sil'}
                </button>
              </div>
            )}

            {!durumAksiyon && (
              <button onClick={() => { setShowDurumModal(false); setSaving(false) }} style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'transparent', color: '#94a3b8', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Kapat
              </button>
            )}
          </div>
        </div>
      )}

      {/* Şablon bulunamadı modalı */}
      {noTemplateModal && savedClientId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#f7f9fd', borderRadius: '18px', padding: '2rem', width: '460px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(15,23,42,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Şablon Bulunamadı</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                Bu kombinasyon için henüz şablon oluşturulmamış.<br />
                Müşteri kaydedildi, evrak listesi şimdilik boş.
              </p>
            </div>

            {similarTemplates.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '10px', textAlign: 'center' }}>
                  Benzer şablonlar var, kullanmak ister misiniz?
                </div>
                {similarTemplates.map((tpl, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1.5px solid rgba(188,204,226,0.5)', borderRadius: '10px', marginBottom: '6px', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tpl.country} · {tpl.visa_type}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {tpl.occupation || 'Meslek belirtilmemiş'} · {(tpl.docs || []).length} evrak
                        {tpl.is_global && <span style={{ marginLeft: '6px', color: '#2563eb', fontWeight: '600' }}>🌐 Global</span>}
                      </div>
                    </div>
                    <button onClick={() => useSimilarTemplate(tpl)} disabled={usingSimilar} style={{ flexShrink: 0, padding: '6px 12px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: usingSimilar ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: usingSimilar ? 0.6 : 1 }}>
                      {usingSimilar ? '...' : 'Bu Şablonu Kullan'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => router.push('/dashboard/sablonlar')} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                + Şablon Oluştur
              </button>
              <button onClick={() => router.push('/dashboard/sablonlar?tab=global')} style={{ width: '100%', padding: '10px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                🌐 Global Şablonlara Bak
              </button>
              <button onClick={() => { setNoTemplateModal(false); setSimilarTemplates([]); router.push(`/dashboard/musteriler/${savedClientId}`) }} style={{ width: '100%', padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid rgba(188,204,226,0.6)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Müşteri Profiline Git →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
