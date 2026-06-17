'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useCompany } from '@/lib/useCompany'
import { logAction } from '@/lib/activityLog'
import { useIsMobile } from '@/lib/useIsMobile'
import { useSidebar } from '@/lib/SidebarContext'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { companyId } = useCompany()
  const isMobile = useIsMobile()
  const { isOpen, close } = useSidebar()
  const t = useTranslations('sidebar')
  const tc = useTranslations('common')
  const isRTL = typeof document !== 'undefined'
    ? document.cookie.includes('NEXT_LOCALE=ar')
    : false
  const [companyName, setCompanyName] = useState('')
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [leadCount, setLeadCount] = useState(0)
  const [transferCount, setTransferCount] = useState(0)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [showTransfers, setShowTransfers] = useState(false)
  const [transfers, setTransfers] = useState<any[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  const navItems = [
    { label: t('dashboard'),    href: '/dashboard' },
    { label: t('tasks'),        href: '/dashboard/gorevler' },
    { label: t('customers'),    href: '/dashboard/musteriler' },
    { label: t('leads'),        href: '/dashboard/leads', badge: 'lead' },
    { label: t('calendar'),     href: '/dashboard/takvim' },
    { label: t('embassyLinks'), href: '/dashboard/elcilik' },
    { label: t('templates'),    href: '/dashboard/sablonlar' },
    { label: t('settings'),     href: '/dashboard/ayarlar' },
  ]

  // Close drawer on navigation
  useEffect(() => { close() }, [pathname])

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
    supabase.from('companies').select('name, logo_url').eq('id', companyId).single().then(({ data }) => {
      if (data) {
        setCompanyName(data.name)
        setCompanyLogo(data.logo_url || null)
      }
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

  async function handleOnayla(tr: any) {
    if (processingId) return
    setProcessingId(tr.id)
    await supabase.from('transfer_requests').update({ status: 'accepted' }).eq('id', tr.id)
    await supabase.from('clients').update({ danisan_id: userId }).eq('id', tr.client_id)
    logAction(companyId!, userId, userName, `Devir talebi onaylandı`, 'transfer', tr.id, tr.clients?.full_name)
    removeTransfer(tr.id)
    setProcessingId(null)
  }

  async function handleReddet(tr: any) {
    if (processingId) return
    setProcessingId(tr.id)
    await supabase.from('transfer_requests').update({ status: 'rejected' }).eq('id', tr.id)
    logAction(companyId!, userId, userName, `Devir talebi reddedildi`, 'transfer', tr.id, tr.clients?.full_name)
    removeTransfer(tr.id)
    setProcessingId(null)
  }

  function navigate(href: string) {
    router.push(href)
    close()
  }

  const innerContent = (
    <>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
        {companyLogo && (
          <div style={{ marginBottom: '8px' }}>
            <img
              src={companyLogo}
              alt={companyName}
              style={{ height: '32px', maxWidth: '140px', objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}
        <div style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>{companyName || '...'}</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>{userName || '...'}</div>
      </div>

      {transferCount > 0 && (
        <div style={{ margin: '0 0.75rem 0.75rem', background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.25)', borderRadius: '8px', overflow: 'hidden' }}>
          <div
            onClick={() => setShowTransfers(v => !v)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '12px', color: '#4e86d0', fontWeight: '600' }}>
              {t('transferRequests', { count: transferCount })}
            </span>
            <span style={{ fontSize: '10px', color: '#4e86d0' }}>{showTransfers ? '▲' : '▼'}</span>
          </div>
          {showTransfers && (
            <div style={{ borderTop: '1px solid rgba(55,138,221,0.2)' }}>
              {transfers.map(tr => (
                <div key={tr.id} style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.82)', fontWeight: '500', marginBottom: '2px' }}>{tr.clients?.full_name ?? '—'}</div>
                  {tr.from_user_name && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginBottom: '4px' }}>
                      {t('transferFrom', { name: tr.from_user_name })}
                    </div>
                  )}
                  {tr.note && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginBottom: '6px' }}>"{tr.note}"</div>
                  )}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleOnayla(tr) }}
                      disabled={!!processingId}
                      style={{ flex: 1, padding: '5px 4px', fontSize: '10px', fontWeight: '600', background: processingId === tr.id ? '#555' : '#1a7a45', color: 'white', border: 'none', borderRadius: '5px', cursor: processingId ? 'not-allowed' : 'pointer' }}
                    >
                      {processingId === tr.id ? '...' : t('acceptTransfer')}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleReddet(tr) }}
                      disabled={!!processingId}
                      style={{ flex: 1, padding: '5px 4px', fontSize: '10px', fontWeight: '600', background: processingId === tr.id ? '#555' : 'rgba(192,57,43,0.85)', color: 'white', border: 'none', borderRadius: '5px', cursor: processingId ? 'not-allowed' : 'pointer' }}
                    >
                      {t('rejectTransfer')}
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
              color: isActive ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.42)',
              fontWeight: isActive ? '500' : '400',
              cursor: 'pointer',
              ...(isRTL
                ? { borderRight: isActive ? '4px solid var(--brand-secondary, #60a5fa)' : '4px solid transparent', borderLeft: 'none' }
                : { borderLeft: isActive ? '4px solid var(--brand-secondary, #60a5fa)' : '4px solid transparent' }),
              background: isActive ? 'rgba(96,165,250,0.14)' : 'transparent',
              transition: 'all 0.18s',
              marginBottom: '1px',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? 'var(--brand-secondary, #60a5fa)' : 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge === 'lead' && leadCount > 0 && (
              <span style={{ background: '#a32d2d', color: 'white', fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '10px' }}>{leadCount}</span>
            )}
          </div>
        )
      })}

      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <LanguageSwitcher light />
        <div
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '13px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          {tc('logout')}
        </div>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            onClick={close}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
          />
        )}
        {/* Slide-in drawer */}
        <div style={{
          position: 'fixed', top: 0, bottom: 0, width: '260px',
          ...(isRTL ? { right: 0 } : { left: 0 }),
          background: 'var(--brand-primary, #0e1524)', zIndex: 300,
          transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display: 'flex', flexDirection: 'column',
          padding: '1.25rem 0',
          overflowY: 'auto',
        }}>
          {innerContent}
        </div>
      </>
    )
  }

  return (
    <div style={{ width: '220px', flexShrink: 0, background: 'var(--brand-primary, #0e1524)', padding: '1.25rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.05)', ...(isRTL ? { left: 0 } : { right: 0 }) }} />
      {innerContent}
    </div>
  )
}
