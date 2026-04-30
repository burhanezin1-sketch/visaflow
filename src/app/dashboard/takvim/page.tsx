'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'

export default function TakvimPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('applications')
        .select('*, clients(*)')
        .not('appointment_date', 'is', null)
        .order('appointment_date', { ascending: true })
      setAppointments(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const statusMap: any = {
    missing: { label: 'Evrak Eksik', bg: '#fef0ee', color: '#c0392b' },
    waiting: { label: 'Evrak Bekleniyor', bg: '#fff8ec', color: '#92600a' },
    appointment: { label: 'Randevu Alındı', bg: '#eef4fb', color: '#1a5fa5' },
    done: { label: 'Tamamlandı', bg: '#edfaf3', color: '#1a7a45' },
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Takvim" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Yaklaşan Randevular</h3>
            <span style={{ fontSize: '12px', color: '#9aaabb' }}>{appointments.length} randevu</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tarih', 'Saat', 'Müşteri', 'Konsolosluk', 'Vize', 'Durum'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => {
                const date = new Date(app.appointment_date)
                const s = statusMap[app.status] || statusMap.waiting
                const isGeçmiş = date < new Date()
                return (
                  <tr
                    key={app.id}
                    onClick={() => router.push(`/dashboard/musteriler/${app.client_id}`)}
                    style={{ cursor: 'pointer', opacity: isGeçmiş ? 0.5 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf8f3'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>
                      {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6', color: '#1a5fa5', fontWeight: '500' }}>
                      {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>
                      {app.clients?.full_name}
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0ede6' }}>
                      {app.consulate || '-'}
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>
                      {app.country} {app.visa_type}
                    </td>
                    <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                      <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
              {appointments.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9aaabb', fontSize: '13px' }}>Randevu bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}