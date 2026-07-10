'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const S = {
  bg: '#0f172a', sidebar: '#1e293b', card: '#1e293b',
  border: 'rgba(255,255,255,0.08)', accent: '#3b82f6',
  text: 'rgba(255,255,255,0.92)', muted: 'rgba(255,255,255,0.5)',
  faint: 'rgba(255,255,255,0.25)',
}

const inpS: React.CSSProperties = {
  width: '100%', padding: '9px 10px', border: `1px solid ${S.border}`,
  borderRadius: '8px', fontSize: '13px', background: '#273548',
  color: S.text, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

type Price = {
  id: string; service_name: string; price: number; currency: string
  nationality: string; description: string | null; is_active: boolean; created_at: string
}

const emptyForm = { service_name: '', price: '', currency: 'TL', nationality: 'Türkiye Cumhuriyeti', description: '' }

export default function HizmetFiyatlariPage() {
  const router = useRouter()
  const [prices, setPrices]     = useState<Price[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]  = useState<Price | null>(null)
  const [form, setForm]          = useState(emptyForm)
  const [saving, setSaving]      = useState(false)
  const [deleting, setDeleting]  = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/superadmin/login'); return }
      const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
      if (!sa) { router.push('/superadmin/login'); return }
      fetchData()
    })
  }, [])

  async function fetchData() {
    const { data } = await supabase.from('global_service_prices').select('*').order('service_name')
    setPrices(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditItem(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(p: Price) {
    setEditItem(p)
    setForm({ service_name: p.service_name, price: String(p.price), currency: p.currency, nationality: p.nationality, description: p.description || '' })
    setShowModal(true)
  }

  async function save() {
    if (!form.service_name.trim() || !form.price) return
    setSaving(true)
    const payload = {
      service_name: form.service_name.trim(),
      price: parseFloat(form.price),
      currency: form.currency,
      nationality: form.nationality.trim() || 'Türkiye Cumhuriyeti',
      description: form.description.trim() || null,
    }
    if (editItem) {
      await supabase.from('global_service_prices').update(payload).eq('id', editItem.id)
    } else {
      await supabase.from('global_service_prices').insert(payload)
    }
    setSaving(false)
    setShowModal(false)
    fetchData()
  }

  async function toggleActive(p: Price) {
    await supabase.from('global_service_prices').update({ is_active: !p.is_active }).eq('id', p.id)
    setPrices(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x))
  }

  async function del(id: string) {
    if (!confirm('Bu fiyatı silmek istediğinizden emin misiniz?')) return
    setDeleting(id)
    await supabase.from('global_service_prices').delete().eq('id', id)
    setPrices(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const thS: React.CSSProperties = { padding: '10px 14px', fontSize: '10px', color: S.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'left', borderBottom: `1px solid ${S.border}`, background: '#162032', whiteSpace: 'nowrap' }
  const tdS: React.CSSProperties = { padding: '12px 14px', fontSize: '13px', color: S.text, borderBottom: `1px solid ${S.border}` }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: 'system-ui, sans-serif', color: S.text }}>
      {/* Header */}
      <div style={{ background: S.sidebar, borderBottom: `1px solid ${S.border}`, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/superadmin/dashboard')} style={{ background: 'transparent', border: 'none', color: S.muted, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', padding: 0 }}>
            ← Geri
          </button>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>💰 Hizmet Fiyatları</h2>
        </div>
        <button onClick={openAdd} style={{ padding: '7px 16px', background: S.accent, color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
          + Hizmet Ekle
        </button>
      </div>

      {/* Table */}
      <div style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: S.muted }}>Yükleniyor...</div>
        ) : (
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Hizmet Adı', 'Fiyat', 'Para Birimi', 'Uyruk', 'Açıklama', 'Durum', ''].map(h => (
                      <th key={h} style={thS}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prices.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...tdS, textAlign: 'center', color: S.muted, padding: '2.5rem' }}>Henüz hizmet fiyatı eklenmemiş.</td></tr>
                  ) : prices.map(p => (
                    <tr key={p.id}>
                      <td style={{ ...tdS, fontWeight: '600' }}>{p.service_name}</td>
                      <td style={tdS}>{p.price.toLocaleString('tr-TR')}</td>
                      <td style={tdS}>
                        <span style={{ background: p.currency === 'EUR' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.12)', color: p.currency === 'EUR' ? '#60a5fa' : '#4ade80', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                          {p.currency}
                        </span>
                      </td>
                      <td style={{ ...tdS, color: S.muted }}>{p.nationality}</td>
                      <td style={{ ...tdS, color: S.muted, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</td>
                      <td style={tdS}>
                        <button onClick={() => toggleActive(p)} style={{ background: p.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: p.is_active ? '#4ade80' : '#f87171', border: 'none', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {p.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td style={tdS}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => openEdit(p)} style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>Düzenle</button>
                          <button onClick={() => del(p.id)} disabled={deleting === p.id} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', opacity: deleting === p.id ? 0.5 : 1 }}>
                            {deleting === p.id ? '...' : 'Sil'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '16px' }}>
          <div style={{ background: '#1e293b', borderRadius: '14px', padding: '1.75rem', width: '440px', maxWidth: '100%', border: `1px solid ${S.border}` }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '15px', fontWeight: '700', color: S.text }}>
              {editItem ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {([
                { label: 'Hizmet Adı *', key: 'service_name', type: 'text', placeholder: 'örn: Almanya Schengen Vizesi' },
                { label: 'Açıklama', key: 'description', type: 'text', placeholder: 'opsiyonel' },
                { label: 'Uyruk', key: 'nationality', type: 'text', placeholder: 'Türkiye Cumhuriyeti' },
              ] as const).map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
                  <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inpS} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Fiyat *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" style={inpS} min="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: S.muted, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Para Birimi</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={{ ...inpS, cursor: 'pointer' }}>
                    <option value="TL">TL</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', color: S.muted, border: `1px solid ${S.border}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={save} disabled={saving || !form.service_name.trim() || !form.price} style={{ flex: 2, padding: '10px', background: saving ? '#273548' : S.accent, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Kaydediliyor...' : editItem ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
