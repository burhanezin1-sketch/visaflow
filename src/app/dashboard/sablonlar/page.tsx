'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useIsMobile } from '@/lib/useIsMobile'

type Doc = { doc_name: string; delivery_type: string; description: string }
type Template = {
  id: string
  company_id: string | null
  country: string
  visa_type: string
  occupation: string
  docs: Doc[]
  status: string
  is_global: boolean
  created_at: string
}

const statusBadge: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'İncelemede', bg: '#fff8ec', color: '#92600a' },
  approved: { label: 'Onaylı',     bg: '#edfaf3', color: '#1a7a45' },
  rejected: { label: 'Reddedildi', bg: '#fef0ee', color: '#c0392b' },
}

const deliveryLabels: Record<string, string> = {
  digital:  'Dijital',
  physical: 'Fiziksel',
  firma:    'Firma',
}

const emptyDoc = (): Doc => ({ doc_name: '', delivery_type: 'digital', description: '' })

export default function SablonlarPage() {
  const isMobile = useIsMobile()
  const [global, setGlobal]   = useState<Template[]>([])
  const [mine, setMine]       = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    country: '', visa_type: '', occupation: '',
    docs: [emptyDoc()],
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ud } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      if (ud?.company_id) setCompanyId(ud.company_id)

      const { data: all } = await supabase
        .from('visa_templates')
        .select('*')
        .order('created_at', { ascending: false })

      const tpls = (all || []) as Template[]
      setGlobal(tpls.filter(t => t.is_global && t.status === 'approved'))
      setMine(tpls.filter(t => t.company_id === ud?.company_id))
      setLoading(false)
    }
    load()
  }, [])

  async function clone(tpl: Template) {
    if (!companyId) return
    await supabase.from('visa_templates').insert({
      company_id: companyId,
      country: tpl.country,
      visa_type: tpl.visa_type,
      occupation: tpl.occupation,
      docs: tpl.docs,
      status: 'pending',
      is_global: false,
    })
    window.location.reload()
  }

  async function save() {
    if (!companyId || !form.country || !form.visa_type || !form.occupation) return
    setSaving(true)
    const validDocs = form.docs.filter(d => d.doc_name.trim())
    await supabase.from('visa_templates').insert({
      company_id: companyId,
      country: form.country,
      visa_type: form.visa_type,
      occupation: form.occupation,
      docs: validDocs,
      status: 'pending',
      is_global: false,
    })
    setSaving(false)
    setShowModal(false)
    setForm({ country: '', visa_type: '', occupation: '', docs: [emptyDoc()] })
    window.location.reload()
  }

  function updateDoc(i: number, field: keyof Doc, val: string) {
    setForm(f => {
      const docs = [...f.docs]
      docs[i] = { ...docs[i], [field]: val }
      return { ...f, docs }
    })
  }

  function addDoc() { setForm(f => ({ ...f, docs: [...f.docs, emptyDoc()] })) }
  function removeDoc(i: number) {
    setForm(f => ({ ...f, docs: f.docs.filter((_, idx) => idx !== i) }))
  }

  const cardStyle: React.CSSProperties = {
    background: 'white', border: '1px solid #e8e4da', borderRadius: '10px',
    padding: '14px 16px', marginBottom: '10px',
  }

  function TemplateCard({ t, actions }: { t: Template; actions?: React.ReactNode }) {
    const expanded = expandedId === t.id
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d1f35' }}>
              {t.country} · {t.visa_type}
            </div>
            <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>
              {t.occupation} · {t.docs.length} evrak
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
            {statusBadge[t.status] && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                background: statusBadge[t.status].bg, color: statusBadge[t.status].color }}>
                {statusBadge[t.status].label}
              </span>
            )}
            {actions}
            <button onClick={() => setExpandedId(expanded ? null : t.id)}
              style={{ fontSize: '11px', padding: '4px 8px', background: '#f5f5f7', border: '1px solid #e2e2e8',
                borderRadius: '6px', cursor: 'pointer', color: '#5a6a7a' }}>
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
        {expanded && (
          <div style={{ marginTop: '12px', borderTop: '1px solid #f0ede6', paddingTop: '10px' }}>
            {(t.docs as Doc[]).map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start',
                padding: '6px 0', borderBottom: i < t.docs.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: d.delivery_type === 'physical' ? '#fef0ee' : d.delivery_type === 'firma' ? '#f0f4ff' : '#edfaf3',
                  color: d.delivery_type === 'physical' ? '#c0392b' : d.delivery_type === 'firma' ? '#2563eb' : '#1a7a45',
                  flexShrink: 0, marginTop: '2px' }}>
                  {deliveryLabels[d.delivery_type] || d.delivery_type}
                </span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#0d1f35' }}>{d.doc_name}</div>
                  {d.description && <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{d.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Şablon Kütüphanesi" />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        {loading ? (
          <div style={{ color: '#9aaabb', fontSize: '13px' }}>Yükleniyor...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

            {/* Sol: Global kütüphane */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d1f35', marginBottom: '12px' }}>
                📚 Kütüphane Şablonları
              </div>
              {global.length === 0 && (
                <div style={{ fontSize: '12px', color: '#9aaabb' }}>Henüz onaylı şablon yok.</div>
              )}
              {global.map(t => (
                <TemplateCard key={t.id} t={t} actions={
                  <button onClick={() => clone(t)}
                    style={{ fontSize: '11px', padding: '4px 10px', background: '#1a3a5c', color: 'white',
                      border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Klonla
                  </button>
                } />
              ))}
            </div>

            {/* Sağ: Kendi şablonlarım */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d1f35' }}>
                  🗂 Kendi Şablonlarım
                </div>
                <button onClick={() => setShowModal(true)}
                  style={{ fontSize: '12px', padding: '6px 14px', background: '#1a3a5c', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  + Yeni Şablon
                </button>
              </div>
              {mine.length === 0 && (
                <div style={{ fontSize: '12px', color: '#9aaabb' }}>Henüz şablon oluşturmadınız.</div>
              )}
              {mine.map(t => <TemplateCard key={t.id} t={t} />)}
            </div>

          </div>
        )}
      </div>

      {/* Yeni Şablon Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '14px', width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f35', marginBottom: '16px' }}>
              Yeni Şablon Oluştur
            </div>

            {(['country', 'visa_type', 'occupation'] as const).map(field => (
              <div key={field} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb',
                  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                  {field === 'country' ? 'Ülke' : field === 'visa_type' ? 'Vize Türü' : 'Meslek'}
                </label>
                <input value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e2e8',
                    borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ fontSize: '11px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase',
              letterSpacing: '0.8px', margin: '16px 0 8px' }}>
              Evraklar
            </div>

            {form.docs.map((d, i) => (
              <div key={i} style={{ background: '#faf8f3', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                <input placeholder="Evrak adı"
                  value={d.doc_name}
                  onChange={e => updateDoc(i, 'doc_name', e.target.value)}
                  style={{ width: '100%', padding: '7px 9px', border: '1px solid #e2e2e8', borderRadius: '6px',
                    fontSize: '12px', marginBottom: '6px', boxSizing: 'border-box', outline: 'none' }} />
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <select value={d.delivery_type}
                    onChange={e => updateDoc(i, 'delivery_type', e.target.value)}
                    style={{ flex: 1, padding: '7px', border: '1px solid #e2e2e8', borderRadius: '6px',
                      fontSize: '12px', outline: 'none', background: 'white' }}>
                    <option value="digital">Dijital</option>
                    <option value="physical">Fiziksel</option>
                    <option value="firma">Firma</option>
                  </select>
                  <button onClick={() => removeDoc(i)}
                    style={{ padding: '4px 10px', background: '#fef0ee', color: '#c0392b', border: 'none',
                      borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    ✕
                  </button>
                </div>
                <input placeholder="Açıklama (opsiyonel)"
                  value={d.description}
                  onChange={e => updateDoc(i, 'description', e.target.value)}
                  style={{ width: '100%', padding: '7px 9px', border: '1px solid #e2e2e8', borderRadius: '6px',
                    fontSize: '12px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            ))}

            <button onClick={addDoc}
              style={{ width: '100%', padding: '8px', background: '#f5f5f7', border: '1.5px dashed #e2e2e8',
                borderRadius: '8px', fontSize: '12px', color: '#5a6a7a', cursor: 'pointer', marginBottom: '16px' }}>
              + Evrak Ekle
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a',
                  border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                İptal
              </button>
              <button onClick={save} disabled={saving}
                style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                {saving ? 'Kaydediliyor...' : 'Kaydet (İncelemeye Gönder)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
