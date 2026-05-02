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
      width: '220px', flexShrink: 0,
      background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0618 100%)',
      padding: '1.25rem 0', display: 'flex', flexDirection: 'column', minHeight: '100vh',
    }}>
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>{companyName || '...'}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Admin Panel</div>
      </div>
      {navItems.map(item => {
        const isActive = pathname === item.href
        return (
          <div key={item.href} onClick={() => router.push(item.href)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 1.25rem', fontSize: '13px',
            color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            borderLeft: isActive ? '2px solid #c9a84c' : '2px solid transparent',
            background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#c9a84c' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            {item.label}
          </div>
        )
      })}
      <div onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 1.25rem', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderLeft: '2px solid transparent', marginTop: '8px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        Danışman Paneli
      </div>
      <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 1.25rem', marginTop: 'auto', fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderLeft: '2px solid transparent' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        Çıkış
      </div>
    </div>
  )
}