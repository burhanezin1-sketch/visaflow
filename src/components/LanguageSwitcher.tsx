'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const LOCALES = [
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'pl', label: '🇵🇱 Polski' },
]

function getCurrentLocale(): string {
  if (typeof document === 'undefined') return 'tr'
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]*)/)
  return match ? match[1] : 'tr'
}

interface Props {
  /** Açık renk tema (portal gibi sayfalarda) */
  light?: boolean
}

export default function LanguageSwitcher({ light = false }: Props) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('tr')
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setCurrent(getCurrentLocale())
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLocale(code: string) {
    // Cookie'ye yaz (1 yıl)
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setCurrent(code)
    setOpen(false)
    router.refresh()
  }

  const currentLabel = LOCALES.find(l => l.code === current)?.label ?? '🇹🇷 Türkçe'

  const bg = light ? 'rgba(255,255,255,0.15)' : '#f1f5f9'
  const textColor = light ? 'white' : '#1e293b'
  const borderColor = light ? 'rgba(255,255,255,0.25)' : 'rgba(188,204,226,0.6)'
  const dropdownBg = light ? '#1e293b' : 'white'
  const dropdownBorder = light ? 'rgba(255,255,255,0.1)' : 'rgba(188,204,226,0.5)'
  const itemHoverBg = light ? 'rgba(255,255,255,0.1)' : '#f1f5f9'
  const itemColor = light ? 'rgba(255,255,255,0.9)' : '#1e293b'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', userSelect: 'none' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 10px',
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '8px',
          fontSize: '12px', fontWeight: '500',
          color: textColor,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'opacity 0.15s',
        }}
        aria-label="Dil seç / Select language"
      >
        <span>{currentLabel}</span>
        <span style={{ fontSize: '9px', opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0,
          background: dropdownBg,
          border: `1px solid ${dropdownBorder}`,
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          minWidth: '140px',
          zIndex: 9999,
          overflow: 'hidden',
        }}>
          {LOCALES.map(locale => (
            <button
              key={locale.code}
              onClick={() => switchLocale(locale.code)}
              style={{
                display: 'block', width: '100%',
                padding: '9px 14px',
                background: current === locale.code ? itemHoverBg : 'transparent',
                border: 'none',
                fontSize: '13px',
                color: current === locale.code
                  ? (light ? 'white' : '#1d4ed8')
                  : itemColor,
                fontWeight: current === locale.code ? '600' : '400',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (current !== locale.code) (e.currentTarget as HTMLElement).style.background = itemHoverBg }}
              onMouseLeave={e => { if (current !== locale.code) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {locale.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
