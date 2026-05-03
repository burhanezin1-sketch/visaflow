'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'

export default function GorevlerPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const [gorevler, setGorevler] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tamamlanan, setTamamlanan] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    if (!companyId) return
    fetchGorevler()

    // Realtime — applications veya clients değişince otomatik güncelle
    const channel = supabase
      .channel('gorevler-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => fetchGorevler())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchGorevler())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchGorevler())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [companyId])

  async function fetchGorevler() {
    const { data: clients } = await supabase
      .from('clients')
      .select('*, applications(*)')
      .eq('company_id', companyId)

    const { data: payments } = await supabase
      .from('payments')
      .select('*, applications(client_id)')
      .eq('company_id', companyId)

    const liste: any[] = []

    clients?.forEach(c => {
      const app = c.applications?.[0]
      const payment = payments?.find(p => p.applications?.client_id === c.id)

      if (app?.status === 'missing') {
        liste.push({
          id: `evrak-${c.id}`,
          client_id: c.id,
          client_name: c.full_name,
          title: 'Eksik evrak hatırlatması gönder',
          type: 'evrak',
          priority: 'urgent',
          aciklama: `${app.country} ${app.visa_type} başvurusu için evraklar eksik`,
        })
      }

      if (app?.status === 'appointment_waiting') {
        liste.push({
          id: `randevu-${c.id}`,
          client_id: c.id,
          client_name: c.full_name,
          title: 'Randevu ayarla',
          type: 'randevu',
          priority: 'urgent',
          aciklama: `${app.country} ${app.visa_type} için konsolosluk randevusu bekleniyor`,
        })
      }

      if (payment && payment.total_amount - payment.paid_amount > 0) {
        liste.push({
          id: `odeme-${c.id}`,
          client_id: c.id,
          client_name: c.full_name,
          title: 'Ödeme takibi yap',
          type: 'odeme',
          priority: 'normal',
          aciklama: `Kalan: ${(payment.total_amount - payment.paid_amount).toLocaleString('tr-TR')}₺`,
        })
      }

      if (c.passport_expiry) {
        const expiry = new Date(c.passport_expiry)
        const ucAySonra = new Date()
        ucAySonra.setMonth(ucAySonra.getMonth() + 3)
        if (expiry < ucAySonra) {
          liste.push({
            id: `pasaport-${c.id}`,
            client_id: c.id,
            client_name: c.full_name,
            title: 'Pasaport yenileme uyarısı',
            type: 'pasaport',
            priority: 'normal',
            aciklama: `Pasaport ${expiry.toLocaleDateString('tr-TR')} tarihinde sona eriyor`,
          })
        }
      }
    })

    setGorevler(liste)
    setLoading(false)
  }

  function toggleTamamla(id: string) {
    setTamamlanan(prev => {
      const yeni = new Set(prev)
      if (yeni.has(id)) yeni.delete(id)
      else yeni.add(id)
      return yeni
    })
  }

  const aktif = gorevler.filter(g => !tamamlanan.has(g.id))
  const acil = aktif.filter(g => g.priority === 'urgent')
  const normal = aktif.filter(g => g.priority === 'normal')

  const typeIcon: any = {
    evrak: '📎',
    randevu: '📅',
    odeme: '💰',
    pasaport: '🛂',
  }

  const typeBg: any = {
    evrak: { color: '#c0392b', border: '#f5b8b0' },
    randevu: { color: '#1a5fa5', border: '#b8d4f0' },
    odeme: { color: '#92600a', border: '#f0d896' },
    pasaport: { color: '#5a6a7a', border: '#e8e4da' },
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  function GorevItem({ gorev }: { gorev: any }) {
    const style = typeBg[gorev.type] || typeBg.pasaport
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px', borderRadius: '10px',
        border: `1px solid ${style.border}`,
        marginBottom: '8px', background: 'white',
        borderLeft: `3px solid ${style.color}`,
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{typeIcon[gorev.type]}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35' }}>{gorev.title}</div>
          <div style={{ fontSize: '11px', color: '#5a6a7a', marginTop: '2px' }}>
            <strong>{gorev.client_name}</strong> — {gorev.aciklama}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => router.push(`/dashboard/musteriler/${gorev.client_id}`)} style={{ padding: '4px 10px', fontSize: '11px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Profil
          </button>
          <button onClick={() => toggleTamamla(gorev.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ✓
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Görev Listesi" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        {aktif.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9aaabb', fontSize: '13px' }}>
            🎉 Tüm görevler tamamlandı!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fef0ee, #fff5f4)' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#c0392b' }}>⚡ Acil Görevler</h3>
                  <span style={{ background: '#fef0ee', color: '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid #f5b8b0' }}>{acil.length}</span>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  {acil.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#9aaabb', fontSize: '12px' }}>✓ Acil görev yok</div>
                  ) : (
                    acil.map(g => <GorevItem key={g.id} gorev={g} />)
                  )}
                </div>
              </div>
            </div>
            <div>
              <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fff8ec, #fffbf0)' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#92600a' }}>📋 Normal Görevler</h3>
                  <span style={{ background: '#fff8ec', color: '#92600a', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid #f0d896' }}>{normal.length}</span>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  {normal.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#9aaabb', fontSize: '12px' }}>✓ Normal görev yok</div>
                  ) : (
                    normal.map(g => <GorevItem key={g.id} gorev={g} />)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}