'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { logAction } from '@/lib/activityLog'
import { useIsMobile } from '@/lib/useIsMobile'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Görev Listesi', href: '/dashboard/gorevler' },
  { label: 'Müşteriler', href: '/dashboard/musteriler' },
  { label: 'Potansiyel Müşteriler', href: '/dashboard/leads', badge: 'lead' },
  { label: 'Takvim', href: '/dashboard/takvim' },
  { label: 'Elçilik Linkleri', href: '/dashboard/elcilik' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { companyId } = useCompany()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [leadCount, setLeadCount] = useState(0)
  const [transferCount, setTransferCount] = useState(0)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [showTransfers, setShowTransfers] = useState(false)
  const [transfers, setTransfers] = useState<any[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => { setDrawerOpen(false) }, [pathname])

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
        if (data?.full_name) setUserName(data.full_name)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!companyId) return
    supabase.from('companies').select('name').eq('id', companyId).single().then(({ data }) => {
      if (data) setCompanyName(data.name)
    })
  }, [companyId])

  useEffect(() => {
    if (!userId || !companyId) return
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [userId, companyId])

  async function fetchCounts() {
    const { count: lc } = await supabase
      .from('leads').select('*', { count: 'exact', head: true })
      .eq('status', 'waiting')
      .eq('company_id', companyId)
    setLeadCount(lc || 0)

    const { data: tr } = await supabase
      .from('transfer_requests')
      .select('id, client_id, from_user, to_user, note, clients(full_name)')
      .eq('to_user', userId)
      .eq('status', 'pending')

    if (!tr || tr.length === 0) {
      setTransfers([])
      setTransferCount(0)
      return
    }

    const fromIds = [...new Set(tr.map((t: any) => t.from_user).filter(Boolean))]
    const { data: senders } = fromIds.length > 0
      ? await supabase.from('users').select('id, full_name').in('id', fromIds)
      : { data: [] as any[] }

    const enriched = tr.map((t: any) => ({
      ...t,
      from_user_name: senders?.find((u: any) => u.id === t.from_user)?.full_name ?? null,
    }))

    setTransfers(enriched)
    setTransferCount(enriched.length)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function removeTransfer(id: string) {
    setTransfers(prev => {
      const next = prev.filter(t => t.id !== id)
      setTransferCount(next.length)
      if (next.length === 0) setShowTransfers(false)
      return next
    })
  }

  async function handleOnayla(t: any) {
    if (processingId) return
    setProcessingId(t.id)
    await supabase.from('transfer_requests').update({ status: 'accepted' }).eq('id', t.id)
    await supabase.from('clients').update({ danisan_id: userId }).eq('id', t.client_id)
    logAction(companyId!, userId, userName, `Devir talebi onaylandı`, 'transfer', t.id, t.clients?.full_name)
    removeTransfer(t.id)
    setProcessingId(null)
  }

  async function handleReddet(t: any) {
    if (processingId) return
    setProcessingId(t.id)
    await supabase.from('transfer_requests').update({ status: 'rejected' }).eq('id', t.id)
    logAction(companyId!, userId, userName, `Devir talebi reddedildi`, 'transfer', t.id, t.clients?.full_name)
    removeTransfer(t.id)
    setProcessingId(null)
  }

  function navigate(href: string) {
    router.push(href)
    setDrawerOpen(false)
  }

  const innerContent = (
    <>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>{companyName || '...'}</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>{userName || '...'}</div>
      </div>

      {transferCount > 0 && (
        <div style={{ margin: '0 0.75rem 0.75rem', background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.25)', borderRadius: '8px', overflow: 'hidden' }}>
          <div
            onClick={() => setShowTransfers(v => !v)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '12px', color: '#378ADD', fontWeight: '600' }}>📨 {transferCount} Devir Talebi</span>
            <span style={{ fontSize: '10px', color: '#378ADD' }}>{showTransfers ? '▲' : '▼'}</span>
          </div>
          {showTransfers && (
            <div style={{ borderTop: '1px solid rgba(55,138,221,0.2)' }}>
              {transfers.map(t => (
                <div key={t.id} style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.82)', fontWeight: '500', marginBottom: '2px' }}>{t.clients?.full_name ?? '—'}</div>
                  {t.from_user_name && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginBottom: '4px' }}>{t.from_user_name} tarafından</div>
                  )}
                  {t.note && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginBottom: '6px' }}>"{t.note}"</div>
                  )}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleOnayla(t) }}
                      disabled={!!processingId}
                      style={{ flex: 1, padding: '5px 4px', fontSize: '10px', fontWeight: '600', background: processingId === t.id ? '#555' : '#1a7a45', color: 'white', border: 'none', borderRadius: '5px', cursor: processingId ? 'not-allowed' : 'pointer' }}
                    >
                      {processingId === t.id ? '...' : '✓ Onayla'}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleReddet(t) }}
                      disabled={!!processingId}
                      style={{ flex: 1, padding: '5px 4px', fontSize: '10px', fontWeight: '600', background: processingId === t.id ? '#555' : 'rgba(192,57,43,0.85)', color: 'white', border: 'none', borderRadius: '5px', cursor: processingId ? 'not-allowed' : 'pointer' }}
                    >
                      ✕ Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {navItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <div
            key={item.href}
            onClick={() => navigate(item.href)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 1.25rem', fontSize: '13px',
              color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              borderLeft: isActive ? '2px solid #378ADD' : '2px solid transparent',
              background: isActive ? 'rgba(55,138,221,0.08)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: isActive ? '#378ADD' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge === 'lead' && leadCount > 0 && (
              <span style={{ background: '#a32d2d', color: 'white', fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '10px' }}>{leadCount}</span>
            )}
          </div>
        )
      })}

      <div
        onClick={handleLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 1.25rem', marginTop: 'auto', fontSize: '13px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'all 0.15s' }}
      >
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        Çıkış
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        {/* Fixed mobile top bar */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '52px', background: '#1c1c24', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>{companyName || '...'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {leadCount > 0 && <span style={{ background: '#a32d2d', color: 'white', fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '10px' }}>{leadCount}</span>}
            {transferCount > 0 && <span style={{ background: '#378ADD', color: 'white', fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '10px' }}>{transferCount}</span>}
            <button onClick={() => setDrawerOpen(v => !v)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }} aria-label="Menü">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {drawerOpen
                  ? <path d="M3 3l16 16M19 3L3 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  : <><line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Backdrop */}
        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
        )}

        {/* Slide-in drawer */}
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px', background: '#1c1c24', zIndex: 300, transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', display: 'flex', flexDirection: 'column', padding: '1.25rem 0', overflowY: 'auto' }}>
          {innerContent}
        </div>
      </>
    )
  }

  return (
    <div style={{ width: '220px', flexShrink: 0, background: '#1c1c24', padding: '1.25rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.05)' }} />
      {innerContent}
    </div>
  )
}
