'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [clients, setClients] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', user.id).single()
        if (userData?.full_name) setUserName(userData.full_name.split(' ')[0])
      }

      const { data: clientsData } = await supabase
        .from('clients')
        .select('*, applications(*)')
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'waiting')

      setClients(clientsData || [])
      setLeads(leadsData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const bekleyenEvrak = clients.filter(c =>
    c.applications?.some((a: any) => a.status === 'missing' || a.status === 'waiting')
  )
  const randevular = clients.filter(c =>
    c.applications?.some((a: any) => a.status === 'appointment')
  )

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Dashboard" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#0d1f35', margin: 0 }}>
            Günaydın, {userName} 👋
          </h2>
          <p style={{ fontSize: '13px', color: '#5a6a7a', marginTop: '4px' }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Aktif Dosya', value: clients.length, color: '#0d1f35', sub: '+2 bu hafta' },
            { label: 'Yeni Lead', value: leads.length, color: '#92600a', sub: 'Aranmayı bekliyor →', click: () => router.push('/dashboard/leads') },
            { label: 'Bekleyen Evrak', value: bekleyenEvrak.length, color: '#c0392b', sub: 'Acil takip →', click: () => router.push('/dashboard/musteriler') },
            { label: 'Bu Hafta Randevu', value: randevular.length, color: '#1a3a5c', sub: 'Takvimi aç →', click: () => router.push('/dashboard/takvim') },
          ].map((s, i) => (
            <div key={i} onClick={s.click} style={{
              background: 'white', border: '1px solid #e8e4da',
              borderRadius: '12px', padding: '1.25rem',
              cursor: s.click ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
              <div style={{ fontSize: '26px', fontWeight: '500', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '6px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>📋 Evrak Bekleyen Müşteriler</h3>
              <span style={{ background: '#fef0ee', color: '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid #f5b8b0' }}>{bekleyenEvrak.length} kişi</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Müşteri', 'Durum', ''].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bekleyenEvrak.map(c => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/musteriler/${c.id}`)}>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>{c.full_name}</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '11px', color: '#c0392b', borderBottom: '1px solid #f0ede6' }}>
                      {c.applications?.[0]?.status === 'missing' ? 'Evrak Eksik' : 'Evrak Bekleniyor'}
                    </td>
                    <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                      <button style={{ padding: '3px 8px', fontSize: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Profil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>🕐 Son İşlemler</h3>
              <button onClick={() => router.push('/dashboard/musteriler')} style={{ padding: '5px 12px', fontSize: '11px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Tüm Müşteriler</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Müşteri', 'Durum', 'Vize'].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 5).map(c => {
                  const app = c.applications?.[0]
                  const statusMap: any = {
                    missing: { label: 'Evrak Eksik', bg: '#fef0ee', color: '#c0392b' },
                    waiting: { label: 'Evrak Bekleniyor', bg: '#fff8ec', color: '#92600a' },
                    appointment: { label: 'Randevu Alındı', bg: '#eef4fb', color: '#1a5fa5' },
                    done: { label: 'Tamamlandı', bg: '#edfaf3', color: '#1a7a45' },
                  }
                  const s = statusMap[app?.status] || statusMap.waiting
                  return (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/musteriler/${c.id}`)}>
                      <td style={{ padding: '10px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{c.full_name}</td>
                      <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '10px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0ede6' }}>{app?.country} {app?.visa_type}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}