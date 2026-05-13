'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useEffect, useState } from 'react'

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
  const [companyName, setCompanyName] = useState('')

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

  return (
    <div style={{
      width: '220px',
      flexShrink: 0,
      background: '#1c1c24',
      padding: '1.25rem 0',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: '1px', background: 'rgba(255,255,255,0.05)',
      }} />

      {/* Firma adı + Admin Panel */}
      <div style={{
        padding: '0 1.25rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '0.75rem',
      }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>
          {companyName || '...'}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
          Admin Panel
        </div>
      </div>

      {/* Nav items */}
      {navItems.map(item => {
        const isActive = pathname === item.href
        return (
          <div
            key={item.href}
            onClick={() => router.push(item.href)}
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
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: isActive ? '#378ADD' : 'rgba(255,255,255,0.2)',
              flexShrink: 0,
            }} />
            {item.label}
          </div>
        )
      })}

      {/* Danışman Paneli */}
      <div
        onClick={() => router.push('/dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 1.25rem', marginTop: '8px',
          fontSize: '13px', color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer', borderLeft: '2px solid transparent',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        Danışman Paneli
      </div>

      {/* Çıkış */}
      <div
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 1.25rem', marginTop: 'auto',
          fontSize: '13px', color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer', borderLeft: '2px solid transparent',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        Çıkış
      </div>
    </div>
  )
}