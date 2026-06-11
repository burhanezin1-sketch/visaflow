'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'

const statusMap: any = {
  missing:              { label: 'Evrak Eksik',        bg: '#fef2f2', color: '#dc2626' },
  appointment_waiting:  { label: 'Randevu Bekleniyor', bg: '#fffbeb', color: '#92600a' },
  appointment:          { label: 'Randevu Alındı',     bg: '#eff6ff', color: '#1d4ed8' },
  approved:             { label: 'Onaylandı ✓',        bg: '#f0fdf4', color: '#16a34a' },
  rejected:             { label: 'Reddedildi ✗',       bg: '#fef2f2', color: '#dc2626' },
}

export default function DashboardPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [clients, setClients] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) { setLoading(false); return }
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', user.id).single()
        if (userData?.full_name) setUserName(userData.full_name.split(' ')[0])
      }
      const { data: clientsData } = await supabase.from('clients').select('*, applications(*)').eq('company_id', companyId)
      const { data: leadsData } = await supabase.from('leads').select('*').eq('status', 'waiting').eq('company_id', companyId)
      setClients(clientsData || [])
      setLeads(leadsData || [])
      setLoading(false)
    }
    fetchData()
  }, [companyId, companyLoading])

  const bekleyenEvrak = clients.filter(c => c.applications?.some((a: any) => a.status === 'missing'))
  const randevular    = clients.filter(c => c.applications?.some((a: any) => a.status === 'appointment'))

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const statCards = [
    { label: 'Aktif Dosya',      value: clients.length,       icon: '📂', iconBg: '#eff6ff', iconColor: '#1d4ed8', accent: '#3b82f6', numColor: '#1e3a8a', sub: null,               click: undefined },
    { label: 'Yeni Lead',        value: leads.length,         icon: '⭐', iconBg: '#fffbeb', iconColor: '#d97706', accent: '#f59e0b', numColor: '#92400e', sub: 'Aranmayı bekliyor', click: () => router.push('/dashboard/leads') },
    { label: 'Bekleyen Evrak',   value: bekleyenEvrak.length, icon: '📋', iconBg: '#fef2f2', iconColor: '#dc2626', accent: '#ef4444', numColor: '#991b1b', sub: 'Acil takip',        click: () => router.push('/dashboard/musteriler') },
    { label: 'Bu Hafta Randevu', value: randevular.length,    icon: '📅', iconBg: '#f0fdf4', iconColor: '#16a34a', accent: '#22c55e', numColor: '#14532d', sub: 'Takvimi aç',        click: () => router.push('/dashboard/takvim') },
  ]

  const cardBase: React.CSSProperties = {
    background: 'white',
    border: '1px solid rgba(188,204,226,0.4)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04)',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Dashboard" />
      <div style={{ padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e4eaf5' }}>

        {/* Greeting */}
        <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
          <h2 style={{ fontSize: isMobile ? '17px' : '22px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Günaydın, {userName} 👋
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
          gap: isMobile ? '8px' : '12px',
          marginBottom: isMobile ? '1rem' : '1.5rem',
        }}>
          {statCards.map((s, i) => (
            <div
              key={i}
              onClick={s.click}
              style={{
                background: 'white',
                border: '1px solid rgba(188,204,226,0.4)',
                borderTop: `4px solid ${s.accent}`,
                borderRadius: '16px',
                padding: isMobile ? '0.875rem' : '1.25rem',
                cursor: s.click ? 'pointer' : 'default',
                boxShadow: '0 4px 16px rgba(15,23,42,0.07)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { if (s.click) { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(15,23,42,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(15,23,42,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isMobile ? '8px' : '12px' }}>
                <div style={{ fontSize: '9px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {s.label}
                </div>
                <div style={{ width: isMobile ? '28px' : '34px', height: isMobile ? '28px' : '34px', borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '14px' : '17px', flexShrink: 0 }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: '700', color: s.numColor, lineHeight: 1 }}>
                {s.value}
              </div>
              {s.sub && !isMobile && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>{s.sub} →</div>
              )}
            </div>
          ))}
        </div>

        {/* Main sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '10px' : '1.25rem',
        }}>

          {/* Evrak bekleyen */}
          <div style={{ ...cardBase, borderTop: '4px solid #ef4444' }}>
            <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#1e293b' }}>
                📋 Evrak Bekleyen
              </span>
              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: '1px solid #fca5a5' }}>
                {bekleyenEvrak.length}
              </span>
            </div>
            {bekleyenEvrak.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                Bekleyen evrak yok ✓
              </div>
            ) : (
              <div>
                {bekleyenEvrak.slice(0, isMobile ? 4 : 6).map((c, idx) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/dashboard/musteriler/${c.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: isMobile ? '10px 1rem' : '10px 1.25rem',
                      borderBottom: idx < bekleyenEvrak.slice(0, isMobile ? 4 : 6).length - 1 ? '1px solid rgba(188,204,226,0.3)' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8faff'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef2f2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.full_name}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: '#94a3b8' }}>
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
                {bekleyenEvrak.length > (isMobile ? 4 : 6) && (
                  <div onClick={() => router.push('/dashboard/musteriler')} style={{ padding: isMobile ? '8px 1rem' : '8px 1.25rem', fontSize: '12px', color: '#3b82f6', cursor: 'pointer', textAlign: 'center', borderTop: '1px solid rgba(188,204,226,0.3)', fontWeight: '500' }}>
                    +{bekleyenEvrak.length - (isMobile ? 4 : 6)} daha görüntüle
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Son işlemler */}
          <div style={{ ...cardBase, borderTop: '4px solid #3b82f6' }}>
            <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#1e293b' }}>
                🕐 Son İşlemler
              </span>
              <button
                onClick={() => router.push('/dashboard/musteriler')}
                style={{ padding: '4px 12px', fontSize: '11px', fontWeight: '600', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'opacity 0.2s' }}
              >
                Tümü
              </button>
            </div>
            {clients.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                Henüz müşteri yok
              </div>
            ) : (
              <div>
                {clients.slice(0, isMobile ? 4 : 5).map((c, idx, arr) => {
                  const app = c.applications?.[0]
                  const s = statusMap[app?.status] || statusMap.missing
                  return (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/dashboard/musteriler/${c.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: isMobile ? '10px 1rem' : '10px 1.25rem',
                        borderBottom: idx < arr.length - 1 ? '1px solid rgba(188,204,226,0.3)' : 'none',
                        cursor: 'pointer', gap: '8px', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8faff'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#1d4ed8' }}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.full_name}
                          </div>
                          {app?.country && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                              {app.country} · {app.visa_type}
                            </div>
                          )}
                        </div>
                      </div>
                      <span style={{ background: s.bg, color: s.color, fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, border: `1px solid ${s.color}22` }}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
