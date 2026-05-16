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
    if (authError) { setError('Email veya şifre hatalı'); setLoading(false); return }
    const { data: sa } = await supabase.from('superadmins').select('id').eq('id', data.session?.user.id).single()
    if (!sa) { setError('Bu hesabın superadmin yetkisi yok'); await supabase.auth.signOut(); setLoading(false); return }
    router.push('/superadmin/dashboard')
  }

  return (
    <>
      <style>{`
        .sl-inp { color: white; background: #0f172a; border: 1px solid #334155; border-radius: 8px; width: 100%; padding: 10px 12px; font-size: 14px; outline: none; box-sizing: border-box; font-family: inherit; }
        .sl-inp::placeholder { color: #475569; }
        .sl-inp:focus { border-color: #6366f1; }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'system-ui' }}>
        <div style={{ width: '360px', maxWidth: '95vw', padding: '0 1rem' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', background: '#6366f1', borderRadius: '10px', marginBottom: '1rem' }}>
              <svg width="22" height="22" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="37" stroke="white" strokeWidth="3"/>
                <polygon points="40,4 45.5,37 40,31 34.5,37" fill="white"/>
                <circle cx="40" cy="40" r="3.5" fill="white"/>
              </svg>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', letterSpacing: '1px' }}>Vectropus</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>Superadmin Girişi</div>
          </div>

          {/* Card */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.75rem' }}>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@email.com" required className="sl-inp" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Şifre</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="sl-inp" />
              </div>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', padding: '9px 12px', marginBottom: '12px', fontSize: '13px', color: '#f87171' }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: loading ? '#4338ca' : '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '11px', color: '#475569' }}>
            Restricted · Vectropus Admin Systems
          </div>
        </div>
      </div>
    </>
  )
}
