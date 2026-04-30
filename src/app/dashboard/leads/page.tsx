'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [portalLink, setPortalLink] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  async function sahiplen(lead: any) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('leads')
      .update({ status: 'claimed', claimed_by: user?.id, claimed_at: new Date().toISOString() })
      .eq('id', lead.id)
    fetchLeads()
  }

  async function leadSonuc(lead: any, sonuc: string) {
    if (sonuc === 'converted') {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          company_id: 'aaaaaaaa-0000-0000-0000-000000000001',
          danisan_id: user?.id,
          full_name: lead.full_name,
          phone: lead.phone,
        })
        .select()
        .single()

      if (newClient) {
        await supabase.from('applications').insert({
          company_id: 'aaaaaaaa-0000-0000-0000-000000000001',
          client_id: newClient.id,
          country: lead.country,
          visa_type: lead.visa_type,
          status: 'waiting',
        })
        const link = `${window.location.origin}/portal/${newClient.portal_token}`
        setPortalLink(link)
        setShowModal(true)
      }
    }

    await supabase.from('leads').update({ status: sonuc }).eq('id', lead.id)
    fetchLeads()
  }

  function copyLink() {
    navigator.clipboard.writeText(portalLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusStyle: any = {
    waiting: { label: 'Bekliyor', bg: '#fff8ec', color: '#92600a' },
    claimed: { label: 'Sahiplenildi', bg: '#eef4fb', color: '#1a5fa5' },
    converted: { label: 'Müşteri Oldu', bg: '#edfaf3', color: '#1a7a45' },
    cancelled: { label: 'İptal', bg: '#f5f5f5', color: '#888' },
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Potansiyel Müşteriler" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.25rem' }}>
          WhatsApp chatbottan gelen potansiyel müşteriler.
        </div>

        {leads.map(lead => {
          const s = statusStyle[lead.status] || statusStyle.waiting
          return (
            <div key={lead.id} style={{
              background: 'white', border: '1px solid #e8e4da',
              borderRadius: '12px', padding: '1.25rem',
              marginBottom: '12px', display: 'flex', gap: '1rem',
              borderLeft: lead.status === 'claimed' ? '3px solid #1a5fa5' : lead.status === 'converted' ? '3px solid #1a7a45' : '1px solid #e8e4da',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a3a5c, #0d1f35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '600', color: 'white', flexShrink: 0
              }}>
                {lead.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0d1f35' }}>
                      {lead.full_name}
                      <span style={{ fontSize: '11px', color: '#9aaabb', fontWeight: '400', marginLeft: '8px' }}>{lead.phone}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: '500' }}>
                      {lead.country} · {lead.visa_type} · AI ile konuştu
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px' }}>{s.label}</span>
                    <span style={{ fontSize: '11px', color: '#9aaabb' }}>
                      {new Date(lead.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: '#faf8f3', borderRadius: '8px', padding: '8px 12px',
                  margin: '10px 0', fontSize: '12px', color: '#5a6a7a',
                  borderLeft: '3px solid #c9a84c', lineHeight: '1.5'
                }}>
                  💬 "{lead.ai_message}"
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {lead.status === 'waiting' && (
                    <button onClick={() => sahiplen(lead)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      📞 Arayacağım
                    </button>
                  )}
                  {lead.status === 'claimed' && (
                    <>
                      <button onClick={() => leadSonuc(lead, 'converted')} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✅ Müşteri Oldu</button>
                      <button onClick={() => leadSonuc(lead, 'waiting')} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#92600a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⏳ Tekrar Arayacak</button>
                      <button onClick={() => leadSonuc(lead, 'cancelled')} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#888', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>❌ İlgilenmedi</button>
                    </>
                  )}
                  {lead.status === 'converted' && (
                    <span style={{ fontSize: '12px', color: '#1a7a45', fontWeight: '500' }}>✅ Müşteriler listesine eklendi</span>
                  )}
                  {lead.status === 'cancelled' && (
                    <span style={{ fontSize: '12px', color: '#888' }}>İptal edildi</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Portal Linki Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 500, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '2rem',
            width: '380px', maxWidth: '95vw', textAlign: 'center',
            boxShadow: '0 12px 40px rgba(13,31,53,0.12)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '0.75rem' }}>✅</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px', color: '#0d1f35' }}>Müşteri Oluşturuldu!</h3>
            <p style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.25rem' }}>
              Portal linkini WhatsApp'tan müşteriye gönderin.
            </p>
            <div style={{
              background: '#faf8f3', borderRadius: '8px', padding: '10px 12px',
              fontSize: '12px', fontFamily: 'monospace', color: '#0d1f35',
              wordBreak: 'break-all', marginBottom: '10px', textAlign: 'left',
              border: '1px solid #e8e4da'
            }}>
              {portalLink}
            </div>
            <button
              onClick={copyLink}
              style={{ width: '100%', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '8px' }}
            >
              {copied ? '✓ Kopyalandı!' : '📋 Linki Kopyala'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{ width: '100%', padding: '10px', background: '#faf8f3', color: '#5a6a7a', border: '1px solid #e8e4da', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}