'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'

const statusMap: any = {
  missing: { label: 'Evrak Eksik', bg: '#fef0ee', color: '#c0392b' },
  appointment_waiting: { label: 'Randevu Bekleniyor', bg: '#fff8ec', color: '#92600a' },
  appointment: { label: 'Randevu Alındı', bg: '#eef4fb', color: '#1a5fa5' },
  approved: { label: 'Onaylandı ✓', bg: '#edfaf3', color: '#1a7a45' },
  rejected: { label: 'Reddedildi ✗', bg: '#fef0ee', color: '#c0392b' },
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
  const randevular = clients.filter(c => c.applications?.some((a: any) => a.status === 'appointment'))

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const statCards = [
    { label: 'Aktif Dosya', value: clients.length, color: '#0d1f35', sub: null, click: undefined },
    { label: 'Yeni Lead', value: leads.length, color: '#92600a', sub: 'Aranmayı bekliyor', click: () => router.push('/dashboard/leads') },
    { label: 'Bekleyen Evrak', value: bekleyenEvrak.length, color: '#c0392b', sub: 'Acil takip', click: () => router.push('/dashboard/musteriler') },
    { label: 'Bu Hafta Randevu', value: randevular.length, color: '#1a3a5c', sub: 'Takvimi aç', click: () => router.push('/dashboard/takvim') },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Dashboard" />
      <div style={{ padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>

        {/* Greeting */}
        <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
          <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '500', color: '#0d1f35', margin: 0 }}>
            Günaydın, {userName} 👋
          </h2>
          <p style={{ fontSize: '12px', color: '#9aaabb', marginTop: '3px' }}>
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
                border: '1px solid #e8e4da',
                borderRadius: isMobile ? '10px' : '12px',
                padding: isMobile ? '0.875rem' : '1.25rem',
                cursor: s.click ? 'pointer' : 'default',
              }}
            >
              <div style={{
                fontSize: '9px', fontWeight: '700', color: '#9aaabb',
                marginBottom: isMobile ? '6px' : '8px',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {s.label}
              </div>
              <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '600', color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              {s.sub && !isMobile && (
                <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '6px' }}>{s.sub} →</div>
              )}
            </div>
          ))}
        </div>

        {/* Main sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '8px' : '1.25rem',
        }}>

          {/* Evrak bekleyen */}
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{
              padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem',
              borderBottom: '1px solid #f0ede6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#0d1f35' }}>
                📋 Evrak Bekleyen
              </span>
              <span style={{
                background: '#fef0ee', color: '#c0392b',
                fontSize: '11px', fontWeight: '600',
                padding: '2px 8px', borderRadius: '20px',
                border: '1px solid #f5b8b0',
              }}>
                {bekleyenEvrak.length}
              </span>
            </div>

            {bekleyenEvrak.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', fontSize: '12px', color: '#9aaabb' }}>
                Bekleyen evrak yok
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
                      borderBottom: idx < bekleyenEvrak.length - 1 ? '1px solid #f0ede6' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: '#fef0ee', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700', color: '#c0392b',
                      }}>
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{
                        fontSize: '13px', fontWeight: '500', color: '#0d1f35',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {c.full_name}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: '#9aaabb' }}>
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
                {bekleyenEvrak.length > (isMobile ? 4 : 6) && (
                  <div
                    onClick={() => router.push('/dashboard/musteriler')}
                    style={{ padding: isMobile ? '8px 1rem' : '8px 1.25rem', fontSize: '12px', color: '#378ADD', cursor: 'pointer', textAlign: 'center', borderTop: '1px solid #f0ede6' }}
                  >
                    +{bekleyenEvrak.length - (isMobile ? 4 : 6)} daha
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Son işlemler */}
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{
              padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem',
              borderBottom: '1px solid #f0ede6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#0d1f35' }}>
                🕐 Son İşlemler
              </span>
              <button
                onClick={() => router.push('/dashboard/musteriler')}
                style={{
                  padding: '4px 10px', fontSize: '11px', fontWeight: '500',
                  background: 'transparent', color: '#378ADD',
                  border: '1px solid rgba(55,138,221,0.3)',
                  borderRadius: '6px', cursor: 'pointer',
                }}
              >
                Tümü
              </button>
            </div>

            {clients.length === 0 ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', fontSize: '12px', color: '#9aaabb' }}>
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
                        borderBottom: idx < arr.length - 1 ? '1px solid #f0ede6' : 'none',
                        cursor: 'pointer', gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: '#eef4fb', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: '700', color: '#1a5fa5',
                        }}>
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.full_name}
                          </div>
                          {app?.country && (
                            <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '1px' }}>
                              {app.country} · {app.visa_type}
                            </div>
                          )}
                        </div>
                      </div>
                      <span style={{
                        background: s.bg, color: s.color,
                        fontSize: '10px', fontWeight: '600',
                        padding: '2px 7px', borderRadius: '20px',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
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
