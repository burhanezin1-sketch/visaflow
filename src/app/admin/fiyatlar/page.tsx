'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'

const CURRENCY_SYMBOL: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' }

function formatPrice(price: number, currency: string = 'TRY') {
  const sym = CURRENCY_SYMBOL[currency] || currency
  if (currency === 'TRY') return `${price.toLocaleString('tr-TR')}${sym}`
  return `${sym}${price.toLocaleString('en-US')}`
}

export default function FiyatlarPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [prices, setPrices] = useState<any[]>([])
  const [visaOptions, setVisaOptions] = useState<{ country: string; visa_type: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ country: '', visa_type: '', price: '', currency: 'TRY' })
  const [saving, setSaving] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [visaOpen, setVisaOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const [visaDropPos, setVisaDropPos] = useState({ top: 0, left: 0, width: 0 })

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

  function fetchVisaOptions() {
    const ALL_COUNTRIES = [
      'Almanya', 'Amerika Birleşik Devletleri', 'Avusturya', 'Belçika', 'Bulgaristan',
      'Danimarka', 'Estonya', 'Finlandiya', 'Fransa', 'Güney Kore',
      'Hırvatistan', 'Hollanda', 'İngiltere', 'İrlanda', 'İspanya', 'İsveç', 'İtalya',
      'Japonya', 'Kanada', 'Letonya', 'Litvanya', 'Lüksemburg',
      'Macaristan', 'Malta', 'Polonya', 'Portekiz', 'Romanya',
      'Slovakya', 'Slovenya', 'Yunanistan', 'Çekya',
    ]
    const VISA_TYPES = ['Aile/Arkadaş Ziyareti', 'Çalışma/İş Vizesi', 'Eğitim/Öğrenci', 'Ticari/İş', 'Turistik']
    setVisaOptions(ALL_COUNTRIES.flatMap(country => VISA_TYPES.map(visa_type => ({ country, visa_type }))))
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
        currency: form.currency,
      }).eq('id', editItem.id)
    } else {
      await supabase.from('service_prices').insert({
        company_id: companyId,
        country: form.country,
        visa_type: form.visa_type,
        price: parseFloat(form.price),
        currency: form.currency,
      })
    }
    setSaving(false)
    setShowModal(false)
    setEditItem(null)
    setForm({ country: '', visa_type: '', price: '', currency: 'TRY' })
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
    setForm({ country: firstCountry, visa_type: firstVisa, price: '', currency: 'TRY' })
    setShowModal(true)
  }

  function openEdit(p: any) {
    setEditItem(p)
    setForm({ country: p.country, visa_type: p.visa_type, price: p.price.toString(), currency: p.currency || 'TRY' })
    setShowModal(true)
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Hizmet Fiyatları</h2>
        <button onClick={openAdd} style={{ padding: isMobile ? '6px 10px' : '7px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          + Fiyat Ekle
        </button>
      </div>
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>
        <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  {['Ülke', 'Vize Tipi', 'Fiyat', 'Para Birimi', ''].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4', background: '#f5f5f7' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prices.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>
                      Henüz fiyat eklenmemiş. "+ Fiyat Ekle" ile başlayın.
                    </td>
                  </tr>
                )}
                {prices.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{p.country}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0f0f4', color: '#5a6a7a' }}>{p.visa_type}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #f0f0f4', color: '#1a7a45' }}>{formatPrice(p.price, p.currency)}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '12px', borderBottom: '1px solid #f0f0f4', color: '#9aaabb' }}>
                      <span style={{ background: '#f0f0f4', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>{p.currency || 'TRY'}</span>
                    </td>
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
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: isMobile ? '16px 16px 0 0' : '16px', padding: isMobile ? '1.25rem' : '2rem', width: isMobile ? '100%' : '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '600', marginBottom: '1.25rem', color: '#0d1f35' }}>
              {editItem ? 'Fiyat Düzenle' : 'Yeni Fiyat Ekle'}
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
              <div style={{ position: 'relative' }}>
                <div onClick={(e) => { const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); setDropPos({ top: r.bottom + 4, left: r.left, width: r.width }); setCountryOpen(!countryOpen); setVisaOpen(false) }} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
                  <span>{form.country || 'Seçiniz'}</span>
                  <span style={{ color: '#9aaabb', fontSize: '10px' }}>▾</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
              <div style={{ position: 'relative' }}>
                <div onClick={(e) => { const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); setVisaDropPos({ top: r.bottom + 4, left: r.left, width: r.width }); setVisaOpen(!visaOpen); setCountryOpen(false) }} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
                  <span>{form.visa_type || 'Seçiniz'}</span>
                  <span style={{ color: '#9aaabb', fontSize: '10px' }}>▾</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '1.25rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Fiyat</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="8500"
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Birim</label>
                <select
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                  style={{ padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit', fontWeight: '600' }}
                >
                  <option value="TRY">₺ TRY</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
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

      {countryOpen && (
        <>
          <div onClick={() => setCountryOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, maxHeight: '220px', overflowY: 'scroll', background: 'white', border: '1.5px solid #e2e2e8', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            {countries.map(c => (
              <div key={c} onClick={() => { const firstVisa = visaOptions.find(v => v.country === c)?.visa_type || ''; setForm({ ...form, country: c, visa_type: firstVisa }); setCountryOpen(false) }} style={{ padding: '9px 12px', fontSize: '13px', cursor: 'pointer', background: form.country === c ? '#eef4fb' : 'white', color: form.country === c ? '#1a5fa5' : '#0d1f35' }}>
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
              <div key={v} onClick={() => { setForm({ ...form, visa_type: v }); setVisaOpen(false) }} style={{ padding: '9px 12px', fontSize: '13px', cursor: 'pointer', background: form.visa_type === v ? '#eef4fb' : 'white', color: form.visa_type === v ? '#1a5fa5' : '#0d1f35' }}>
                {v}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
