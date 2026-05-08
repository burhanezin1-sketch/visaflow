'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'

export default function LeadsPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showMusteriModal, setShowMusteriModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [prices, setPrices] = useState<any[]>([])
  const [form, setForm] = useState({ country: 'Schengen', visa_type: 'Turist' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!companyId) return
    fetchData()
    fetchPrices()
  }, [companyId])

  async function fetchData() {
    const { data } = await supabase
      .from('leads')
      .select('*, users!leads_claimed_by_fkey(name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  async function fetchPrices() {
    const { data } = await supabase
      .from('service_prices')
      .select('*')
      .eq('company_id', companyId)
    setPrices(data || [])
  }

  async function sahiplen(lead: any) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('leads')
      .update({
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
        status: 'claimed'
      })
      .eq('id', lead.id)
    if (!error) fetchData()
  }

  async function musteriYap() {
    if (!selectedLead || !companyId) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const clientName = selectedLead.name || selectedLead.phone

    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        company_id: companyId,
        danisan_id: user?.id,
        full_name: clientName,
        phone: selectedLead.phone,
      })
      .select()
      .single()

    if (clientError || !newClient) {
      console.error('Client oluşturma hatası:', clientError)
      setSaving(false)
      return
    }

    const price = prices.find(p => p.country === form.country && p.visa_type === form.visa_type)

    const { data: app, error: appError } = await supabase
      .from('applications')
      .insert({
        company_id: companyId,
        client_id: newClient.id,
        country: form.country,
        visa_type: form.visa_type,
        status: 'missing',
      })
      .select()
      .single()

    if (appError) {
      console.error('Başvuru oluşturma hatası:', appError)
    }

    if (app && price) {
      await supabase.from('payments').insert({
        company_id: companyId,
        application_id: app.id,
        total_amount: price.price,
        paid_amount: 0,
      })
    }

    await supabase.from('leads').update({ status: 'converted' }).eq('id', selectedLead.id)

    setSaving(false)
    setShowMusteriModal(false)
    router.push(`/dashboard/musteriler/${newClient.id}`)
  }

  const statusLabel: any = {
    waiting: { label: 'Bekliyor', bg: '#fff8ec', color: '#92600a' },
    claimed: { label: 'Sahiplenildi', bg: '#eef4fb', color: '#1a5fa5' },
    contacted: { label: 'İletişime Geçildi', bg: '#eef4fb', color: '#1a5fa5' },
    converted: { label: 'Müşteri Oldu ✓', bg: '#edfaf3', color: '#1a7a45' },
    lost: { label: 'Kaybedildi', bg: '#fef0ee', color: '#c0392b' },
  }

  const countries = [...new Set(prices.map(p => p.country))]
  const visaTypes = [...new Set(prices.filter(p => p.country === form.country).map(p => p.visa_type))]

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Potansiyel Müşteriler" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>Lead Listesi</h3>
            <span style={{ fontSize: '12px', color: '#9aaabb' }}>{leads.filter(l => l.status === 'waiting').length} bekliyor</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Telefon', 'Ne İstiyor?', 'Danışman', 'Durum', ''].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9aaabb', fontSize: '13px' }}>
                    Henüz potansiyel müşteri yok
                  </td>
                </tr>
              )}
              {leads.map(lead => {
                const s = statusLabel[lead.status] || statusLabel.waiting
                return (
                  <tr key={lead.id}>
                    <td style={{ padding: '12px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0ede6' }}>
                      <div>{lead.name || '—'}</div>
                      <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{lead.phone}</div>
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0ede6', maxWidth: '280px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '260px'
                      }}>
                        {lead.ai_message || lead.message || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f0ede6' }}>
                      {lead.users?.name || 'Atanmadı'}
                    </td>
                    <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                      <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '12px 1.25rem', borderBottom: '1px solid #f0ede6' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {lead.status === 'waiting' && (
                          <button
                            onClick={() => sahiplen(lead)}
                            style={{ padding: '4px 10px', fontSize: '11px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Sahiplen
                          </button>
                        )}
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => { setSelectedLead(lead); setShowMusteriModal(true) }}
                            style={{ padding: '4px 10px', fontSize: '11px', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Müşteri Yap
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showMusteriModal && selectedLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '420px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px', color: '#0d1f35' }}>Müşteriye Dönüştür</h3>

            <div style={{ background: '#f5f8ff', border: '1px solid #e0e8f5', borderRadius: '8px', padding: '10px 12px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '12px', color: '#5a6a7a', marginBottom: '4px' }}>📱 {selectedLead.phone}</div>
              {(selectedLead.ai_message || selectedLead.message) && (
                <div style={{ fontSize: '12px', color: '#1a3a5c', fontStyle: 'italic' }}>
                  "{selectedLead.ai_message || selectedLead.message}"
                </div>
              )}
            </div>

            <p style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.25rem' }}>Vize bilgilerini seçin:</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
                <select
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value, visa_type: 'Turist' })}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', background: '#faf8f3', outline: 'none', fontFamily: 'inherit' }}
                >
                  {countries.length > 0 ? countries.map(c => <option key={c}>{c}</option>) : <option>Schengen</option>}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
                <select
                  value={form.visa_type}
                  onChange={e => setForm({ ...form, visa_type: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', background: '#faf8f3', outline: 'none', fontFamily: 'inherit' }}
                >
                  {visaTypes.length > 0 ? visaTypes.map(v => <option key={v}>{v}</option>) : <option>Turist</option>}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setShowMusteriModal(false); setSaving(false) }}
                style={{ flex: 1, padding: '10px', background: '#faf8f3', color: '#5a6a7a', border: '1px solid #e8e4da', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                İptal
              </button>
              <button
                onClick={musteriYap}
                disabled={saving}
                style={{ flex: 2, padding: '10px', background: saving ? '#aaa' : '#1a7a45', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {saving ? 'Kaydediliyor...' : '✓ Müşteriye Dönüştür'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}