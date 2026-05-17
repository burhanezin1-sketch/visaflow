'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 saat

export default function SessionTimeout() {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function handleTimeout() {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(handleTimeout, TIMEOUT_MS)
    }

    const events = ['mousemove', 'keydown', 'click', 'touchstart'] as const
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [router])

  return null
}
