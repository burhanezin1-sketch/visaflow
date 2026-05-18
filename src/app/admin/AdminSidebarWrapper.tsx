'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'

const navItems = [
  { label: 'Genel Bakış', href: '/admin' },
  { label: 'Mali Durum', href: '/admin/mali' },
  { label: 'Ekip Performansı', href: '/admin/ekip' },
  { label: 'Tüm Müşteriler', href: '/admin/musteriler' },
  { label: 'Hizmet Fiyatları', href: '/admin/fiyatlar' },
  { label: 'Aktivite Geçmişi', href: '/admin/aktivite' },
]

export default function AdminSidebarWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const { companyId } = useCompany()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')

  useEffect(() => { setDrawerOpen(false) }, [pathname])

  useEffect(() => {
    if (!companyId) return
    supabase.from('companies').select('name').eq('id', companyId).single().then(({ data }) => {
      if (data) setCompanyName(data.name)
    })
  }, [companyId])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function navigate(href: string) {
    router.push(href)
    setDrawerOpen(false)
  }

  const innerContent = (
    <>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>{companyName || '...'}</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>Admin Panel</div>
      </div>

      {navItems.map(item => {
        const isActive = pathname === item.href
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
            {item.label}
          </div>
        )
      })}

      <div
        onClick={() => navigate('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 1.25rem', marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'all 0.15s' }}
      >
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        Danışman Paneli
      </div>

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
          <div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>{companyName || '...'}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginLeft: '8px' }}>Admin</span>
          </div>
          <button onClick={() => setDrawerOpen(v => !v)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }} aria-label="Menü">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {drawerOpen
                ? <path d="M3 3l16 16M19 3L3 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                : <><line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>
              }
            </svg>
          </button>
        </div>

        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
        )}

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
