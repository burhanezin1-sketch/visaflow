'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'
import { fetchFxRates, amountToTRY, fmtRateNote, type FxRates } from '@/lib/fxRates'

const CUR_SYM: Record<string, string> = { TRY: '₺', USD: '$', EUR: '€' }

function formatPrice(price: number, currency: string = 'TRY') {
  const sym = CUR_SYM[currency] || currency
  if (currency === 'TRY') return `${price.toLocaleString('tr-TR')}${sym}`
  return `${sym}${price.toLocaleString('en-US')}`
}

const toTitleCase = (str: string) =>
  str.replace(/(?:^|\s)\S/g, c => c.toUpperCase())

export default function FiyatlarPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fxRates, setFxRates] = useState<FxRates | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ country: '', visa_type: '', price: '', currency: 'TRY' })
  const [saving, setSaving] = useState(false)
  const [updateToast, setUpdateToast] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId) return
    fetchData()
    fetchFxRates().then(setFxRates)
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

  const rates = fxRates || { EUR_TRY: 0, USD_TRY: 0 }

  function tryEquivalent(price: number, currency: string): string | null {
    if (currency === 'TRY' || !fxRates) return null
    const tryVal = amountToTRY(price, currency, rates)
    if (!tryVal) return null
    return `≈ ${tryVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺`
  }

  async function save() {
    if (!form.country || !form.visa_type || !form.price || !companyId) return
    setSaving(true)
    const newPrice = parseFloat(form.price)
    const newCurrency = form.currency

    if (editItem) {
      await supabase.from('service_prices').update({
        country: form.country,
        visa_type: form.visa_type,
        price: newPrice,
        currency: newCurrency,
      }).eq('id', editItem.id)
    } else {
      await supabase.from('service_prices').insert({
        company_id: companyId,
        country: form.country,
        visa_type: form.visa_type,
        price: newPrice,
        currency: newCurrency,
      })
    }

    // Eşleşen uygulamaların ödemelerini güncelle (tam ödenmemişler)
    let updatedCount = 0
    try {
      const { data: matchingApps } = await supabase
        .from('applications')
        .select('id')
        .eq('company_id', companyId)
        .ilike('country', form.country)
        .ilike('visa_type', form.visa_type)

      if (matchingApps && matchingApps.length > 0) {
        const appIds = matchingApps.map((a: any) => a.id)
        const { data: existingPayments } = await supabase
          .from('payments')
          .select('id, total_amount, paid_amount')
          .in('application_id', appIds)

        const toUpdate = (existingPayments || [])
          .filter(p => p.paid_amount < p.total_amount)
          .map(p => p.id)

        if (toUpdate.length > 0) {
          await supabase
            .from('payments')
            .update({ total_amount: newPrice, currency: newCurrency })
            .in('id', toUpdate)
          updatedCount = toUpdate.length
        }
      }
    } catch (err) {
      console.error('[fiyatlar] ödeme güncelleme hatası:', err)
    }

    setSaving(false)
    setShowModal(false)
    setEditItem(null)
    setForm({ country: '', visa_type: '', price: '', currency: 'TRY' })
    fetchData()

    const msg = updatedCount > 0
      ? `✓ Fiyat güncellendi — ${updatedCount} müşterinin ödemesi otomatik güncellendi`
      : '✓ Fiyat kaydedildi'
    setUpdateToast(msg)
    setTimeout(() => setUpdateToast(null), 4000)
  }

  async function deleteFiyat(id: string) {
    if (!confirm('Bu fiyatı silmek istediğinizden emin misiniz?')) return
    await supabase.from('service_prices').delete().eq('id', id)
    fetchData()
  }

  function openAdd() {
    setEditItem(null)
    setForm({ country: '', visa_type: '', price: '', currency: 'TRY' })
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

  const rateNote = fmtRateNote(rates)
  const formPrice = parseFloat(form.price)
  const formTRY = !isNaN(formPrice) && form.price !== '' && form.currency !== 'TRY'
    ? tryEquivalent(formPrice, form.currency)
    : null

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', border: '1.5px solid #e2e2e8',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: '600',
    color: '#9aaabb', marginBottom: '5px',
    textTransform: 'uppercase', letterSpacing: '0.8px',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Toast */}
      {updateToast && (
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: '#1a7a45', color: 'white', padding: '10px 20px', borderRadius: '8px',
          fontSize: '13px', fontWeight: '500', zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '90vw', textAlign: 'center',
        }}>
          {updateToast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Hizmet Fiyatları</h2>
          {rateNote && <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{rateNote}</div>}
        </div>
        <button onClick={openAdd} style={{ padding: isMobile ? '6px 10px' : '7px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          + Fiyat Ekle
        </button>
      </div>

      {/* Table */}
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>
        <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  {['Ülke', 'Vize Tipi', 'Fiyat', 'TL Karşılığı', ''].map(h => (
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
                {prices.map(p => {
                  const tryEq = tryEquivalent(p.price, p.currency || 'TRY')
                  return (
                    <tr key={p.id}>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{p.country}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0f0f4', color: '#5a6a7a' }}>{p.visa_type}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid #f0f0f4', color: '#1a7a45' }}>
                        {formatPrice(p.price, p.currency || 'TRY')}
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', borderBottom: '1px solid #f0f0f4', color: '#9aaabb' }}>
                        {tryEq ?? <span style={{ color: '#d0d0d8' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEdit(p)} style={{ padding: '4px 10px', fontSize: '11px', background: '#eef4fb', color: '#1a5fa5', border: '1px solid #b8d4f0', borderRadius: '6px', cursor: 'pointer' }}>Düzenle</button>
                          <button onClick={() => deleteFiyat(p.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer' }}>Sil</button>
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: isMobile ? '16px 16px 0 0' : '16px', padding: isMobile ? '1.25rem' : '2rem', width: isMobile ? '100%' : '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '600', marginBottom: '1.25rem', color: '#0d1f35' }}>
              {editItem ? 'Fiyat Düzenle' : 'Yeni Fiyat Ekle'}
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Ülke</label>
              <input
                value={form.country}
                onChange={e => setForm({ ...form, country: toTitleCase(e.target.value) })}
                placeholder="ör. Fransa"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Vize Tipi</label>
              <input
                value={form.visa_type}
                onChange={e => setForm({ ...form, visa_type: toTitleCase(e.target.value) })}
                placeholder="ör. Turist Vizesi"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: formTRY ? '6px' : '1.25rem', alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>Fiyat</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="8500"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Birim</label>
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

            {formTRY && (
              <div style={{ background: '#edfaf3', border: '1px solid #a8e6c1', borderRadius: '7px', padding: '7px 12px', marginBottom: '1.25rem', fontSize: '12px', color: '#1a7a45', display: 'flex', justifyContent: 'space-between' }}>
                <span>Anlık TL karşılığı</span>
                <strong>{formTRY}</strong>
              </div>
            )}

            {editItem && (
              <div style={{ background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '7px', padding: '7px 12px', marginBottom: '12px', fontSize: '11px', color: '#92600a', lineHeight: '1.5' }}>
                ⚠️ Kaydettiğinizde bu ülke+vize tipine sahip henüz tam ödenmemiş müşterilerin ödemesi otomatik güncellenecektir.
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowModal(false); setEditItem(null) }} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                İptal
              </button>
              <button onClick={save} disabled={saving || !form.country || !form.visa_type || !form.price} style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving || !form.country || !form.visa_type || !form.price ? 0.7 : 1 }}>
                {saving ? 'Kaydediliyor...' : editItem ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
