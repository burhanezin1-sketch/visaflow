'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import Topbar from '@/components/Topbar'

export default function FiyatlarPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const [prices, setPrices] = useState<any[]>([])
  const [visaOptions, setVisaOptions] = useState<{ country: string; visa_type: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ country: '', visa_type: '', price: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!companyId) return
    fetchData()
    fetchVisaOptions()
  }, [companyId])

  async function fetchData() {
    const { data } = await supabase
      .from('service_prices')
      .select('*')
      .eq('company_id', companyId)
      .order('country')
    setPrices(data || [])
    setLoading(false)
  }

  async function fetchVisaOptions() {
    const { data } = await supabase
      .from('visa_documents')
      .select('country, visa_type')
      .order('country', { ascending: true })
    const unique = Array.from(
      new Map(data?.map(d => [`${d.country}__${d.visa_type}`, d])).values()
    )
    setVisaOptions(unique || [])
  }

  const countries = [...new Set(visaOptions.map(v => v.country))].sort()
  const visaTypes = [...new Set(visaOptions.filter(v => v.country === form.country).map(v => v.visa_type))].sort()

  async function save() {
    if (!form.country || !form.visa_type || !form.price || !companyId) return
    setSaving(true)
    if (editItem) {
      await supabase.from('service_prices').update({
        country: form.country,
        visa_type: form.visa_type,
        price: parseFloat(form.price),
      }).eq('id', editItem.id)
    } else {
      await supabase.from('service_prices').insert({
        company_id: companyId,
        country: form.country,
        visa_type: form.visa_type,
        price: parseFloat(form.price),
      })
    }
    setSaving(false)
    setShowModal(false)
    setEditItem(null)
    setForm({ country: '', visa_type: '', price: '' })
    fetchData()
  }

  async function deleteFiyat(id: string) {
    if (!confirm('Bu fiyatı silmek istediğinizden emin misiniz?')) return
    await supabase.from('service_prices').delete().eq('id', id)
    fetchData()
  }

  function openAdd() {
    setEditItem(null)
    const firstCountry = countries[0] || ''
    const firstVisa = visaOptions.find(v => v.country === firstCountry)?.visa_type || ''
    setForm({ country: firstCountry, visa_type: firstVisa, price: '' })
    setShowModal(true)
  }

  function openEdit(p: any) {
    setEditItem(p)
    setForm({ country: p.country, visa_type: p.visa_type, price: p.price.toString() })
    setShowModal(true)
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Hizmet Fiyatları" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={openAdd} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            + Fiyat Ekle
          </button>
        </div>
        <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ülke', 'Vize Tipi', 'Fiyat', ''].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4', background: '#f5f5f7' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>
                    Henüz fiyat eklenmemiş. "+ Fiyat Ekle" ile başlayın.
                  </td>
                </tr>
              )}
              {prices.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{p.country}</td>
                  <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0f0f4', color: '#5a6a7a' }}>{p.visa_type}</td>
                  <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #f0f0f4', color: '#1a7a45' }}>{p.price.toLocaleString('tr-TR')}₺</td>
                  <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(p)} style={{ padding: '4px 10px', fontSize: '11px', background: '#eef4fb', color: '#1a5fa5', border: '1px solid #b8d4f0', borderRadius: '6px', cursor: 'pointer' }}>Düzenle</button>
                      <button onClick={() => deleteFiyat(p.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer' }}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>
              {editItem ? 'Fiyat Düzenle' : 'Yeni Fiyat Ekle'}
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
              <select
                value={form.country}
                onChange={e => {
                  const newCountry = e.target.value
                  const firstVisa = visaOptions.find(v => v.country === newCountry)?.visa_type || ''
                  setForm({ ...form, country: newCountry, visa_type: firstVisa })
                }}
                style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}
              >
                {countries.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
              <select
                value={form.visa_type}
                onChange={e => setForm({ ...form, visa_type: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}
              >
                {visaTypes.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Fiyat (₺)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="8500"
                style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowModal(false); setEditItem(null) }} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Kaydediliyor...' : editItem ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}