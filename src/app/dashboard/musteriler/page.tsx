'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { checkApplicationLimit } from '@/lib/planCheck'
import { logAction } from '@/lib/activityLog'
import { useIsMobile } from '@/lib/useIsMobile'
import { useVisaOptions } from '@/lib/useVisaOptions'

function formatPrice(price: number, currency: string = 'TRY') {
  const sym: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' }
  return currency === 'TRY'
    ? `${price.toLocaleString('tr-TR')}${sym.TRY}`
    : `${sym[currency] || currency}${price.toLocaleString('en-US')}`
}

const statusMap: any = {
  missing: { label: 'Evrak Eksik', bg: '#fef0ee', color: '#c0392b' },
  appointment_waiting: { label: 'Randevu Bekleniyor', bg: '#fff8ec', color: '#92600a' },
  appointment: { label: 'Randevu Alındı', bg: '#eef4fb', color: '#1a5fa5' },
  approved: { label: 'Onaylandı ✓', bg: '#edfaf3', color: '#1a7a45' },
  rejected: { label: 'Reddedildi ✗', bg: '#fef0ee', color: '#c0392b' },
}

export default function MusterilerPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [clients, setClients] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [prices, setPrices] = useState<any[]>([])
  const { countries, visaTypesFor } = useVisaOptions()
  const [form, setForm] = useState({ ad: '', soyad: '', phone: '', email: '', country: '', visa_type: '', occupation: '' })
  const [autoPrice, setAutoPrice] = useState<{ price: number; currency: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [limitError, setLimitError] = useState<string | null>(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [visaOpen, setVisaOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const [visaDropPos, setVisaDropPos] = useState({ top: 0, left: 0, width: 0 })
  const [activeTab, setActiveTab] = useState<'tumu' | 'benimkiler'>('tumu')
  const [currentUserId, setCurrentUserId] = useState('')
  const router = useRouter()

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
    if (!form.ad || !form.soyad || !companyId) return
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
        setLimitError(`Bu müşteri zaten kayıtlı: ${existing.full_name}`)
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
      const { data: newApp } = await supabase
        .from('applications')
        .insert({
          company_id: companyId,
          client_id: newClient.id,
          country: form.country,
          visa_type: form.visa_type,
          occupation: form.occupation || null,
          status: 'missing',
        })
        .select()
        .single()

      if (newApp && form.country && form.visa_type) {
        await supabase.rpc('get_visa_documents', {
          p_application_id: newApp.id,
          p_country: form.country,
          p_visa_type: form.visa_type,
          p_occupation: form.occupation || null,
        })
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
      logAction(companyId, user?.id, userData?.full_name || 'Bilinmeyen', 'Yeni müşteri eklendi', 'client', newClient.id, newClient.full_name)

      await fetchData()
      setShowModal(false)
      setForm({ ad: '', soyad: '', phone: '', email: '', country: '', visa_type: '', occupation: '' })
      router.push(`/dashboard/musteriler/${newClient.id}`)
    }
    setSaving(false)
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const visaTypes = visaTypesFor(form.country)

  const displayed = activeTab === 'benimkiler'
    ? filtered.filter(c => c.danisan_id === currentUserId)
    : filtered

  const benimkilerCount = clients.filter(c => c.danisan_id === currentUserId).length

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Müşteriler" />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>
        <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Sekmeler */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f4', flexWrap: 'wrap' }}>
            {([
              { key: 'tumu', label: 'Tüm Müşteriler', count: clients.length },
              { key: 'benimkiler', label: 'Müşterilerim', count: benimkilerCount },
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
            {/* Sağ taraf: arama + filtreler + buton */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center', padding: '6px 0.75rem', flexWrap: 'wrap' }}>
              {!isMobile && (
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim ara..." style={{ padding: '6px 10px', border: '1.5px solid #e2e2e8', borderRadius: '7px', fontSize: '12px', outline: 'none', width: '130px' }} />
              )}
              {!isMobile && (
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px 8px', border: '1.5px solid #e2e2e8', borderRadius: '7px', fontSize: '12px', background: '#f5f5f7', outline: 'none' }}>
                  <option value="">Tüm Durumlar</option>
                  <option value="missing">Evrak Eksik</option>
                  <option value="appointment_waiting">Randevu Bekleniyor</option>
                  <option value="appointment">Randevu Alındı</option>
                  <option value="approved">Onaylandı</option>
                  <option value="rejected">Reddedildi</option>
                </select>
              )}
              <button onClick={() => setShowModal(true)} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Yeni
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead>
              <tr>
                {['Ad Soyad', 'Telefon', 'Ülke', 'Vize Tipi', 'Durum', 'Tarih'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4', background: '#f5f5f7' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>
                    {activeTab === 'benimkiler' ? 'Size atanmış müşteri yok.' : 'Henüz müşteri yok.'}
                  </td>
                </tr>
              )}
              {displayed.map(c => {
                const app = c.applications?.[0]
                const s = statusMap[app?.status] || statusMap.missing
                return (
                  <tr key={c.id} onClick={() => router.push(`/dashboard/musteriler/${c.id}`)} style={{ cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f7')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{c.full_name}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '12px', borderBottom: '1px solid #f0f0f4', color: '#5a6a7a' }}>{c.phone}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0f0f4' }}>{app?.country || '-'}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0f0f4' }}>{app?.visa_type || '-'}</td>
                    <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                      <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#9aaabb', borderBottom: '1px solid #f0f0f4' }}>
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '420px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>Yeni Müşteri Ekle</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ad</label>
                <input value={form.ad} onChange={e => setForm({...form, ad: e.target.value})} placeholder="Ahmet" style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Soyad</label>
                <input value={form.soyad} onChange={e => setForm({...form, soyad: e.target.value})} placeholder="Yılmaz" style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Telefon</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+90 5xx xxx xx xx" style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>E-posta</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ornek@email.com" style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
                <div style={{ position: 'relative' }}>
                  <div onClick={(e) => { const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); setDropPos({ top: r.bottom + 4, left: r.left, width: r.width }); setCountryOpen(!countryOpen); setVisaOpen(false) }} style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.country || 'Seçiniz'}</span>
                    <span style={{ color: '#9aaabb', fontSize: '10px', flexShrink: 0, marginLeft: '4px' }}>▾</span>
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
                <div style={{ position: 'relative' }}>
                  <div onClick={(e) => { const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); setVisaDropPos({ top: r.bottom + 4, left: r.left, width: r.width }); setVisaOpen(!visaOpen); setCountryOpen(false) }} style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.visa_type || 'Seçiniz'}</span>
                    <span style={{ color: '#9aaabb', fontSize: '10px', flexShrink: 0, marginLeft: '4px' }}>▾</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Meslek</label>
              <select
                value={form.occupation}
                onChange={e => setForm({...form, occupation: e.target.value})}
                style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit', color: form.occupation ? '#0d1f35' : '#9aaabb' }}
              >
                <option value="">Meslek Seçin (opsiyonel)</option>
                <option value="calisan">Çalışan</option>
                <option value="sirket_sahibi">İşveren / Serbest Meslek</option>
                <option value="ogrenci">Öğrenci</option>
                <option value="emekli">Emekli</option>
                <option value="ev_hanimi">Çalışmıyor</option>
              </select>
              {form.visa_type === 'Resmi Vize' && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#92600a', background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '6px', padding: '6px 10px', lineHeight: '1.5' }}>
                  ⚠️ Resmi vize yalnızca devlet görevlileri içindir. Hususi (Yeşil) veya Hizmet (Gri) pasaport sahipleri Schengen ülkelerine 90 güne kadar vizesiz seyahat edebilir.
                </div>
              )}
            </div>
            {autoPrice ? (
              <div style={{ background: '#edfaf3', border: '1px solid #a8e6c1', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#1a7a45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Hizmet Bedeli</span>
                <strong>{formatPrice(autoPrice.price, autoPrice.currency)}</strong>
              </div>
            ) : (
              <div style={{ background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#92600a' }}>
                Bu vize tipi için fiyat tanımlanmamış. Admin panelinden ekleyebilirsiniz.
              </div>
            )}
            {limitError && (
              <div style={{ background: '#fef0ee', border: '1px solid #f5c2bb', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#c0392b' }}>
                {limitError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={() => { setShowModal(false); setLimitError(null) }} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={saveClient} disabled={saving} style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Kaydediliyor...' : 'Kaydet ve Profile Git'}
              </button>
            </div>
          </div>
        </div>
      )}

      {countryOpen && (
        <>
          <div onClick={() => setCountryOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, maxHeight: '220px', overflowY: 'scroll', background: 'white', border: '1.5px solid #e2e2e8', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            {countries.map(c => (
              <div key={c} onClick={() => { const firstVisaType = visaTypesFor(c)[0] || ''; setForm({...form, country: c, visa_type: firstVisaType}); setCountryOpen(false) }} style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer', background: form.country === c ? '#eef4fb' : 'white', color: form.country === c ? '#1a5fa5' : '#0d1f35' }}>
                {c}
              </div>
            ))}
          </div>
        </>
      )}
      {visaOpen && (
        <>
          <div onClick={() => setVisaOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: visaDropPos.top, left: visaDropPos.left, width: visaDropPos.width, maxHeight: '180px', overflowY: 'scroll', background: 'white', border: '1.5px solid #e2e2e8', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            {visaTypes.map(v => (
              <div key={v} onClick={() => { setForm({...form, visa_type: v}); setVisaOpen(false) }} style={{ padding: '8px 10px', fontSize: '13px', cursor: 'pointer', background: form.visa_type === v ? '#eef4fb' : 'white', color: form.visa_type === v ? '#1a5fa5' : '#0d1f35' }}>
                {v}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}