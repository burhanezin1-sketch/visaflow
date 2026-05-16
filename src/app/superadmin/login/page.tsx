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
        .sa-input::placeholder { color: rgba(255,255,255,0.25); }
        .sa-input:focus { border-color: rgba(108,71,255,0.6) !important; box-shadow: 0 0 0 3px rgba(108,71,255,0.12); }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050810', fontFamily: 'system-ui', position: 'relative', overflow: 'hidden' }}>

        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(108,71,255,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, width: '400px', maxWidth: '95vw', padding: '0 1.25rem' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', background: 'linear-gradient(135deg, #6C47FF 0%, #00D4FF 100%)', borderRadius: '20px', marginBottom: '1.75rem', boxShadow: '0 0 60px rgba(108,71,255,0.55)' }}>
              <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="37" stroke="white" strokeWidth="2.5"/>
                <circle cx="40" cy="40" r="27" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
                <polygon points="40,4 45.5,37 40,31 34.5,37" fill="white"/>
                <polygon points="40,76 45.5,43 40,49 34.5,43" fill="rgba(255,255,255,0.35)"/>
                <line x1="3" y1="40" x2="13" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="67" y1="40" x2="77" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="40" cy="40" r="3.5" fill="white"/>
                <circle cx="40" cy="40" r="1.5" fill="#6C47FF"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', letterSpacing: '6px', margin: '0 0 6px', textTransform: 'uppercase' }}>VECTROPUS</h1>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6C47FF', letterSpacing: '5px', textTransform: 'uppercase' }}>CONTROL CENTER</div>
            <div style={{ width: '48px', height: '1px', background: 'linear-gradient(90deg, transparent, #6C47FF, transparent)', margin: '16px auto 0' }} />
            <div style={{ marginTop: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>Superadmin Girişi</div>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="superadmin@email.com"
              required
              className="sa-input"
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(108,71,255,0.07)', border: '1px solid rgba(108,71,255,0.28)', borderRadius: '10px', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '12px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="sa-input"
              style={{ width: '100%', padding: '14px 16px', background: 'rgba(108,71,255,0.07)', border: '1px solid rgba(108,71,255,0.28)', borderRadius: '10px', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '18px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            />
            {error && (
              <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#ff7070' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? 'rgba(108,71,255,0.35)' : 'linear-gradient(135deg, #6C47FF 0%, #00D4FF 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '3px', fontFamily: 'inherit', textTransform: 'uppercase', boxShadow: loading ? 'none' : '0 0 40px rgba(108,71,255,0.5)', transition: 'box-shadow 0.2s' }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '10px', color: 'rgba(255,255,255,0.12)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Restricted Access · Vectropus Systems
          </div>
        </div>
      </div>
    </>
  )
}
