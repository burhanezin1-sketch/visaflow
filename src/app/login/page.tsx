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
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      if (userData?.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap');

        .vp-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          position: relative;
          overflow: hidden;
          background: #0d1b2e;
        }

        .vp-card {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          padding: 48px 40px 44px;
          position: relative;
          z-index: 1;
        }

        .vp-logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 32px;
        }

        .vp-wordmark {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          font-size: 28px;
          letter-spacing: 4px;
          color: #0d1b2e;
          line-height: 1;
        }

        .vp-tagline {
          font-size: 11px;
          color: #8a9bb0;
          letter-spacing: 2px;
          text-align: center;
          margin-bottom: 36px;
          font-family: system-ui, sans-serif;
        }

        .vp-divider {
          height: 0.5px;
          background: #e8edf2;
          margin-bottom: 32px;
        }

        .vp-label {
          display: block;
          font-size: 11px;
          color: #6b7c93;
          letter-spacing: 1px;
          margin-bottom: 6px;
          font-family: system-ui, sans-serif;
          text-transform: uppercase;
        }

        .vp-input {
          width: 100%;
          height: 44px;
          border: 1px solid #dde3ea;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 14px;
          color: #0d1b2e;
          background: #f8fafc;
          margin-bottom: 20px;
          font-family: system-ui, sans-serif;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }

        .vp-input:focus {
          border-color: #185FA5;
          background: #fff;
        }

        .vp-btn {
          width: 100%;
          height: 46px;
          background: #0d1b2e;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          letter-spacing: 2.5px;
          font-family: system-ui, sans-serif;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
        }

        .vp-btn:hover:not(:disabled) { background: #162840; }
        .vp-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .vp-error {
          font-size: 12px;
          color: #c0392b;
          margin-bottom: 12px;
          text-align: center;
          font-family: system-ui, sans-serif;
        }
      `}</style>

      <div className="vp-screen">
        {/* Arka plan SVG */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 680 600"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width="340" height="600" fill="#0a1625" opacity="0.6"/>
          <rect x="400" y="320" width="280" height="280" fill="#112236" opacity="0.8"/>

          {/* Sağ üst çemberler */}
          <circle cx="580" cy="80" r="120" fill="none" stroke="#1a3050" strokeWidth="0.8"/>
          <circle cx="580" cy="80" r="80" fill="none" stroke="#1a3050" strokeWidth="0.5"/>
          <circle cx="580" cy="80" r="40" fill="none" stroke="#1f3a5e" strokeWidth="0.5"/>

          {/* Sol alt pusula detayı */}
          <circle cx="80" cy="520" r="100" fill="none" stroke="#152840" strokeWidth="0.8"/>
          <circle cx="80" cy="520" r="65" fill="none" stroke="#152840" strokeWidth="0.5"/>
          <line x1="80" y1="420" x2="80" y2="620" stroke="#152840" strokeWidth="0.5"/>
          <line x1="-20" y1="520" x2="180" y2="520" stroke="#152840" strokeWidth="0.5"/>

          {/* Yatay zemin çizgileri */}
          <line x1="0" y1="200" x2="680" y2="200" stroke="#142035" strokeWidth="0.5"/>
          <line x1="0" y1="400" x2="680" y2="400" stroke="#142035" strokeWidth="0.5"/>

          {/* Sağ alt diagonal */}
          <line x1="480" y1="600" x2="680" y2="400" stroke="#1a3050" strokeWidth="0.5"/>
          <line x1="520" y1="600" x2="680" y2="440" stroke="#1a3050" strokeWidth="0.5"/>
          <line x1="560" y1="600" x2="680" y2="480" stroke="#1a3050" strokeWidth="0.5"/>

          {/* Mavi nokta vurguları */}
          <circle cx="490" cy="48" r="3" fill="#185FA5" opacity="0.7"/>
          <circle cx="510" cy="62" r="2" fill="#185FA5" opacity="0.4"/>
          <circle cx="470" cy="66" r="2" fill="#185FA5" opacity="0.3"/>
        </svg>

        <div className="vp-card">
          {/* Logo */}
          <div className="vp-logo-row">
            <svg width="36" height="36" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="37" stroke="#0d1b2e" strokeWidth="2.5"/>
              <circle cx="40" cy="40" r="27" stroke="#c8d4e0" strokeWidth="1"/>
              <polygon points="40,4 45.5,37 40,31 34.5,37" fill="#0d1b2e"/>
              <polygon points="40,76 45.5,43 40,49 34.5,43" fill="#c8d4e0"/>
              <line x1="3" y1="40" x2="13" y2="40" stroke="#0d1b2e" strokeWidth="2" strokeLinecap="round"/>
              <line x1="67" y1="40" x2="77" y2="40" stroke="#0d1b2e" strokeWidth="2" strokeLinecap="round"/>
              <line x1="40" y1="3" x2="40" y2="9" stroke="#0d1b2e" strokeWidth="2" strokeLinecap="round"/>
              <line x1="40" y1="71" x2="40" y2="77" stroke="#0d1b2e" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="14" x2="19" y2="19" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="66" y1="14" x2="61" y2="19" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="14" y1="66" x2="19" y2="61" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="66" y1="66" x2="61" y2="61" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="40" cy="40" r="3.5" fill="#0d1b2e"/>
              <circle cx="40" cy="40" r="1.5" fill="white"/>
            </svg>
            <span className="vp-wordmark">VECTROPUS</span>
          </div>

          <p className="vp-tagline">DANIŞMAN GİRİŞİ</p>
          <div className="vp-divider"/>

          <form onSubmit={handleLogin}>
            <label className="vp-label">E-posta</label>
            <input
              className="vp-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ornek@sirket.com"
              required
            />

            <label className="vp-label">Şifre</label>
            <input
              className="vp-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && <p className="vp-error">{error}</p>}

            <button className="vp-btn" type="submit" disabled={loading}>
              {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}