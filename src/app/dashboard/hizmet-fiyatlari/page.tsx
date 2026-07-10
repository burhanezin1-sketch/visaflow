'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'

type Price = {
  id: string; country: string; visa_type: string; price: number
  currency: string; nationality?: string
}

const CUR_SYM: Record<string, string> = { TRY: '₺', TL: '₺', EUR: '€', USD: '$' }

function fmtPrice(price: number, currency: string) {
  const sym = CUR_SYM[currency] || currency
  return currency === 'TRY' || currency === 'TL'
    ? `${price.toLocaleString('tr-TR')} ${sym}`
    : `${sym} ${price.toLocaleString('en-US')}`
}

export default function HizmetFiyatlariPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const [prices, setPrices]   = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('service_prices')
      .select('id, country, visa_type, price, currency, nationality')
      .eq('company_id', companyId)
      .order('country')
      .then(({ data }) => { setPrices(data || []); setLoading(false) })
  }, [companyId])

  const filtered = prices.filter(p =>
    !search ||
    p.country?.toLowerCase().includes(search.toLowerCase()) ||
    p.visa_type?.toLowerCase().includes(search.toLowerCase()) ||
    p.nationality?.toLowerCase().includes(search.toLowerCase())
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
      <Topbar title="Hizmet Fiyatları" />
      <div style={{ padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>

        <div style={{ marginBottom: '1rem' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ülke, vize tipi veya uyruk ile ara..."
            style={{ width: '100%', maxWidth: '400px', padding: '9px 14px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {companyLoading || loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9aaabb' }}>Yükleniyor...</div>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Ülke', 'Vize Tipi', 'Uyruk', 'Fiyat'].map(h => (
                      <th key={h} style={thS}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ ...tdS, textAlign: 'center', color: '#9aaabb', padding: '2.5rem' }}>
                        {search ? 'Aramanızla eşleşen fiyat bulunamadı.' : 'Henüz hizmet fiyatı tanımlanmamış.'}
                      </td>
                    </tr>
                  ) : filtered.map(p => (
                    <tr key={p.id}>
                      <td style={{ ...tdS, fontWeight: '600' }}>{p.country}</td>
                      <td style={{ ...tdS, color: '#5a6a7a' }}>{p.visa_type}</td>
                      <td style={{ ...tdS, color: '#5a6a7a' }}>{p.nationality || '—'}</td>
                      <td style={{ ...tdS, fontWeight: '600', color: '#1a7a45' }}>
                        {fmtPrice(p.price, p.currency || 'TRY')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div style={{ padding: '10px 16px', background: '#f5f5f7', borderTop: '1px solid #e2e2e8', fontSize: '12px', color: '#9aaabb' }}>
                {filtered.length} hizmet fiyatı
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
