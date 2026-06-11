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
  companies?: { name: string } | null
}

const S = {
  bg: '#080f1c', card: '#111d30', border: 'rgba(71,107,160,0.3)',
  text: 'white', muted: '#94a3b8', faint: '#475569', accent: '#6366f1',
}
const DELIVERY_COLORS: Record<string, string> = {
  digital: '#22c55e', physical: '#ef4444', firma: '#6366f1',
}

type TabKey = 'sablonlar' | 'global'

export default function SuperadminSablonlar() {
  const [templates, setTemplates]   = useState<Template[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [tab, setTab]               = useState<TabKey>('sablonlar')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/superadmin/templates')
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}${text ? ': ' + text.slice(0, 100) : ''}`)
      }
      const json = await res.json()
      setTemplates(json.templates ?? [])
    } catch (err: any) {
      console.error('[superadmin/sablonlar] yükleme hatası:', err)
      setError(err.message ?? 'Şablonlar yüklenemedi.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function patch(id: string, update: Record<string, unknown>) {
    try {
      const res = await fetch('/api/superadmin/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...update }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err: any) {
      console.error('[superadmin/sablonlar] güncelleme hatası:', err)
    }
    load()
  }

  // Tab 1: firma şablonları (global olmayan)
  const firmaTpls  = templates.filter(t => !t.is_global)
  // Tab 2: global şablonlar
  const globalTpls = templates.filter(t => t.is_global)

  const visible = tab === 'sablonlar' ? firmaTpls : globalTpls

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'sablonlar', label: 'Şablonlar',        count: firmaTpls.length  },
    { key: 'global',    label: 'Global Şablonlar', count: globalTpls.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: S.bg, padding: '2rem', color: S.text, fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>📋 Şablon Yönetimi</div>
          <div style={{ fontSize: '13px', color: S.muted }}>
            Firmaların evrak şablonlarını incele ve global olarak işaretle.
          </div>
        </div>

        {error && (
          <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={load} style={{ background: 'transparent', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
              Yeniden Dene
            </button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500',
              background: tab === t.key ? S.accent : S.card,
              color: tab === t.key ? 'white' : S.muted,
            }}>
              {t.label}
              <span style={{
                marginLeft: '6px', fontSize: '11px', fontWeight: '700',
                background: tab === t.key ? 'rgba(255,255,255,0.2)' : S.faint,
                color: tab === t.key ? 'white' : S.muted,
                padding: '1px 6px', borderRadius: '10px',
              }}>
                {t.count}
              </span>
            </button>
          ))}
          <button onClick={load} style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: '8px', border: `1px solid ${S.border}`, background: 'transparent', color: S.muted, fontSize: '12px', cursor: 'pointer' }}>
            ↺ Yenile
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ color: S.muted, fontSize: '13px', padding: '2rem 0' }}>Yükleniyor...</div>
        ) : visible.length === 0 ? (
          <div style={{ color: S.muted, fontSize: '13px', padding: '2rem 0', textAlign: 'center' }}>
            {tab === 'global' ? 'Henüz global şablon yok.' : 'Firma şablonu bulunamadı.'}
          </div>
        ) : (
          visible.map(t => {
            const expanded = expandedId === t.id
            return (
              <div key={t.id} style={{
                background: S.card, border: `1px solid ${S.border}`,
                borderRadius: '12px', padding: '14px 16px', marginBottom: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: S.text, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.country} · {t.visa_type} · {t.occupation || '—'}
                    </div>
                    <div style={{ fontSize: '12px', color: S.muted, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span>🏢 {t.companies?.name ?? 'Firma bilinmiyor'}</span>
                      <span>📄 {(t.docs || []).length} evrak</span>
                      <span>📅 {new Date(t.created_at).toLocaleDateString('tr-TR')}</span>
                      {t.is_global && <span style={{ color: S.accent, fontWeight: '600' }}>🌐 Global</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0, alignItems: 'center' }}>
                    {t.is_global
                      ? <button onClick={() => patch(t.id, { is_global: false })}
                          style={{ fontSize: '11px', padding: '5px 12px', background: S.faint, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          Global Kaldır
                        </button>
                      : <button onClick={() => patch(t.id, { status: 'approved', is_global: true })}
                          style={{ fontSize: '11px', padding: '5px 12px', background: S.accent, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                          🌐 Global Yap
                        </button>
                    }
                    <button onClick={() => setExpandedId(expanded ? null : t.id)}
                      style={{ fontSize: '11px', padding: '5px 9px', background: '#334155', color: S.muted, border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      {expanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div style={{ marginTop: '12px', borderTop: `1px solid ${S.border}`, paddingTop: '10px' }}>
                    {(t.docs || []).length === 0 ? (
                      <div style={{ fontSize: '12px', color: S.muted }}>Evrak eklenmemiş.</div>
                    ) : (t.docs || []).map((d, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '10px', padding: '5px 0',
                        borderBottom: i < t.docs.length - 1 ? `1px solid ${S.border}` : 'none',
                      }}>
                        <span style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
                          marginTop: '2px', fontWeight: '600', background: '#0f172a',
                          color: DELIVERY_COLORS[d.delivery_type] ?? S.muted,
                          border: `1px solid ${DELIVERY_COLORS[d.delivery_type] ?? S.border}`,
                        }}>
                          {d.delivery_type}
                        </span>
                        <div>
                          <div style={{ fontSize: '12px', color: S.text, fontWeight: '500' }}>{d.doc_name}</div>
                          {d.description && (
                            <div style={{ fontSize: '11px', color: S.muted, marginTop: '1px' }}>{d.description}</div>
                          )}
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
