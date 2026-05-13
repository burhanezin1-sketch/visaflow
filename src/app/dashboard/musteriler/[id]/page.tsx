'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter, useParams } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { logAction } from '@/lib/activityLog'

const statusMap: any = {
  missing: { label: 'Evrak Eksik', bg: '#fef0ee', color: '#c0392b' },
  appointment_waiting: { label: 'Randevu Bekleniyor', bg: '#fff8ec', color: '#92600a' },
  appointment: { label: 'Randevu Alındı', bg: '#eef4fb', color: '#1a5fa5' },
  approved: { label: 'Onaylandı ✓', bg: '#edfaf3', color: '#1a7a45' },
  rejected: { label: 'Reddedildi ✗', bg: '#fef0ee', color: '#c0392b' },
}

export default function MusteriDetayPage() {
  const { id } = useParams()
  const router = useRouter()
  const { companyId, loading: companyLoading } = useCompany()
  const [client, setClient] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [waMessages, setWaMessages] = useState<any[]>([])
  const [danismanlar, setDanismanlar] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newNote, setNewNote] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [activeTab, setActiveTab] = useState('evrak')
  const [loading, setLoading] = useState(true)
  const [showDevirModal, setShowDevirModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRandevuModal, setShowRandevuModal] = useState(false)
  const [devirHedef, setDevirHedef] = useState('')
  const [devirNot, setDevirNot] = useState('')
  const [devirSaving, setDevirSaving] = useState(false)
  const [pendingTransfer, setPendingTransfer] = useState<any>(null)
  const [randevuTarih, setRandevuTarih] = useState('')
  const [randevuSaat, setRandevuSaat] = useState('')
  const [randevuKonsolosluk, setRandevuKonsolosluk] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [showOdemeEdit, setShowOdemeEdit] = useState(false)
  const [linkKopyalandi, setLinkKopyalandi] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [visaDocuments, setVisaDocuments] = useState<any[]>([])
  const [eldenVerildiSaving, setEldenVerildiSaving] = useState<Record<string, boolean>>({})
  const [evrakHata, setEvrakHata] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState('')

  useEffect(() => { fetchAll() }, [id, companyId, companyLoading])

  async function fetchAll() {
    if (companyLoading) return
    if (!companyId) { setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    const { data: clientData } = await supabase.from('clients').select('*, users(full_name)').eq('id', id).single()
    const { data: appData } = await supabase.from('applications').select('*').eq('client_id', id).single()
    const { data: paymentData } = await supabase.from('payments').select('*').eq('application_id', appData?.id).single()
    const { data: notesData } = await supabase.from('notes').select('*').eq('application_id', appData?.id).order('created_at', { ascending: false })
    const { data: waData } = await supabase.from('wa_messages').select('*').eq('client_id', id).order('sent_at', { ascending: false })
    const { data: usersData } = await supabase.from('users').select('*').eq('company_id', companyId)
    const { data: transferData } = await supabase.from('transfer_requests').select('*, to_user_info:users!transfer_requests_to_user_fkey(full_name)').eq('client_id', id).eq('status', 'pending').single()
    const { data: docsData } = await supabase.from('documents').select('*').eq('application_id', appData?.id).order('created_at', { ascending: false })

    if (appData?.country && appData?.visa_type) {
      const { data: visaDocs } = await supabase
        .from('visa_documents')
        .select('*')
        .eq('country', appData.country)
        .eq('visa_type', appData.visa_type)
        .order('order_num', { ascending: true })
      setVisaDocuments(visaDocs || [])
    }

    setClient(clientData)
    setApplication(appData)
    setPayment(paymentData)
    if (paymentData) setPaidAmount(paymentData.paid_amount.toString())
    setNotes(notesData || [])
    setWaMessages(waData || [])
    setDanismanlar(usersData || [])
    setCurrentUserName(usersData?.find((u: any) => u.id === user?.id)?.full_name || user?.email || 'Bilinmeyen')
    setPendingTransfer(transferData || null)
    setDocuments(docsData || [])
    setLoading(false)
  }

  async function addNote() {
    if (!newNote.trim() || !application) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('notes').insert({ application_id: application.id, user_id: user?.id, content: newNote }).select().single()
    if (data) setNotes([data, ...notes])
    setNewNote('')
  }

  async function sendMessage() {
    if (!newMessage.trim() || !client) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('wa_messages').insert({ company_id: client.company_id, client_id: client.id, sender_id: user?.id, message: newMessage, direction: 'outbound' }).select().single()
    if (data) setWaMessages([data, ...waMessages])
    setNewMessage('')
  }

  async function devirGonder() {
    if (!devirHedef || !companyId) return
    setDevirSaving(true)
    await supabase.from('transfer_requests').insert({
      company_id: companyId,
      client_id: id, from_user: currentUser?.id, to_user: devirHedef, note: devirNot,
    })
    setDevirSaving(false)
    setShowDevirModal(false)
    fetchAll()
  }

  async function devirKabul() {
    if (!pendingTransfer) return
    await supabase.from('transfer_requests').update({ status: 'accepted' }).eq('id', pendingTransfer.id)
    await supabase.from('clients').update({ danisan_id: currentUser?.id }).eq('id', id)
    fetchAll()
  }

  async function devirReddet() {
    if (!pendingTransfer) return
    await supabase.from('transfer_requests').update({ status: 'rejected' }).eq('id', pendingTransfer.id)
    fetchAll()
  }

  async function deleteClient() {
    await supabase.from('notes').delete().eq('application_id', application?.id)
    await supabase.from('wa_messages').delete().eq('client_id', id)
    await supabase.from('payments').delete().eq('application_id', application?.id)
    await supabase.from('documents').delete().eq('application_id', application?.id)
    await supabase.from('applications').delete().eq('client_id', id)
    await supabase.from('clients').delete().eq('id', id)
    router.push('/dashboard/musteriler')
  }

  async function randevuEkle() {
    if (!randevuTarih || !randevuSaat) return
    const dt = `${randevuTarih}T${randevuSaat}:00`
    await supabase.from('applications').update({
      appointment_date: dt, status: 'appointment', consulate: randevuKonsolosluk || null,
    }).eq('id', application.id)
    setApplication({ ...application, appointment_date: dt, status: 'appointment', consulate: randevuKonsolosluk })
    setShowRandevuModal(false)
  }

  async function odemeGuncelle() {
    if (!paidAmount || !payment) return
    await supabase.from('payments').update({ paid_amount: parseFloat(paidAmount) }).eq('id', payment.id)
    setPayment({ ...payment, paid_amount: parseFloat(paidAmount) })
    setShowOdemeEdit(false)
  }

  async function durumDegistir(val: string) {
    if (!val) return
    if (!confirm(`Durumu "${statusMap[val]?.label}" olarak değiştirmek istediğinizden emin misiniz?`)) return
    await supabase.from('applications').update({ status: val }).eq('id', application.id)
    setApplication({ ...application, status: val })
    logAction(companyId!, currentUser?.id, currentUserName, `Başvuru durumu: ${statusMap[val]?.label}`, 'application', application.id, client?.full_name)
  }

  async function eldenVerildiIsaretle(docName: string) {
    if (!application) return
    setEldenVerildiSaving(prev => ({ ...prev, [docName]: true }))
    setEvrakHata(null)

    const { error: delErr } = await supabase
      .from('documents')
      .delete()
      .eq('application_id', application.id)
      .eq('name', docName)

    if (delErr) {
      setEvrakHata(`Silme hatası: ${delErr.message}`)
      setEldenVerildiSaving(prev => ({ ...prev, [docName]: false }))
      return
    }

    const { error: insErr } = await supabase
      .from('documents')
      .insert({
        application_id: application.id,
        name: docName,
        file_url: null,
        file_name: null,
        status: 'approved',
        delivery_type: 'physical',
      })

    if (insErr) {
      setEvrakHata(`Kayıt hatası: ${insErr.message}`)
      setEldenVerildiSaving(prev => ({ ...prev, [docName]: false }))
      return
    }

    await fetchAll()
    logAction(companyId!, currentUser?.id, currentUserName, `Evrak elden verildi: ${docName}`, 'document', application.id, client?.full_name)
    setEldenVerildiSaving(prev => ({ ...prev, [docName]: false }))
  }

  function copyPortalLink() {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${client.portal_token}`)
    setLinkKopyalandi(true)
    setTimeout(() => setLinkKopyalandi(false), 2000)
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#888' }}>Yükleniyor...</div></div>
  if (!client) return <div style={{ flex: 1, padding: '2rem' }}>Müşteri bulunamadı.</div>

  const s = statusMap[application?.status] || statusMap.missing
  const kalan = payment ? payment.total_amount - payment.paid_amount : 0
  const isMyClient = client.danisan_id === currentUser?.id
  const digerDanismanlar = danismanlar.filter(d => d.id !== currentUser?.id)
  const currentUserRole = danismanlar.find(d => d.id === currentUser?.id)?.role
  const isStaff = currentUserRole === 'admin' || currentUserRole === 'danisan'

  // ✅ DÜZELTME: delivery_type'a göre doğru durum okunuyor
  const evrakDurumu = visaDocuments.map(vd => {
    const doc = documents.find(d => d.name === vd.doc_name)
    return {
      ...vd,
      yuklendi: doc?.delivery_type === 'digital',
      eldenSecildi: doc?.delivery_type === 'physical' && doc?.status === 'physical',
      eldenVerildi: doc?.delivery_type === 'physical' && doc?.status === 'approved',
      fileUrl: doc?.file_url,
    }
  })

  // ✅ DÜZELTME: eldenSecildi de tamamlanmış sayılıyor
  const tamamlanan = evrakDurumu.filter(e => e.yuklendi || e.eldenSecildi || e.eldenVerildi || e.delivery_type === 'company').length
  const toplam = evrakDurumu.length
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={client.full_name} />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>

        {pendingTransfer && pendingTransfer.to_user === currentUser?.id && (
          <div style={{ background: '#eef4fb', border: '1px solid #b8d4f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a5fa5' }}>📨 Size Devir Talebi Var</div>
              <div style={{ fontSize: '12px', color: '#5a6a7a', marginTop: '2px' }}>{client.full_name} dosyası size devredilmek isteniyor.</div>
              {pendingTransfer.note && <div style={{ fontSize: '12px', color: '#5a6a7a', marginTop: '2px' }}>Not: {pendingTransfer.note}</div>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={devirKabul} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✅ Kabul Et</button>
              <button onClick={devirReddet} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#888', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>❌ Reddet</button>
            </div>
          </div>
        )}

        {pendingTransfer && pendingTransfer.from_user === currentUser?.id && (
          <div style={{ background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '13px', color: '#92600a' }}>⏳ Devir talebi gönderildi, karşı tarafın onayı bekleniyor.</div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#5a6a7a' }}>← Geri</button>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', color: '#9aaabb' }}>Danışman: <strong style={{ color: '#0d1f35' }}>{client.users?.full_name || 'Atanmadı'}</strong></div>
            <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{s.label}</span>
            <select onChange={e => durumDegistir(e.target.value)} value="" style={{ padding: '6px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '12px', background: '#f5f5f7', outline: 'none' }}>
              <option value="">Durum Değiştir...</option>
              <option value="missing">Evrak Eksik</option>
              <option value="appointment_waiting">Randevu Bekleniyor</option>
              <option value="appointment">Randevu Alındı</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
            </select>
            <button onClick={() => setShowRandevuModal(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a5fa5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>📅 Randevu Ekle</button>
            {isMyClient && digerDanismanlar.length > 0 && !pendingTransfer && (
              <button onClick={() => setShowDevirModal(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#854f0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>↗ Devret</button>
            )}
            <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '8px', cursor: 'pointer' }}>🗑 Sil</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '10px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Pasaport Bilgileri</h4>
              {[
                ['Ad Soyad', client.full_name],
                ['Telefon', client.phone],
                ['Email', client.email],
                ['Pasaport No', client.passport_no],
                ['Doğum Tarihi', client.birth_date ? new Date(client.birth_date).toLocaleDateString('tr-TR') : '-'],
                ['Son Geçerlilik', client.passport_expiry ? new Date(client.passport_expiry).toLocaleDateString('tr-TR') : '-'],
                ['Vize', application?.country + ' ' + application?.visa_type],
                ['Konsolosluk', application?.consulate || '-'],
                ...(application?.appointment_date ? [['Randevu', new Date(application.appointment_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f0f4', fontSize: '13px' }}>
                  <span style={{ color: '#5a6a7a' }}>{label}</span>
                  <span style={{ fontWeight: '500', color: label === 'Randevu' ? '#1a5fa5' : '#0d1f35' }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f5f5f7', border: '1px solid #e2e2e8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#5a6a7a' }}>🔗 Müşteri Portal Linki</span>
                <button onClick={copyPortalLink} style={{ padding: '4px 12px', fontSize: '11px', fontWeight: '500', background: linkKopyalandi ? '#1a7a45' : '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {linkKopyalandi ? '✓ Kopyalandı' : 'Kopyala'}
                </button>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '10px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Danışman Notları</h4>
              {notes.length === 0 && <p style={{ fontSize: '12px', color: '#9aaabb', marginBottom: '8px' }}>Henüz not yok.</p>}
              {notes.map(n => (
                <div key={n.id} style={{ background: '#f5f5f7', border: '1px solid #e2e2e8', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#9aaabb', marginBottom: '4px' }}>{new Date(n.created_at).toLocaleDateString('tr-TR')}</div>
                  <div style={{ fontSize: '13px' }}>{n.content}</div>
                </div>
              ))}
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Not ekle..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', resize: 'none', height: '70px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              <button onClick={addNote} style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Not Ekle</button>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f4' }}>
              {[['evrak', '📋 Evraklar'], ['odeme', '💳 Ödeme'], ['wp', '💬 WhatsApp']].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} style={{
                  flex: 1, padding: '12px 8px', fontSize: '12px', fontWeight: '500',
                  border: 'none', background: activeTab === key ? '#f5f5f7' : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  color: activeTab === key ? '#0d1f35' : '#9aaabb',
                  borderBottom: activeTab === key ? '2px solid #378ADD' : '2px solid transparent',
                }}>{label}</button>
              ))}
            </div>

            {activeTab === 'evrak' && (
              <div style={{ padding: '1.25rem' }}>
                {evrakHata && (
                  <div style={{ background: '#fef0ee', border: '1px solid #f5c2bb', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#c0392b' }}>
                    {evrakHata}
                  </div>
                )}
                {visaDocuments.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9aaabb' }}>Bu vize tipi için evrak listesi tanımlanmamış.</p>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a6a7a', marginBottom: '6px' }}>
                        <span>Evrak Tamamlanma</span>
                        <span style={{ fontWeight: '600', color: yuzde === 100 ? '#1a7a45' : '#0d1f35' }}>{tamamlanan}/{toplam} — %{yuzde}</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e2e8', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${yuzde}%`, background: yuzde === 100 ? '#1a7a45' : '#1a5fa5', borderRadius: '10px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                    {evrakDurumu.map((evrak, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f4' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          {evrak.delivery_type === 'company' ? (
                            <span style={{ fontSize: '14px' }}>🏢</span>
                          ) : evrak.eldenVerildi ? (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#edfaf3', border: '1.5px solid #1a7a45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#1a7a45', flexShrink: 0 }}>✓</div>
                          ) : evrak.delivery_type === 'physical' ? (
                            <span style={{ fontSize: '14px' }}>🤝</span>
                          ) : evrak.yuklendi ? (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#edfaf3', border: '1.5px solid #1a7a45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#1a7a45', flexShrink: 0 }}>✓</div>
                          ) : evrak.eldenSecildi ? (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff8ec', border: '1.5px solid #f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0 }}>🤝</div>
                          ) : (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #e2e2e8', flexShrink: 0 }} />
                          )}
                          <div>
                            <div style={{ fontSize: '13px', color: '#0d1f35' }}>{evrak.doc_name}</div>
                            <div style={{ fontSize: '10px', color: '#9aaabb', marginTop: '1px' }}>
                              {evrak.delivery_type === 'company'
                                ? 'Firma ekleyecek'
                                : evrak.eldenVerildi
                                ? 'Elden teslim alındı'
                                : evrak.delivery_type === 'physical'
                                ? 'Elden teslim'
                                : evrak.yuklendi
                                ? 'Yüklendi'
                                : evrak.eldenSecildi
                                ? 'Elden getirilecek'
                                : 'Bekleniyor'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {evrak.eldenVerildi ? (
                            <span style={{ fontSize: '10px', color: '#1a7a45', fontWeight: '600', background: '#edfaf3', padding: '3px 8px', borderRadius: '20px' }}>✓ Alındı</span>
                          ) : (
                            <>
                              {evrak.yuklendi && evrak.fileUrl && (
                                <a href={evrak.fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '3px 10px', fontSize: '11px', background: '#1a3a5c', color: 'white', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                  Görüntüle
                                </a>
                              )}
                              {evrak.eldenSecildi && (
                                <span style={{ fontSize: '10px', color: '#92600a', fontWeight: '600', background: '#fff8ec', padding: '3px 8px', borderRadius: '20px' }}>Elden</span>
                              )}
                              {!evrak.yuklendi && !evrak.eldenSecildi && evrak.delivery_type === 'physical' && (
                                <span style={{ fontSize: '10px', color: '#92600a', fontWeight: '600', background: '#fff8ec', padding: '3px 8px', borderRadius: '20px' }}>Zorunlu Elden</span>
                              )}
                              {evrak.delivery_type === 'company' && (
                                <span style={{ fontSize: '10px', color: '#1a5fa5', fontWeight: '600', background: '#eef4fb', padding: '3px 8px', borderRadius: '20px' }}>Firma</span>
                              )}
                              {isStaff && evrak.delivery_type !== 'company' && (
                                <button
                                  onClick={() => eldenVerildiIsaretle(evrak.doc_name)}
                                  disabled={!!eldenVerildiSaving[evrak.doc_name]}
                                  style={{ padding: '3px 8px', fontSize: '11px', fontWeight: '500', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: eldenVerildiSaving[evrak.doc_name] ? 0.6 : 1 }}
                                >
                                  {eldenVerildiSaving[evrak.doc_name] ? '...' : 'Elden Verildi'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <button style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      📎 Evrak Hatırlatması Gönder
                    </button>
                  </>
                )}
              </div>
            )}

            {activeTab === 'odeme' && (
              <div style={{ padding: '1.25rem' }}>
                {payment ? (
                  <>
                    {[
                      ['Hizmet Bedeli', payment.total_amount.toLocaleString('tr-TR') + '₺', '#0d1f35'],
                      ['Ödenen', payment.paid_amount.toLocaleString('tr-TR') + '₺', '#1a7a45'],
                      ['Kalan', kalan.toLocaleString('tr-TR') + '₺', kalan > 0 ? '#c0392b' : '#1a7a45'],
                    ].map(([label, value, color]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f4', fontSize: '13px' }}>
                        <span style={{ color: '#5a6a7a' }}>{label}</span>
                        <span style={{ fontWeight: '600', color }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ padding: '8px 0', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5a6a7a' }}>Durum</span>
                      <span style={{ background: kalan <= 0 ? '#edfaf3' : kalan < payment.total_amount ? '#fff8ec' : '#fef0ee', color: kalan <= 0 ? '#1a7a45' : kalan < payment.total_amount ? '#92600a' : '#c0392b', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>
                        {kalan <= 0 ? 'Tahsil Edildi' : kalan < payment.total_amount ? 'Kısmi Ödeme' : 'Ödeme Bekleniyor'}
                      </span>
                    </div>
                    {showOdemeEdit ? (
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ödenen Tutar (₺)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                          <button onClick={odemeGuncelle} style={{ padding: '8px 14px', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Kaydet</button>
                          <button onClick={() => setShowOdemeEdit(false)} style={{ padding: '8px 10px', background: '#f5f5f7', color: '#888', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>İptal</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowOdemeEdit(true)} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>💰 Ödeme Güncelle</button>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: '12px', color: '#9aaabb' }}>Ödeme kaydı bulunamadı.</p>
                )}
              </div>
            )}

            {activeTab === 'wp' && (
              <div style={{ padding: '1.25rem' }}>
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                  {waMessages.length === 0 && <p style={{ fontSize: '12px', color: '#9aaabb' }}>Henüz mesaj yok.</p>}
                  {waMessages.map(m => (
                    <div key={m.id} style={{ background: '#f5f5f7', border: '1px solid #e2e2e8', borderRadius: '8px', padding: '9px 12px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#9aaabb', marginBottom: '4px' }}>📤 {new Date(m.sent_at).toLocaleDateString('tr-TR')}</div>
                      <div style={{ fontSize: '13px' }}>{m.message}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[
                    ['📎 Evrak', 'Eksik evraklarınızı portala yüklemenizi rica ederiz.'],
                    ['📅 Randevu', 'Randevunuz yakında belirlenecektir.'],
                    ['💰 Ödeme', 'Kalan ödemenizin yapılmasını rica ederiz.'],
                    ['✅ Tebrik', 'Vize başvurunuz tamamlandı. İyi seyahatler!'],
                  ].map(([label, msg]) => (
                    <button key={label} onClick={() => setNewMessage(msg)} style={{ padding: '5px 10px', fontSize: '11px', border: '1.5px solid #e2e2e8', borderRadius: '20px', background: '#f5f5f7', cursor: 'pointer', fontFamily: 'inherit', color: '#5a6a7a' }}>{label}</button>
                  ))}
                </div>
                <div style={{ border: '1.5px solid #e2e2e8', borderRadius: '10px', overflow: 'hidden' }}>
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Mesaj yaz... (Enter ile gönder)" style={{ width: '100%', padding: '10px 12px', border: 'none', background: '#f5f5f7', fontSize: '13px', resize: 'none', height: '80px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', display: 'block' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTop: '1px solid #e2e2e8' }}>
                    <span style={{ fontSize: '11px', color: '#9aaabb' }}>{newMessage.length} karakter</span>
                    <button onClick={sendMessage} style={{ padding: '6px 14px', background: '#25D366', color: 'white', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>➤ Gönder</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRandevuModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>📅 Randevu Ekle</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Konsolosluk</label>
              <input value={randevuKonsolosluk} onChange={e => setRandevuKonsolosluk(e.target.value)} placeholder="Fransa Konsolosluğu İstanbul" style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Tarih</label>
              <input type="date" value={randevuTarih} onChange={e => setRandevuTarih(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Saat</label>
              <input type="time" value={randevuSaat} onChange={e => setRandevuSaat(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowRandevuModal(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={randevuEkle} style={{ flex: 2, padding: '10px', background: '#1a5fa5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Randevu Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {showDevirModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px', color: '#0d1f35' }}>Müşteriyi Devret</h3>
            <p style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.5rem' }}>{client.full_name} dosyasını hangi danışmana devretmek istiyorsunuz?</p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Danışman</label>
              <select value={devirHedef} onChange={e => setDevirHedef(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">Seçin...</option>
                {digerDanismanlar.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Not (opsiyonel)</label>
              <textarea value={devirNot} onChange={e => setDevirNot(e.target.value)} placeholder="Neden devrediyorsunuz?" style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', resize: 'none', height: '70px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDevirModal(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={devirGonder} disabled={!devirHedef || devirSaving} style={{ flex: 2, padding: '10px', background: '#854f0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', opacity: !devirHedef ? 0.5 : 1 }}>
                {devirSaving ? 'Gönderiliyor...' : '↗ Devir Talebi Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '360px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '8px', color: '#0d1f35' }}>Müşteriyi Sil</h3>
            <p style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.5rem' }}>
              <strong>{client.full_name}</strong> ve tüm kayıtları kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={deleteClient} style={{ flex: 1, padding: '10px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}