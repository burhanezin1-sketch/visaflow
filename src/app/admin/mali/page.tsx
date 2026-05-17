'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'

export default function MaliPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    async function fetchData() {
      const { data } = await supabase
        .from('payments')
        .select('*, applications(country, visa_type, company_id, clients(full_name, users(full_name)))')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
      const seen = new Set()
      const unique = (data || []).filter((p: any) => {
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
      setPayments(unique)
      setLoading(false)
    }
    fetchData()
  }, [companyId])

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const toplamCiro = payments.reduce((sum, p) => sum + p.total_amount, 0)
  const tahsilEdilen = payments.reduce((sum, p) => sum + p.paid_amount, 0)
  const tahsilEdilmemis = toplamCiro - tahsilEdilen
  const bekleyenler = payments.filter(p => p.total_amount - p.paid_amount > 0)
  const fmt = (n: number) => n.toLocaleString('tr-TR') + '₺'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>Mali Durum</h2>
      </div>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Toplam Ciro', value: fmt(toplamCiro), color: '#0d1f35' },
            { label: 'Tahsil Edilen', value: fmt(tahsilEdilen), color: '#1a7a45' },
            { label: 'Tahsil Edilmemiş', value: fmt(tahsilEdilmemis), color: '#c0392b' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Ödeme Bekleyen Müşteriler</h3>
            <span style={{ background: '#fef0ee', color: '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid #f5b8b0' }}>{bekleyenler.length} kişi</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Müşteri', 'Danışman', 'Vize', 'Toplam', 'Ödenen', 'Kalan', 'Durum'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bekleyenler.map(p => {
                const kalan = p.total_amount - p.paid_amount
                const musteri = p.applications?.clients
                return (
                  <tr key={p.id}>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{musteri?.full_name || '-'}</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0ede6' }}>{musteri?.users?.full_name || '-'}</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '12px', borderBottom: '1px solid #f0ede6' }}>{p.applications?.country} {p.applications?.visa_type}</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>{p.total_amount.toLocaleString('tr-TR')}₺</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', color: '#1a7a45', borderBottom: '1px solid #f0ede6' }}>{p.paid_amount.toLocaleString('tr-TR')}₺</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', color: '#c0392b', fontWeight: '600', borderBottom: '1px solid #f0ede6' }}>{kalan.toLocaleString('tr-TR')}₺</td>
                    <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                      <span style={{ background: p.paid_amount > 0 ? '#fff8ec' : '#fef0ee', color: p.paid_amount > 0 ? '#92600a' : '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>
                        {p.paid_amount > 0 ? 'Kısmi Ödeme' : 'Ödeme Bekleniyor'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {bekleyenler.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9aaabb', fontSize: '13px' }}>Tüm ödemeler tahsil edildi! 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Tüm Ödemeler</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Müşteri', 'Vize', 'Toplam', 'Ödenen', 'Durum'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const kalan = p.total_amount - p.paid_amount
                const musteri = p.applications?.clients
                return (
                  <tr key={p.id}>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>{musteri?.full_name || '-'}</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '12px', borderBottom: '1px solid #f0ede6' }}>{p.applications?.country} {p.applications?.visa_type}</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', borderBottom: '1px solid #f0ede6' }}>{p.total_amount.toLocaleString('tr-TR')}₺</td>
                    <td style={{ padding: '10px 1.25rem', fontSize: '13px', color: '#1a7a45', borderBottom: '1px solid #f0ede6' }}>{p.paid_amount.toLocaleString('tr-TR')}₺</td>
                    <td style={{ padding: '10px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                      <span style={{ background: kalan <= 0 ? '#edfaf3' : p.paid_amount > 0 ? '#fff8ec' : '#fef0ee', color: kalan <= 0 ? '#1a7a45' : p.paid_amount > 0 ? '#92600a' : '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>
                        {kalan <= 0 ? 'Tahsil Edildi' : p.paid_amount > 0 ? 'Kısmi Ödeme' : 'Ödeme Bekleniyor'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}