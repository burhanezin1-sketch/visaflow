'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email veya şifre hatalı')
      setLoading(false)
      return
    }

    if (data.session) {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0d1f35', fontFamily: 'system-ui'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '2.5rem 2rem',
        width: '340px', textAlign: 'center'
      }}>
        <div style={{
          width: '48px', height: '48px', background: '#1a3a5c', borderRadius: '12px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Vectropus</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '1.5rem' }}>Danışman girişi</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e3',
              borderRadius: '8px', fontSize: '14px', marginBottom: '10px',
              outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Şifre"
            required
            style={{
              width: '100%', padding: '10px 12px', border: '1.5px solid #e5e5e3',
              borderRadius: '8px', fontSize: '14px', marginBottom: '10px',
              outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
            }}
          />
          {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', background: '#1a3a5c', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit'
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}