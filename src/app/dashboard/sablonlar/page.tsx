'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useIsMobile } from '@/lib/useIsMobile'
import { logAction } from '@/lib/activityLog'
import { useTranslations } from 'next-intl'

type Doc = { doc_name: string; delivery_type: string; description: string }
type Template = {
  id: string
  company_id: string | null
  country: string
  visa_type: string
  occupation: string
  nationality?: string
  docs: Doc[]
  status: 'pending' | 'approved' | 'rejected'
  is_global: boolean
  created_at: string
}

const DELIVERY_COLORS: Record<string, { bg: string; color: string }> = {
  digital:  { bg: '#edfaf3', color: '#1a7a45' },
  physical: { bg: '#fef0ee', color: '#c0392b' },
  firma:    { bg: '#f0f4ff', color: '#2563eb' },
}

const emptyDoc = (): Doc => ({ doc_name: '', delivery_type: 'digital', description: '' })

export default function SablonlarPage() {
  const isMobile = useIsMobile()
  const t = useTranslations('sablonlar')
  const tc = useTranslations('common')
  const tf = useTranslations('fields')
  const [globalTpls, setGlobalTpls] = useState<Template[]>([])
  const [myTpls, setMyTpls]         = useState<Template[]>([])
  const [companyId, setCompanyId]   = useState<string | null>(null)
  const [userId, setUserId]         = useState<string | null>(null)
  const [userName, setUserName]     = useState('')
  const [loading, setLoading]       = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal]   = useState(false)
  const [editTpl, setEditTpl]       = useState<Template | null>(null)
  const [saving, setSaving]         = useState(false)
  const [form, setForm] = useState({ country: '', visa_type: '', occupation: '', nationality: 'Türkiye Cumhuriyeti', docs: [emptyDoc()] })

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data: ud } = await supabase.from('users').select('company_id, full_name').eq('id', user.id).single()
    const cid = ud?.company_id ?? null
    setCompanyId(cid)
    setUserName(ud?.full_name || user.email || '')

    const { data } = await supabase
      .from('visa_templates').select('*').order('created_at', { ascending: false })

    const all = (data || []) as Template[]
    setGlobalTpls(all.filter(tp => tp.is_global && tp.status === 'approved'))
    setMyTpls(all.filter(tp => tp.company_id === cid))
    setLoading(false)
  }

  function openNew() {
    setEditTpl(null)
    setForm({ country: '', visa_type: '', occupation: '', nationality: 'Türkiye Cumhuriyeti', docs: [emptyDoc()] })
    setShowModal(true)
  }

  function openEdit(tp: Template) {
    setEditTpl(tp)
    setForm({ country: tp.country, visa_type: tp.visa_type, occupation: tp.occupation, nationality: tp.nationality || 'Türkiye Cumhuriyeti', docs: tp.docs.length ? tp.docs : [emptyDoc()] })
    setShowModal(true)
  }

  async function save() {
    if (!companyId || !form.country || !form.visa_type || !form.occupation) return
    setSaving(true)
    const validDocs = form.docs.filter(d => d.doc_name.trim())
    if (editTpl) {
      await supabase.from('visa_templates').update({
        country: form.country, visa_type: form.visa_type,
        occupation: form.occupation, nationality: form.nationality || 'Türkiye Cumhuriyeti',
        docs: validDocs,
      }).eq('id', editTpl.id)
    } else {
      await supabase.from('visa_templates').insert({
        company_id: companyId, country: form.country,
        visa_type: form.visa_type, occupation: form.occupation,
        nationality: form.nationality || 'Türkiye Cumhuriyeti',
        docs: validDocs, status: 'approved', is_global: false,
      })
      logAction(
        companyId,
        userId,
        userName,
        `${userName} tarafından ${form.country} + ${form.visa_type} + ${form.occupation} (${form.nationality || 'Türkiye Cumhuriyeti'}) şablonu oluşturuldu`,
        'visa_template',
        null,
        `${form.country} + ${form.visa_type} + ${form.occupation}`
      )
    }
    setSaving(false)
    setShowModal(false)
    init()
  }

  async function del(id: string) {
    if (!confirm(t('actions.deleteConfirm'))) return
    const { data: deleted, error } = await supabase
      .from('visa_templates')
      .delete()
      .eq('id', id)
      .select('id')
    if (error) {
      alert('Silme başarısız: ' + error.message)
      return
    }
    if (!deleted || deleted.length === 0) {
      alert('Silme başarısız: RLS politikası engelledi. Migration uygulandı mı kontrol edin.')
      return
    }
    init()
  }

  async function clone(tp: Template) {
    if (!companyId) return
    await supabase.from('visa_templates').insert({
      company_id: companyId, country: tp.country,
      visa_type: tp.visa_type, occupation: tp.occupation,
      nationality: tp.nationality || 'Türkiye Cumhuriyeti',
      docs: tp.docs, status: 'pending', is_global: false,
    })
    init()
  }

  function updateDoc(i: number, field: keyof Doc, val: string) {
    setForm(f => { const d = [...f.docs]; d[i] = { ...d[i], [field]: val }; return { ...f, docs: d } })
  }
  function addDoc() { setForm(f => ({ ...f, docs: [...f.docs, emptyDoc()] })) }
  function removeDoc(i: number) { setForm(f => ({ ...f, docs: f.docs.filter((_, j) => j !== i) })) }

  function DocList({ docs }: { docs: Doc[] }) {
    const deliveryLabels: Record<string, string> = {
      digital:  t('delivery.digital'),
      physical: t('delivery.physical'),
      firma:    t('delivery.firma'),
    }
    return (
      <div style={{ marginTop: '10px', borderTop: '1px solid #f0ede6', paddingTop: '8px' }}>
        {docs.map((d, i) => {
          const dc = DELIVERY_COLORS[d.delivery_type] || DELIVERY_COLORS.digital
          return (
            <div key={i} style={{ display: 'flex', gap: '8px', padding: '5px 0',
              borderBottom: i < docs.length - 1 ? '1px solid #faf8f3' : 'none' }}>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                background: dc.bg, color: dc.color, fontWeight: '600' }}>
                {deliveryLabels[d.delivery_type] || d.delivery_type}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#0d1f35' }}>{d.doc_name}</div>
                {d.description && <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '1px' }}>{d.description}</div>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function Card({ tp, actions }: { tp: Template; actions?: React.ReactNode }) {
    const expanded = expandedId === tp.id
    const STATUS: Record<string, { label: string; bg: string; color: string }> = {
      pending:  { label: t('status.pending'),  bg: '#fff8ec', color: '#92600a' },
      approved: { label: t('status.approved'), bg: '#edfaf3', color: '#1a7a45' },
      rejected: { label: t('status.rejected'), bg: '#fef0ee', color: '#c0392b' },
    }
    const st = STATUS[tp.status]
    return (
      <div style={{ background: '#f7f9fd', border: '1px solid rgba(188,204,226,0.5)', borderRadius: '12px',
        padding: '12px 14px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d1f35', marginBottom: '2px' }}>
              {tp.country} · {tp.visa_type}
            </div>
            <div style={{ fontSize: '11px', color: '#9aaabb' }}>
              {tp.occupation} · {tp.nationality || 'Türkiye Cumhuriyeti'} · {t('docCount', { count: (tp.docs || []).length })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {st && (
              <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                background: st.bg, color: st.color }}>
                {st.label}
              </span>
            )}
            {actions}
            <button onClick={() => setExpandedId(expanded ? null : tp.id)}
              style={{ fontSize: '11px', padding: '4px 8px', background: '#f5f5f7', border: '1px solid #e2e2e8',
                borderRadius: '6px', cursor: 'pointer', color: '#5a6a7a' }}>
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
        {expanded && <DocList docs={tp.docs || []} />}
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 10px', border: '1.5px solid rgba(188,204,226,0.6)',
    borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
    background: '#f7f9fd',
  }

  const toTitleCase = (str: string) => str.replace(/(?:^|\s)\S/g, c => c.toUpperCase())

  const fieldLabels = [
    { key: 'country',     label: tf('country') },
    { key: 'visa_type',   label: tf('visaType') },
    { key: 'occupation',  label: tf('occupation') },
    { key: 'nationality', label: tf('nationality') },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={t('pageTitle')} />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e9eef6' }}>
        {loading ? <div style={{ color: '#9aaabb', fontSize: '13px' }}>{tc('loading')}</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

            {/* Sol: Kütüphane */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d1f35', marginBottom: '12px' }}>
                {t('library.title')}
              </div>
              {globalTpls.length === 0
                ? <div style={{ fontSize: '12px', color: '#9aaabb' }}>{t('library.empty')}</div>
                : globalTpls.map(tp => (
                  <Card key={tp.id} tp={tp} actions={
                    <button onClick={() => clone(tp)}
                      style={{ fontSize: '11px', padding: '4px 10px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {t('actions.clone')}
                    </button>
                  } />
                ))
              }
            </div>

            {/* Sağ: Kendi şablonlarım */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0d1f35' }}>{t('myTemplates.title')}</div>
                <button onClick={openNew}
                  style={{ fontSize: '12px', padding: '6px 14px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  {t('myTemplates.newBtn')}
                </button>
              </div>
              {myTpls.length === 0
                ? <div style={{ fontSize: '12px', color: '#9aaabb' }}>{t('myTemplates.empty')}</div>
                : myTpls.map(tp => (
                  <Card key={tp.id} tp={tp} actions={
                    !tp.is_global ? (
                      <>
                        <button onClick={() => openEdit(tp)}
                          style={{ fontSize: '11px', padding: '4px 8px', background: '#f5f5f7', color: '#0d1f35',
                            border: '1px solid #e2e2e8', borderRadius: '6px', cursor: 'pointer' }}>
                          {t('actions.edit')}
                        </button>
                        <button onClick={() => del(tp.id)}
                          style={{ fontSize: '11px', padding: '4px 8px', background: '#fef0ee', color: '#c0392b',
                            border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          {t('actions.delete')}
                        </button>
                      </>
                    ) : undefined
                  } />
                ))
              }
            </div>

          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#f7f9fd', borderRadius: '16px', width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 16px 48px rgba(15,23,42,0.15)' }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#0d1f35', marginBottom: '16px' }}>
              {editTpl ? t('modal.editTitle') : t('modal.createTitle')}
            </div>

            {fieldLabels.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb',
                  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</label>
                <input value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: toTitleCase(e.target.value) }))}
                  placeholder={key === 'nationality' ? 'Türkiye Cumhuriyeti' : undefined}
                  style={inputStyle} />
              </div>
            ))}

            <div style={{ fontSize: '11px', fontWeight: '600', color: '#9aaabb',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: '16px 0 8px' }}>
              {t('modal.docsSection')}
            </div>

            {form.docs.map((d, i) => (
              <div key={i} style={{ background: '#e9eef6', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                <input placeholder={t('modal.docNamePlaceholder')} value={d.doc_name}
                  onChange={e => updateDoc(i, 'doc_name', e.target.value)}
                  style={{ ...inputStyle, marginBottom: '6px' }} />
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <select value={d.delivery_type}
                    onChange={e => updateDoc(i, 'delivery_type', e.target.value)}
                    style={{ flex: 1, padding: '9px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px',
                      fontSize: '13px', outline: 'none', background: 'white' }}>
                    <option value="digital">{t('delivery.digital')}</option>
                    <option value="physical">{t('delivery.physical')}</option>
                    <option value="firma">{t('delivery.firma')}</option>
                  </select>
                  <button onClick={() => removeDoc(i)}
                    style={{ padding: '4px 12px', background: '#fef0ee', color: '#c0392b',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                </div>
                <input placeholder={t('modal.docDescPlaceholder')} value={d.description}
                  onChange={e => updateDoc(i, 'description', e.target.value)}
                  style={inputStyle} />
              </div>
            ))}

            <button onClick={addDoc}
              style={{ width: '100%', padding: '8px', background: '#f5f5f7',
                border: '1.5px dashed #d0d0d8', borderRadius: '8px', fontSize: '12px',
                color: '#5a6a7a', cursor: 'pointer', marginBottom: '16px' }}>
              {t('modal.addDoc')}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a',
                  border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                {tc('cancel')}
              </button>
              <button onClick={save} disabled={saving || !form.country || !form.visa_type || !form.occupation}
                style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? tc('saving') : editTpl ? t('modal.submitEdit') : t('modal.submitCreate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
