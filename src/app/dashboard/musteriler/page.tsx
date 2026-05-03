'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'

const statusMap: any = {
  missing: { label: 'Evrak Eksik', bg: '#fef0ee', color: '#c0392b' },
  appointment_waiting: { label: 'Randevu Bekleniyor', bg: '#fff8ec', color: '#92600a' },
  appointment: { label: 'Randevu Alındı', bg: '#eef4fb', color: '#1a5fa5' },
  approved: { label: 'Onaylandı ✓', bg: '#edfaf3', color: '#1a7a45' },
  rejected: { label: 'Reddedildi ✗', bg: '#fef0ee', color: '#c0392b' },
}

export default function MusterilerPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const [clients, setClients] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [prices, setPrices] = useState<any[]>([])
  const [visaOptions, setVisaOptions] = useState<{ country: string; visa_type: string }[]>([])
  const [form, setForm] = useState({ ad: '', soyad: '', phone: '', email: '', country: 'Schengen', visa_type: 'Turist' })
  const [autoPrice, setAutoPrice] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!companyId) return
    fetchData()
    fetchPrices()
    fetchVisaOptions()
  }, [companyId])

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

  async function fetchVisaOptions() {
    const { data } = await supabase
      .from('visa_documents')
      .select('country, visa_type')
      .order('country', { ascending: true })
    // Distinct country+visa_type kombinasyonları
    const unique = Array.from(
      new Map(data?.map(d => [`${d.country}__${d.visa_type}`, d])).values()
    )
    setVisaOptions(unique || [])
  }

  useEffect(() => {
    let result = clients
    if (search) result = result.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter) result = result.filter(c => c.applications?.[0]?.status === statusFilter)
    setFiltered(result)
  }, [search, statusFilter, clients])

  useEffect(() => {
    const p = prices.find(p => p.country === form.country && p.visa_type === form.visa_type)
    setAutoPrice(p ? p.price : null)
  }, [form.country, form.visa_type, prices])

  async function saveClient() {
    if (!form.ad || !form.soyad || !companyId) return
    setSaving(true)
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
      await supabase.from('applications').insert({
        company_id: companyId,
        client_id: newClient.id,
        country: form.country,
        visa_type: form.visa_type,
        status: 'missing',
      })
      if (autoPrice) {
        await supabase.from('payments').insert({
          company_id: companyId,
          application_id: (await supabase.from('applications').select('id').eq('client_id', newClient.id).single()).data?.id,
          total_amount: autoPrice,
          paid_amount: 0,
        })
      }
      await fetchData()
      setShowModal(false)
      setForm({ ad: '', soyad: '', phone: '', email: '', country: 'Schengen', visa_type: 'Turist' })
      router.push(`/dashboard/musteriler/${newClient.id}`)
    }
    setSaving(false)
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const countries = [...new Set(visaOptions.map(v => v.country))].sort()
  const visaTypes = [...new Set(visaOptions.filter(v => v.country === form.country).map(v => v.visa_type))].sort()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Müşteriler" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>
        <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Tüm Müşteriler</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim ara..." style={{ padding: '7px 12px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '12px', outline: 'none', width: '160px' }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '12px', background: '#f5f5f7', outline: 'none' }}>
                <option value="">Tüm Durumlar</option>
                <option value="missing">Evrak Eksik</option>
                <option value="appointment_waiting">Randevu Bekleniyor</option>
                <option value="appointment">Randevu Alındı</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
              <button onClick={() => setShowModal(true)} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                + Yeni Müşteri
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ad Soyad', 'Telefon', 'Ülke', 'Vize Tipi', 'Durum', 'Tarih'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4', background: '#f5f5f7' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
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
                <select value={form.country} onChange={e => {
                  const newCountry = e.target.value
                  const firstVisaType = visaOptions.find(v => v.country === newCountry)?.visa_type || 'Turist'
                  setForm({...form, country: newCountry, visa_type: firstVisaType})
                }} style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}>
                  {countries.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
                <select value={form.visa_type} onChange={e => setForm({...form, visa_type: e.target.value})} style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}>
                  {visaTypes.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            {autoPrice && (
              <div style={{ background: '#edfaf3', border: '1px solid #a8e6c1', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '13px', color: '#1a7a45', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Hizmet Bedeli</span>
                <strong>{autoPrice.toLocaleString('tr-TR')}₺</strong>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={saveClient} disabled={saving} style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Kaydediliyor...' : 'Kaydet ve Profile Git'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}