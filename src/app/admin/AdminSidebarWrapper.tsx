'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'
import { useSidebar } from '@/lib/SidebarContext'

const navItems = [
  { label: 'Genel Bakış', href: '/admin' },
  { label: 'Mali Durum', href: '/admin/mali' },
  { label: 'Ekip Performansı', href: '/admin/ekip' },
  { label: 'Tüm Müşteriler', href: '/admin/musteriler' },
  { label: 'Hizmet Fiyatları', href: '/admin/fiyatlar' },
  { label: 'Aktivite Geçmişi', href: '/admin/aktivite' },
  { label: '↑ Toplu İçe Aktar', href: '/admin/import' },
]

export default function AdminSidebarWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const { companyId } = useCompany()
  const isMobile = useIsMobile()
  const { isOpen, close } = useSidebar()
  const [companyName, setCompanyName] = useState('')

  useEffect(() => { close() }, [pathname])

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
    close()
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
              color: isActive ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.42)',
              fontWeight: isActive ? '500' : '400',
              cursor: 'pointer',
              borderLeft: isActive ? '4px solid #60a5fa' : '4px solid transparent',
              background: isActive ? 'rgba(96,165,250,0.14)' : 'transparent',
              transition: 'all 0.18s',
              marginBottom: '1px',
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#60a5fa' : 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
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
        {isOpen && (
          <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
        )}
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
          background: '#0e1524', zIndex: 300,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
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
    <div style={{ width: '220px', flexShrink: 0, background: '#0e1524', padding: '1.25rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.05)' }} />
      {innerContent}
    </div>
  )
}
