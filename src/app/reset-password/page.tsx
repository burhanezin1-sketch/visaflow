'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Step = 'loading' | 'form' | 'success' | 'expired'

export default function ResetPasswordPage() {
  const [step, setStep]         = useState<Step>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    // Kendi /api/forgot-password endpoint'imizin gönderdiği link — ?token=<hashed_token>
    const token = new URLSearchParams(window.location.search).get('token')
    if (token) {
      supabase.auth.verifyOtp({ token_hash: token, type: 'recovery' }).then(({ error }) => {
        setStep(error ? 'expired' : 'form')
      })
      return
    }

    // Geriye dönük uyumluluk — Supabase'in kendi ürettiği eski linkler (code/access_token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStep('form')
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStep('form')
      else setTimeout(() => setStep(s => s === 'loading' ? 'expired' : s), 3000)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return }
    if (password.length < 8) { setError('Şifre en az 8 karakter olmalı.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('Şifre güncellenemedi. Bağlantı süresi dolmuş olabilir.'); return }
    await supabase.auth.signOut()
    setStep('success')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap');
        .vp-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:48px 24px; position:relative; overflow:hidden; background:#0d1b2e; }
        .vp-card { background:#ffffff; border-radius:16px; width:100%; max-width:400px; padding:48px 40px 44px; position:relative; z-index:1; }
        .vp-logo-row { display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:32px; }
        .vp-wordmark { font-family:'Playfair Display',serif; font-weight:400; font-size:28px; letter-spacing:4px; color:#0d1b2e; line-height:1; }
        .vp-tagline { font-size:11px; color:#8a9bb0; letter-spacing:2px; text-align:center; margin-bottom:36px; font-family:system-ui,sans-serif; }
        .vp-divider { height:0.5px; background:#e8edf2; margin-bottom:32px; }
        .vp-label { display:block; font-size:11px; color:#6b7c93; letter-spacing:1px; margin-bottom:6px; font-family:system-ui,sans-serif; text-transform:uppercase; }
        .vp-input { width:100%; height:44px; border:1px solid #dde3ea; border-radius:8px; padding:0 14px; font-size:14px; color:#0d1b2e; background:#f8fafc; margin-bottom:20px; font-family:system-ui,sans-serif; outline:none; box-sizing:border-box; transition:border-color 0.15s; }
        .vp-input:focus { border-color:#185FA5; background:#fff; }
        .vp-btn { width:100%; height:46px; background:#0d1b2e; color:#ffffff; border:none; border-radius:8px; font-size:12px; letter-spacing:2.5px; font-family:system-ui,sans-serif; cursor:pointer; transition:background 0.15s,opacity 0.15s; }
        .vp-btn:hover:not(:disabled) { background:#162840; }
        .vp-btn:disabled { opacity:0.7; cursor:not-allowed; }
        .vp-btn-ghost { width:100%; height:40px; background:transparent; color:#8a9bb0; border:none; font-size:12px; font-family:system-ui,sans-serif; cursor:pointer; margin-top:8px; }
        .vp-error { font-size:12px; color:#c0392b; margin-bottom:12px; text-align:center; font-family:system-ui,sans-serif; }
        .vp-hint { font-size:12px; color:#6b7c93; text-align:center; margin-bottom:24px; font-family:system-ui,sans-serif; line-height:1.6; }
      `}</style>

      <div className="vp-screen">
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 680 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="340" height="600" fill="#0a1625" opacity="0.6"/>
          <rect x="400" y="320" width="280" height="280" fill="#112236" opacity="0.8"/>
          <circle cx="580" cy="80" r="120" fill="none" stroke="#1a3050" strokeWidth="0.8"/>
          <circle cx="580" cy="80" r="80" fill="none" stroke="#1a3050" strokeWidth="0.5"/>
          <circle cx="80" cy="520" r="100" fill="none" stroke="#152840" strokeWidth="0.8"/>
          <circle cx="80" cy="520" r="65" fill="none" stroke="#152840" strokeWidth="0.5"/>
          <line x1="80" y1="420" x2="80" y2="620" stroke="#152840" strokeWidth="0.5"/>
          <line x1="-20" y1="520" x2="180" y2="520" stroke="#152840" strokeWidth="0.5"/>
          <line x1="0" y1="200" x2="680" y2="200" stroke="#142035" strokeWidth="0.5"/>
          <line x1="0" y1="400" x2="680" y2="400" stroke="#142035" strokeWidth="0.5"/>
          <circle cx="490" cy="48" r="3" fill="#185FA5" opacity="0.7"/>
          <circle cx="510" cy="62" r="2" fill="#185FA5" opacity="0.4"/>
        </svg>

        <div className="vp-card">
          <div className="vp-logo-row">
            <svg width="36" height="36" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="37" stroke="#0d1b2e" strokeWidth="2.5"/>
              <circle cx="40" cy="40" r="27" stroke="#c8d4e0" strokeWidth="1"/>
              <polygon points="40,4 45.5,37 40,31 34.5,37" fill="#0d1b2e"/>
              <polygon points="40,76 45.5,43 40,49 34.5,43" fill="#c8d4e0"/>
              <line x1="3" y1="40" x2="13" y2="40" stroke="#0d1b2e" strokeWidth="2" strokeLinecap="round"/>
              <line x1="67" y1="40" x2="77" y2="40" stroke="#0d1b2e" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="40" cy="40" r="3.5" fill="#0d1b2e"/>
              <circle cx="40" cy="40" r="1.5" fill="white"/>
            </svg>
            <span className="vp-wordmark">VECTROPUS</span>
          </div>

          {step === 'loading' && (
            <>
              <p className="vp-tagline">ŞİFRE SIFIRLAMA</p>
              <div className="vp-divider"/>
              <p className="vp-hint">Bağlantı doğrulanıyor...</p>
            </>
          )}

          {step === 'expired' && (
            <>
              <p className="vp-tagline">BAĞLANTI SÜRESİ DOLDU</p>
              <div className="vp-divider"/>
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>⏳</div>
                <p className="vp-hint">
                  Bu bağlantının süresi dolmuş veya geçersiz.<br/>
                  Lütfen tekrar şifre sıfırlama talebinde bulunun.
                </p>
              </div>
              <button className="vp-btn" onClick={() => window.location.href = '/login'}>
                GİRİŞ SAYFASINA DÖN
              </button>
            </>
          )}

          {step === 'form' && (
            <>
              <p className="vp-tagline">YENİ ŞİFRE BELİRLE</p>
              <div className="vp-divider"/>
              <form onSubmit={handleReset}>
                <label className="vp-label">Yeni Şifre</label>
                <input
                  className="vp-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  minLength={8}
                  required
                  autoFocus
                />
                <label className="vp-label">Şifre Tekrar</label>
                <input
                  className="vp-input"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Şifreyi tekrar girin"
                  minLength={8}
                  required
                />
                {error && <p className="vp-error">{error}</p>}
                <button className="vp-btn" type="submit" disabled={loading}>
                  {loading ? 'KAYDEDİLİYOR...' : 'ŞİFREYİ GÜNCELLE'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <>
              <p className="vp-tagline">ŞİFRE GÜNCELLENDİ</p>
              <div className="vp-divider"/>
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '14px' }}>✅</div>
                <p className="vp-hint">
                  Şifreniz başarıyla güncellendi.<br/>
                  Yeni şifrenizle giriş yapabilirsiniz.
                </p>
              </div>
              <button className="vp-btn" onClick={() => window.location.href = '/login'}>
                GİRİŞ YAP
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
