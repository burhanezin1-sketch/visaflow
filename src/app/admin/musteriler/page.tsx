'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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

export default function AdminMusterilerPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [clients, setClients] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [danismanlar, setDanismanlar] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [danismanFilter, setDanismanFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!companyId) return
    fetchData()
  }, [companyId])

  async function fetchData() {
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*, applications(*), users(full_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
    setClients(clientsData || [])
    setFiltered(clientsData || [])
    setDanismanlar(usersData || [])
    setLoading(false)
  }

  useEffect(() => {
    let result = clients
    if (search) result = result.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()))
    if (danismanFilter) result = result.filter(c => c.danisan_id === danismanFilter)
    setFiltered(result)
  }, [search, danismanFilter, clients])

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid rgba(188,204,226,0.3)', padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Tüm Müşteriler</h2>
        <span style={{ fontSize: '12px', color: '#9aaabb' }}>{filtered.length} müşteri</span>
      </div>
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e4eaf5' }}>
        <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
          <div style={{ padding: isMobile ? '0.625rem 0.875rem' : '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="İsim ara..."
              style={{ padding: '7px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '12px', outline: 'none', width: isMobile ? '100%' : '160px', boxSizing: 'border-box' }}
            />
            {!isMobile && (
              <select value={danismanFilter} onChange={e => setDanismanFilter(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '12px', background: '#e4eaf5', outline: 'none' }}>
                <option value="">Tüm Danışmanlar</option>
                {danismanlar.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr>
                  {['Ad Soyad', 'Danışman', 'Ülke', 'Vize Tipi', 'Durum', 'Tarih'].map(h => (
                    <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid rgba(188,204,226,0.3)', background: '#eef2f9' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const app = c.applications?.[0]
                  const s = statusMap[app?.status] || statusMap.missing
                  return (
                    <tr key={c.id} onClick={() => router.push(`/dashboard/musteriler/${c.id}`)} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{c.full_name}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{c.users?.full_name || '-'}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{app?.country || '-'}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '13px', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>{app?.visa_type || '-'}</td>
                      <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#9aaabb', borderBottom: '1px solid rgba(188,204,226,0.3)' }}>
                        {new Date(c.created_at).toLocaleDateString('tr-TR')}
                      </td>
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
