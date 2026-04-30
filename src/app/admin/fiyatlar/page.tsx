'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FiyatlarPage() {
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ country: '', visa_type: '', price: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPrices() }, [])

  async function fetchPrices() {
    const { data } = await supabase
      .from('service_prices')
      .select('*')
      .eq('company_id', 'aaaaaaaa-0000-0000-0000-000000000001')
      .order('country')
    setPrices(data || [])
    setLoading(false)
  }

  function openNew() {
    setEditItem(null)
    setForm({ country: '', visa_type: '', price: '' })
    setShowModal(true)
  }

  function openEdit(item: any) {
    setEditItem(item)
    setForm({ country: item.country, visa_type: item.visa_type, price: item.price.toString() })
    setShowModal(true)
  }

  async function save() {
    if (!form.country || !form.visa_type || !form.price) return
    setSaving(true)
    if (editItem) {
      await supabase.from('service_prices').update({ country: form.country, visa_type: form.visa_type, price: parseFloat(form.price) }).eq('id', editItem.id)
    } else {
      await supabase.from('service_prices').insert({ company_id: 'aaaaaaaa-0000-0000-0000-000000000001', country: form.country, visa_type: form.visa_type, price: parseFloat(form.price) })
    }
    setSaving(false)
    setShowModal(false)
    fetchPrices()
  }

  async function deletePrices(id: string) {
    if (!confirm('Bu fiyatı silmek istediğinizden emin misiniz?')) return
    await supabase.from('service_prices').delete().eq('id', id)
    fetchPrices()
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Hizmet Fiyatları</h2>
        <button onClick={openNew} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          + Yeni Fiyat Ekle
        </button>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ background: '#eef4fb', border: '1px solid #b8d4f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', fontSize: '13px', color: '#1a5fa5' }}>
          ℹ️ Yeni başvuru oluşturulduğunda ülke ve vize tipine göre fiyat otomatik olarak atanır.
        </div>

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ülke', 'Vize Tipi', 'Fiyat', 'İşlem'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{p.country}</td>
                  <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>
                    <span style={{ background: '#faf8f3', border: '1px solid #e8e4da', borderRadius: '20px', padding: '3px 10px', fontSize: '12px' }}>{p.visa_type}</span>
                  </td>
                  <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', color: '#1a7a45', borderBottom: '1px solid #f0ede6' }}>
                    {p.price.toLocaleString('tr-TR')}₺
                  </td>
                  <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(p)} style={{ padding: '4px 10px', fontSize: '11px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Düzenle</button>
                      <button onClick={() => deletePrices(p.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer' }}>Sil</button>
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
              {editItem ? 'Fiyatı Düzenle' : 'Yeni Fiyat Ekle'}
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
              <input value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="Schengen, ABD, UK..." style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
              <input value={form.visa_type} onChange={e => setForm({...form, visa_type: e.target.value})} placeholder="Turist, İş, Öğrenci..." style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Fiyat (₺)</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="8500" style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#faf8f3', color: '#5a6a7a', border: '1px solid #e8e4da', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={save} disabled={saving} style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}