'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Announcement = {
  id: string
  title: string
  body: string
  image_url: string | null
  created_at: string
}

export default function AnnouncementPopup({ companyId }: { companyId: string }) {
  const [ann, setAnn]         = useState<Announcement | null>(null)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const dismissed = JSON.parse(localStorage.getItem('vp_dismissed_ann') || '[]') as string[]
    supabase
      .from('company_announcements')
      .select('id, title, body, image_url, created_at')
      .eq('company_id', companyId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !dismissed.includes(data.id)) {
          setAnn(data)
          setTimeout(() => setVisible(true), 400)
        }
      })
  }, [companyId])

  function dismiss() {
    if (!ann) return
    setClosing(true)
    setTimeout(() => {
      const dismissed = JSON.parse(localStorage.getItem('vp_dismissed_ann') || '[]') as string[]
      dismissed.push(ann.id)
      localStorage.setItem('vp_dismissed_ann', JSON.stringify(dismissed))
      setVisible(false)
      setClosing(false)
    }, 280)
  }

  if (!ann) return null

  return (
    <>
      <style>{`
        @keyframes vp-ann-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes vp-ann-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.94) translateY(12px); }
        }
        @keyframes vp-overlay-in  { from { opacity:0; } to { opacity:1; } }
        @keyframes vp-overlay-out { from { opacity:1; } to { opacity:0; } }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'rgba(5,12,24,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: `${closing ? 'vp-overlay-out' : 'vp-overlay-in'} 0.3s ease forwards`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
      }}>
        <div style={{
          width: '100%', maxWidth: '460px',
          background: 'linear-gradient(145deg, #0f1e32 0%, #0a1525 100%)',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
          overflow: 'hidden',
          animation: `${closing ? 'vp-ann-out' : 'vp-ann-in'} 0.32s cubic-bezier(.22,.68,0,1.2) forwards`,
          position: 'relative',
        }}>
          {/* Kapat butonu */}
          <button
            onClick={dismiss}
            style={{
              position: 'absolute', top: '14px', right: '14px', zIndex: 2,
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            ✕
          </button>

          {/* Görsel */}
          {ann.image_url && (
            <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={ann.image_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(10,21,37,0.95) 100%)',
              }} />
            </div>
          )}

          {/* İçerik */}
          <div style={{ padding: ann.image_url ? '0 24px 28px' : '36px 24px 28px' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: '20px', padding: '3px 10px',
              fontSize: '11px', fontWeight: '700', color: '#34d399',
              letterSpacing: '1px', textTransform: 'uppercase',
              marginBottom: '14px',
              marginTop: ann.image_url ? '-18px' : 0,
              position: 'relative',
            }}>
              📢 Duyuru
            </div>

            {/* Başlık */}
            <h2 style={{
              margin: '0 0 10px', fontSize: '20px', fontWeight: '800',
              color: 'white', lineHeight: 1.25,
              fontFamily: 'system-ui, sans-serif',
            }}>
              {ann.title}
            </h2>

            {/* Mesaj */}
            <p style={{
              margin: '0 0 20px', fontSize: '14px', color: 'rgba(255,255,255,0.68)',
              lineHeight: 1.65, fontFamily: 'system-ui, sans-serif',
            }}>
              {ann.body}
            </p>

            {/* Kapat butonu (alt) */}
            <button
              onClick={dismiss}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #1a3a5c, #185FA5)',
                border: 'none', borderRadius: '10px',
                color: 'white', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
                letterSpacing: '0.5px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Tamam, Anladım
            </button>

            {/* Footer */}
            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
              Vectropus Platformu
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
