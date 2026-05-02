'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email veya şifre hatalı')
      setLoading(false)
      return
    }

    // Superadmin kontrolü
    const { data: sa } = await supabase
      .from('superadmins')
      .select('id')
      .eq('id', data.session?.user.id)
      .single()

    if (!sa) {
      setError('Bu hesabın superadmin yetkisi yok')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    router.push('/superadmin/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1f35', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem 2rem', width: '340px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: '#c9a84c', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', fontSize: '22px' }}>⚡</div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Vectropus</h1>
          <p style={{ fontSize: '12px', color: '#888' }}>Süper Admin Paneli</p>
        </div>
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e3', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre" required style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e3', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: '#0d1f35', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}