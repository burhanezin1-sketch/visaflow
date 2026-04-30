'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Görev Listesi', href: '/dashboard/gorevler' },
  { label: 'Müşteriler', href: '/dashboard/musteriler' },
  { label: 'Potansiyel Müşteriler', href: '/dashboard/leads', badge: 'lead' },
  { label: 'Takvim', href: '/dashboard/takvim' },
  { label: 'Elçilik Linkleri', href: '/dashboard/elcilik' },
  { label: 'Müşteri Portalı', href: '/portal' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [leadCount, setLeadCount] = useState(0)
  const [transferCount, setTransferCount] = useState(0)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [showTransfers, setShowTransfers] = useState(false)
  const [transfers, setTransfers] = useState<any[]>([])

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
    if (!userId) return
    async function fetchCounts() {
      const { count: lc } = await supabase
        .from('leads').select('*', { count: 'exact', head: true }).eq('status', 'waiting')
      setLeadCount(lc || 0)

      const { data: tr } = await supabase
        .from('transfer_requests')
        .select('*, clients(full_name)')
        .eq('to_user', userId)
        .eq('status', 'pending')
      setTransfers(tr || [])
      setTransferCount(tr?.length || 0)
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [userId])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{
      width: '220px', flexShrink: 0,
      background: 'linear-gradient(180deg, #0d1f35 0%, #0a1929 100%)',
      padding: '1.25rem 0', display: 'flex', flexDirection: 'column',
      minHeight: '100vh', position: 'relative',
    }}>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '1px', background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.3), transparent)' }} />

      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>Çınar Danışmanlık</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{userName || '...'}</div>
      </div>

      {/* Devir bildirimi */}
      {transferCount > 0 && (
        <div
          onClick={() => setShowTransfers(!showTransfers)}
          style={{
            margin: '0 0.75rem 0.75rem',
            background: 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#c9a84c', fontWeight: '600' }}>
              📨 {transferCount} Devir Talebi
            </span>
            <span style={{ fontSize: '10px', color: '#c9a84c' }}>{showTransfers ? '▲' : '▼'}</span>
          </div>
          {showTransfers && (
            <div style={{ marginTop: '8px' }}>
              {transfers.map(t => (
                <div
                  key={t.id}
                  onClick={e => { e.stopPropagation(); router.push(`/dashboard/musteriler/${t.client_id}`) }}
                  style={{
                    fontSize: '11px', color: 'white', padding: '4px 0',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                  }}
                >
                  → {t.clients?.full_name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {navItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <div key={item.href} onClick={() => router.push(item.href)} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 1.25rem', fontSize: '13px',
            color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            borderLeft: isActive ? '2px solid #c9a84c' : '2px solid transparent',
            background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
            transition: 'all 0.15s',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: isActive ? '#c9a84c' : 'rgba(255,255,255,0.3)',
              boxShadow: isActive ? '0 0 8px rgba(201,168,76,0.5)' : 'none',
              flexShrink: 0,
            }} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge === 'lead' && leadCount > 0 && (
              <span style={{ background: '#a32d2d', color: 'white', fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '10px' }}>
                {leadCount}
              </span>
            )}
          </div>
        )
      })}

      <div onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 1.25rem', marginTop: 'auto',
        fontSize: '13px', color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer', borderLeft: '2px solid transparent',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        Çıkış
      </div>
    </div>
  )
}