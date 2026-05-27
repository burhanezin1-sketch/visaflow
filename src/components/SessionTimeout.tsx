'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const TIMEOUT_MS = 45 * 60 * 1000       // 45 dakika
const WARNING_BEFORE_MS = 5 * 60 * 1000  // timeout'tan 5 dk önce uyarı

export default function SessionTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    setShowWarning(false)

    warningRef.current = setTimeout(
      () => setShowWarning(true),
      TIMEOUT_MS - WARNING_BEFORE_MS
    )

    timerRef.current = setTimeout(async () => {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }, TIMEOUT_MS)
  }, [])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [resetTimer])

  if (!showWarning) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'white', borderRadius: '16px', padding: '2rem 2rem 1.75rem',
          maxWidth: '380px', width: '90%', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '38px', marginBottom: '0.875rem' }}>⏱</div>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '15px', fontWeight: '700', color: '#111827' }}>
          Oturum Sona Eriyor
        </h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '13.5px', color: '#6b7280', lineHeight: 1.65 }}>
          Oturumunuz 5 dakika içinde sona erecek.<br />Devam etmek için tıklayın.
        </p>
        <button
          onClick={resetTimer}
          style={{
            width: '100%', padding: '10px 0', background: '#4f46e5', color: 'white',
            border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Devam Et
        </button>
      </div>
    </div>
  )
}
