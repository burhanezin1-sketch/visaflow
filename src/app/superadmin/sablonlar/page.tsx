'use client'

import { useEffect, useState } from 'react'

type Doc = { doc_name: string; delivery_type: string; description: string }
type Template = {
  id: string
  company_id: string | null
  country: string
  visa_type: string
  occupation: string
  docs: Doc[]
  status: 'pending' | 'approved' | 'rejected'
  is_global: boolean
  created_at: string
  companies?: { name: string }
}

const DELIVERY_COLORS: Record<string, string> = {
  digital: '#22c55e', physical: '#ef4444', firma: '#6366f1',
}
const S = {
  bg: '#0f172a', card: '#1e293b', border: '#334155',
  text: 'white', muted: '#94a3b8', accent: '#6366f1',
}

export default function SuperadminSablonlar() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/superadmin/templates')
    const json = await res.json()
    setTemplates(json.templates || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function patch(id: string, update: object) {
    await fetch('/api/superadmin/templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...update }),
    })
    load()
  }

  const counts = {
    pending:  templates.filter(t => t.status === 'pending').length,
    approved: templates.filter(t => t.status === 'approved').length,
    rejected: templates.filter(t => t.status === 'rejected').length,
  }
  const filtered = templates.filter(t => t.status === tab)

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'pending',  label: `Bekleyen (${counts.pending})` },
    { key: 'approved', label: `Onaylı (${counts.approved})` },
    { key: 'rejected', label: `Reddedildi (${counts.rejected})` },
  ]

  return (
    <div style={{ minHeight: '100vh', background: S.bg, padding: '2rem', color: S.text }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>📋 Şablon Yönetimi</div>
        <div style={{ fontSize: '13px', color: S.muted, marginBottom: '24px' }}>
          Firmalar tarafından gönderilen evrak şablonlarını incele ve onayla.
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '500',
                background: tab === t.key ? S.accent : S.card,
                color: tab === t.key ? 'white' : S.muted }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: S.muted }}>Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: S.muted, fontSize: '13px' }}>Bu kategoride şablon yok.</div>
        ) : (
          filtered.map(t => {
            const expanded = expandedId === t.id
            return (
              <div key={t.id} style={{ background: S.card, border: `1px solid ${S.border}`,
                borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: S.text, marginBottom: '3px' }}>
                      {t.country} · {t.visa_type} · {t.occupation}
                    </div>
                    <div style={{ fontSize: '11px', color: S.muted }}>
                      {t.companies?.name ?? 'Firma bilinmiyor'} · {(t.docs || []).length} evrak ·{' '}
                      {new Date(t.created_at).toLocaleDateString('tr-TR')}
                      {t.is_global && <span style={{ marginLeft: '8px', color: S.accent, fontWeight: '600' }}>🌐 Global</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {t.status === 'pending' && (
                      <>
                        <button onClick={() => patch(t.id, { status: 'approved' })}
                          style={{ fontSize: '11px', padding: '5px 11px', background: '#22c55e', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                          ✓ Onayla
                        </button>
                        <button onClick={() => patch(t.id, { status: 'rejected' })}
                          style={{ fontSize: '11px', padding: '5px 11px', background: '#ef4444', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                          ✕ Reddet
                        </button>
                        <button onClick={() => patch(t.id, { status: 'approved', is_global: true })}
                          style={{ fontSize: '11px', padding: '5px 11px', background: S.accent, color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                          🌐 Global Yap
                        </button>
                      </>
                    )}
                    {t.status === 'approved' && (
                      t.is_global
                        ? <button onClick={() => patch(t.id, { is_global: false })}
                            style={{ fontSize: '11px', padding: '5px 11px', background: '#475569', color: 'white',
                              border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Global Kaldır
                          </button>
                        : <button onClick={() => patch(t.id, { is_global: true })}
                            style={{ fontSize: '11px', padding: '5px 11px', background: S.accent, color: 'white',
                              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            🌐 Global Yap
                          </button>
                    )}
                    {t.status === 'rejected' && (
                      <button onClick={() => patch(t.id, { status: 'pending' })}
                        style={{ fontSize: '11px', padding: '5px 11px', background: '#475569', color: 'white',
                          border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Yeniden İncele
                      </button>
                    )}
                    <button onClick={() => setExpandedId(expanded ? null : t.id)}
                      style={{ fontSize: '11px', padding: '5px 8px', background: '#334155', color: S.muted,
                        border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {expanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div style={{ marginTop: '12px', borderTop: `1px solid ${S.border}`, paddingTop: '10px' }}>
                    {(t.docs || []).length === 0 ? (
                      <div style={{ fontSize: '12px', color: S.muted }}>Evrak eklenmemiş.</div>
                    ) : (t.docs || []).map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', padding: '5px 0',
                        borderBottom: i < t.docs.length - 1 ? `1px solid ${S.border}` : 'none' }}>
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', flexShrink: 0,
                          marginTop: '2px', fontWeight: '600', background: '#0f172a',
                          color: DELIVERY_COLORS[d.delivery_type] || S.muted,
                          border: `1px solid ${DELIVERY_COLORS[d.delivery_type] || S.border}` }}>
                          {d.delivery_type}
                        </span>
                        <div>
                          <div style={{ fontSize: '12px', color: S.text, fontWeight: '500' }}>{d.doc_name}</div>
                          {d.description && <div style={{ fontSize: '11px', color: S.muted, marginTop: '1px' }}>{d.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
