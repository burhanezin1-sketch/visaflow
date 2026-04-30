'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Topbar({ title }: { title: string }) {
  const [initials, setInitials] = useState('...')

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
        if (data?.full_name) {
          setInitials(data.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase())
        }
      }
    }
    fetchUser()
  }, [])

  return (
    <div style={{
      background: 'white', borderBottom: '1px solid #e8e4da',
      padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(13,31,53,0.06)', flexShrink: 0,
    }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '500', color: '#0d1f35', margin: 0, letterSpacing: '-0.2px' }}>
        {title}
      </h2>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #1a3a5c, #0d1f35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: '600', color: 'white',
        boxShadow: '0 2px 8px rgba(13,31,53,0.2)',
      }}>
        {initials}
      </div>
    </div>
  )
}