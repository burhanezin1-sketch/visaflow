'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTranslations } from 'next-intl'

const typeIcon: Record<string, string> = {
  evrak: '📎', randevu: '📅', odeme: '💰', pasaport: '🛂',
}
const typeStyle: Record<string, { color: string; border: string; accent: string }> = {
  evrak:   { color: '#dc2626', border: '#fca5a5', accent: '#ef4444' },
  randevu: { color: '#1d4ed8', border: '#93c5fd', accent: '#3b82f6' },
  odeme:   { color: '#065f46', border: '#6ee7b7', accent: '#10b981' },
  pasaport:{ color: '#475569', border: '#cbd5e1', accent: '#64748b' },
}

function GorevItem({ gorev, onToggle, onNavigate, compact }: {
  gorev: any; onToggle: (id: string) => void; onNavigate: (clientId: string) => void; compact?: boolean
}) {
  const st = typeStyle[gorev.type] || typeStyle.pasaport
  return (
    <div style={{
      display: 'flex', alignItems: compact ? 'flex-start' : 'center', gap: '10px',
      padding: compact ? '10px 12px' : '12px 14px',
      borderRadius: '12px',
      border: `1px solid ${st.border}`,
      marginBottom: '6px',
      background: 'white',
      borderLeft: `4px solid ${st.accent}`,
      boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        background: `${st.accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px',
      }}>
        {typeIcon[gorev.type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? '12px' : '13px', fontWeight: '500', color: '#1e293b' }}>{gorev.title}</div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : 'normal' }}>
          <strong>{gorev.client_name}</strong> — {gorev.aciklama}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
        <button onClick={() => onNavigate(gorev.client_id)}
          style={{ padding: compact ? '5px 9px' : '5px 11px', fontSize: '11px', background: 'linear-gradient(135deg, #1d4ed8, #4338ca)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}>
          →
        </button>
        <button onClick={() => onToggle(gorev.id)}
          style={{ padding: compact ? '5px 9px' : '5px 11px', fontSize: '11px', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', transition: 'opacity 0.2s' }}>
          ✓
        </button>
      </div>
    </div>
  )
}

export default function GorevlerPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const t = useTranslations('gorevler')
  const tc = useTranslations('common')
  const [gorevler, setGorevler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tamamlanan, setTamamlanan] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    if (!companyId) return
    try {
      const stored = localStorage.getItem(`gorevler-done-${companyId}`)
      if (stored) setTamamlanan(new Set(JSON.parse(stored)))
    } catch {}
  }, [companyId])

  useEffect(() => {
    if (companyLoading) return
    if (!companyId) { setLoading(false); return }
    fetchGorevler()
    const channel = supabase.channel('gorevler-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => fetchGorevler())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchGorevler())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchGorevler())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [companyId, companyLoading])

  async function fetchGorevler() {
    const { data: clients } = await supabase.from('clients').select('*, applications(*)').eq('company_id', companyId)
    const { data: payments } = await supabase.from('payments').select('*, applications(client_id)').eq('company_id', companyId)
    const liste: any[] = []
    clients?.forEach(c => {
      const app = c.applications?.[0]
      const payment = payments?.find(p => p.applications?.client_id === c.id)
      if (app?.status === 'missing') liste.push({ id: `evrak-${c.id}`, client_id: c.id, client_name: c.full_name, title: t('tasks.sendDocReminder'), type: 'evrak', aciklama: t('tasks.missingDocsDesc', { country: app.country, visaType: app.visa_type }) })
      if (app?.status === 'appointment_waiting') liste.push({ id: `randevu-${c.id}`, client_id: c.id, client_name: c.full_name, title: t('tasks.scheduleAppointment'), type: 'randevu', aciklama: t('tasks.appointmentDesc', { country: app.country, visaType: app.visa_type }) })
      if (payment && payment.total_amount - payment.paid_amount > 0) liste.push({ id: `odeme-${c.id}`, client_id: c.id, client_name: c.full_name, title: t('tasks.paymentFollowup'), type: 'odeme', aciklama: t('tasks.paymentDesc', { amount: (payment.total_amount - payment.paid_amount).toLocaleString('tr-TR') }) })
      if (c.passport_expiry) {
        const expiry = new Date(c.passport_expiry)
        const ucAySonra = new Date(); ucAySonra.setMonth(ucAySonra.getMonth() + 3)
        if (expiry < ucAySonra) liste.push({ id: `pasaport-${c.id}`, client_id: c.id, client_name: c.full_name, title: t('tasks.passportRenewal'), type: 'pasaport', aciklama: t('tasks.passportDesc', { date: expiry.toLocaleDateString('tr-TR') }) })
      }
    })
    setGorevler(liste)
    setLoading(false)
  }

  function toggleTamamla(id: string) {
    setTamamlanan(prev => {
      const yeni = new Set(prev)
      if (yeni.has(id)) yeni.delete(id); else yeni.add(id)
      if (companyId) { try { localStorage.setItem(`gorevler-done-${companyId}`, JSON.stringify([...yeni])) } catch {} }
      return yeni
    })
  }

  const aktif = gorevler.filter(g => !tamamlanan.has(g.id))
  const eksikEvraklar = aktif.filter(g => g.type !== 'odeme')
  const eksikOdemeler = aktif.filter(g => g.type === 'odeme')

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>{tc('loading')}</div>
    </div>
  )

  const nav = (clientId: string) => router.push(`/dashboard/musteriler/${clientId}`)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={t('pageTitle')} />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#e4eaf5' }}>
        {aktif.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '13px' }}>
            {t('empty')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '10px' : '1.25rem' }}>

            {/* Eksik Evraklar */}
            <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
              <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fef2f2, #fff5f4)', borderTop: '4px solid #ef4444' }}>
                <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#991b1b' }}>{t('sections.missingDocs')}</span>
                <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: '1px solid #fca5a5' }}>{eksikEvraklar.length}</span>
              </div>
              <div style={{ padding: isMobile ? '0.5rem' : '0.75rem' }}>
                {eksikEvraklar.length === 0
                  ? <div style={{ textAlign: 'center', padding: '1.25rem', color: '#94a3b8', fontSize: '12px' }}>{t('sections.emptyDocs')}</div>
                  : eksikEvraklar.map(g => <GorevItem key={g.id} gorev={g} onToggle={toggleTamamla} onNavigate={nav} compact={isMobile} />)
                }
              </div>
            </div>

            {/* Eksik Ödemeler */}
            <div style={{ background: 'white', border: '1px solid rgba(188,204,226,0.45)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,0.07)' }}>
              <div style={{ padding: isMobile ? '0.75rem 1rem' : '1rem 1.25rem', borderBottom: '1px solid rgba(188,204,226,0.35)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', borderTop: '4px solid #10b981' }}>
                <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: '#065f46' }}>{t('sections.missingPayments')}</span>
                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', border: '1px solid #6ee7b7' }}>{eksikOdemeler.length}</span>
              </div>
              <div style={{ padding: isMobile ? '0.5rem' : '0.75rem' }}>
                {eksikOdemeler.length === 0
                  ? <div style={{ textAlign: 'center', padding: '1.25rem', color: '#94a3b8', fontSize: '12px' }}>{t('sections.emptyPayments')}</div>
                  : eksikOdemeler.map(g => <GorevItem key={g.id} gorev={g} onToggle={toggleTamamla} onNavigate={nav} compact={isMobile} />)
                }
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
