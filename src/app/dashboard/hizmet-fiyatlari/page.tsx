'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useIsMobile } from '@/lib/useIsMobile'

type Price = {
  id: string; service_name: string; price: number; currency: string
  nationality: string; description: string | null
}

export default function HizmetFiyatlariPage() {
  const isMobile = useIsMobile()
  const [prices, setPrices]   = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    supabase
      .from('global_service_prices')
      .select('id, service_name, price, currency, nationality, description')
      .eq('is_active', true)
      .order('service_name')
      .then(({ data }) => { setPrices(data || []); setLoading(false) })
  }, [])

  const filtered = prices.filter(p =>
    !search ||
    p.service_name.toLowerCase().includes(search.toLowerCase()) ||
    p.nationality.toLowerCase().includes(search.toLowerCase())
  )

  const thS: React.CSSProperties = {
    padding: isMobile ? '8px 10px' : '10px 16px',
    fontSize: '10px', color: '#9aaabb', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.8px',
    textAlign: 'left', borderBottom: '1px solid #e2e2e8',
    background: '#f5f5f7', whiteSpace: 'nowrap',
  }
  const tdS: React.CSSProperties = {
    padding: isMobile ? '10px' : '12px 16px',
    fontSize: '13px', color: '#0d1f35', borderBottom: '1px solid #f0f0f4',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="💰 Hizmet Fiyatları" />
      <div style={{ padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>

        {/* Arama */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Hizmet adı veya uyruk ile ara..."
            style={{ width: '100%', maxWidth: '400px', padding: '9px 14px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9aaabb' }}>Yükleniyor...</div>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Hizmet Adı', 'Fiyat', 'Para Birimi', 'Uyruk', 'Açıklama'].map(h => (
                      <th key={h} style={thS}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ ...tdS, textAlign: 'center', color: '#9aaabb', padding: '2.5rem' }}>
                        {search ? 'Aramanızla eşleşen hizmet bulunamadı.' : 'Henüz hizmet fiyatı tanımlanmamış.'}
                      </td>
                    </tr>
                  ) : filtered.map(p => (
                    <tr key={p.id}>
                      <td style={{ ...tdS, fontWeight: '600' }}>{p.service_name}</td>
                      <td style={{ ...tdS, fontWeight: '500', color: '#1a5fa5' }}>
                        {p.price.toLocaleString('tr-TR')}
                      </td>
                      <td style={tdS}>
                        <span style={{ background: p.currency === 'EUR' ? '#eef4fb' : '#edfaf3', color: p.currency === 'EUR' ? '#1a5fa5' : '#1a7a45', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                          {p.currency}
                        </span>
                      </td>
                      <td style={{ ...tdS, color: '#5a6a7a' }}>{p.nationality}</td>
                      <td style={{ ...tdS, color: '#5a6a7a' }}>{p.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div style={{ padding: '10px 16px', background: '#f5f5f7', borderTop: '1px solid #e2e2e8', fontSize: '12px', color: '#9aaabb' }}>
                {filtered.length} hizmet gösteriliyor
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
