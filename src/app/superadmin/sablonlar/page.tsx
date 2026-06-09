'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  companies?: { name: string }
}

const deliveryColors: Record<string, string> = {
  digital: '#1a7a45', physical: '#c0392b', firma: '#2563eb',
}

const S = {
  bg: '#0f172a', card: '#1e293b', border: '#334155',
  text: 'white', muted: '#94a3b8', accent: '#6366f1',
}

export default function SuperadminSablonlar() {
  const [pending, setPending]   = useState<Template[]>([])
  const [approved, setApproved] = useState<Template[]>([])
  const [loading, setLoading]   = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')

  async function load() {
    const { data } = await admin
      .from('visa_templates')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })
    const all = (data || []) as Template[]
    setPending(all.filter(t => t.status === 'pending'))
    setApproved(all.filter(t => t.status === 'approved'))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateTemplate(id: string, patch: Partial<Template>) {
    await admin.from('visa_templates').update(patch).eq('id', id)
    load()
  }

  function TemplateRow({ t }: { t: Template }) {
    const expanded = expandedId === t.id
    return (
      <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: '10px',
        padding: '14px 16px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: S.text }}>
              {t.country} · {t.visa_type} · {t.occupation}
            </div>
            <div style={{ fontSize: '11px', color: S.muted, marginTop: '3px' }}>
              {t.companies?.name || 'Firma bilinmiyor'} · {t.docs.length} evrak ·{' '}
              {new Date(t.created_at).toLocaleDateString('tr-TR')}
              {t.is_global && <span style={{ marginLeft: '6px', color: S.accent }}>🌐 Global</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {t.status === 'pending' && (
              <>
                <button onClick={() => updateTemplate(t.id, { status: 'approved' })}
                  style={{ fontSize: '11px', padding: '4px 10px', background: '#1a7a45', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Onayla
                </button>
                <button onClick={() => updateTemplate(t.id, { status: 'rejected' })}
                  style={{ fontSize: '11px', padding: '4px 10px', background: '#c0392b', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Reddet
                </button>
              </>
            )}
            {t.status === 'approved' && !t.is_global && (
              <button onClick={() => updateTemplate(t.id, { is_global: true, status: 'approved' })}
                style={{ fontSize: '11px', padding: '4px 10px', background: S.accent, color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                🌐 Global Yap
              </button>
            )}
            {t.status === 'approved' && t.is_global && (
              <button onClick={() => updateTemplate(t.id, { is_global: false })}
                style={{ fontSize: '11px', padding: '4px 10px', background: '#475569', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Global Kaldır
              </button>
            )}
            <button onClick={() => setExpandedId(expanded ? null : t.id)}
              style={{ fontSize: '11px', padding: '4px 8px', background: '#334155', color: S.muted,
                border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: '12px', borderTop: `1px solid ${S.border}`, paddingTop: '10px' }}>
            {t.docs.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start',
                padding: '5px 0', borderBottom: i < t.docs.length - 1 ? `1px solid ${S.border}` : 'none' }}>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                  background: '#1e293b', border: `1px solid ${S.border}`,
                  color: deliveryColors[d.delivery_type] || S.muted }}>
                  {d.delivery_type}
                </span>
                <div>
                  <div style={{ fontSize: '12px', color: S.text }}>{d.doc_name}</div>
                  {d.description && <div style={{ fontSize: '11px', color: S.muted }}>{d.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const tabs = [
    { key: 'pending', label: `İncelemede (${pending.length})` },
    { key: 'approved', label: `Onaylı (${approved.length})` },
  ] as const

  return (
    <div style={{ minHeight: '100vh', background: S.bg, padding: '2rem', color: S.text }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
          📋 Şablon Yönetimi
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '500',
                background: tab === t.key ? S.accent : S.card,
                color: tab === t.key ? 'white' : S.muted }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: S.muted }}>Yükleniyor...</div>
        ) : (
          <>
            {tab === 'pending' && (
              pending.length === 0
                ? <div style={{ color: S.muted, fontSize: '13px' }}>İncelenecek şablon yok.</div>
                : pending.map(t => <TemplateRow key={t.id} t={t} />)
            )}
            {tab === 'approved' && (
              approved.length === 0
                ? <div style={{ color: S.muted, fontSize: '13px' }}>Onaylı şablon yok.</div>
                : approved.map(t => <TemplateRow key={t.id} t={t} />)
            )}
          </>
        )}
      </div>
    </div>
  )
}
