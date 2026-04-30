'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter, useParams } from 'next/navigation'

const statusMap: any = {
  missing: { label: 'Evrak Eksik', bg: '#fef0ee', color: '#c0392b' },
  waiting: { label: 'Evrak Bekleniyor', bg: '#fff8ec', color: '#92600a' },
  appointment: { label: 'Randevu Alındı', bg: '#eef4fb', color: '#1a5fa5' },
  done: { label: 'Tamamlandı', bg: '#edfaf3', color: '#1a7a45' },
}

export default function MusteriDetayPage() {
  const { id } = useParams()
  const router = useRouter()
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
  const [devirHedef, setDevirHedef] = useState('')
  const [devirNot, setDevirNot] = useState('')
  const [devirSaving, setDevirSaving] = useState(false)
  const [pendingTransfer, setPendingTransfer] = useState<any>(null)

  useEffect(() => {
    fetchAll()
  }, [id])

  async function fetchAll() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    const { data: clientData } = await supabase.from('clients').select('*, users(full_name)').eq('id', id).single()
    const { data: appData } = await supabase.from('applications').select('*').eq('client_id', id).single()
    const { data: paymentData } = await supabase.from('payments').select('*').eq('application_id', appData?.id).single()
    const { data: notesData } = await supabase.from('notes').select('*').eq('application_id', appData?.id).order('created_at', { ascending: false })
    const { data: waData } = await supabase.from('wa_messages').select('*').eq('client_id', id).order('sent_at', { ascending: false })
    const { data: usersData } = await supabase.from('users').select('*').eq('company_id', 'aaaaaaaa-0000-0000-0000-000000000001')
    const { data: transferData } = await supabase.from('transfer_requests').select('*, to_user_info:users!transfer_requests_to_user_fkey(full_name)').eq('client_id', id).eq('status', 'pending').single()

    setClient(clientData)
    setApplication(appData)
    setPayment(paymentData)
    setNotes(notesData || [])
    setWaMessages(waData || [])
    setDanismanlar(usersData || [])
    setPendingTransfer(transferData || null)
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
    if (!devirHedef) return
    setDevirSaving(true)
    await supabase.from('transfer_requests').insert({
      company_id: 'aaaaaaaa-0000-0000-0000-000000000001',
      client_id: id,
      from_user: currentUser?.id,
      to_user: devirHedef,
      note: devirNot,
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

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  if (!client) return <div style={{ flex: 1, padding: '2rem' }}>Müşteri bulunamadı.</div>

  const s = statusMap[application?.status] || statusMap.waiting
  const kalan = payment ? payment.total_amount - payment.paid_amount : 0
  const isMyClient = client.danisan_id === currentUser?.id
  const digerDanismanlar = danismanlar.filter(d => d.id !== currentUser?.id)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={client.full_name} />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>

        {/* Devir talebi bildirimi */}
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

        {/* Topbar aksiyonlar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#5a6a7a' }}>← Geri</button>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', color: '#9aaabb' }}>
              Danışman: <strong style={{ color: '#0d1f35' }}>{client.users?.full_name || 'Atanmadı'}</strong>
            </div>
            <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{s.label}</span>
            <select
              onChange={async e => {
                const val = e.target.value
                if (!val) return
                await supabase.from('applications').update({ status: val }).eq('id', application.id)
                setApplication({ ...application, status: val })
              }}
              defaultValue=""
              style={{ padding: '6px 10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '12px', background: '#faf8f3', outline: 'none' }}
            >
              <option value="">Durum Değiştir...</option>
              <option value="missing">Evrak Eksik</option>
              <option value="waiting">Evrak Bekleniyor</option>
              <option value="appointment">Randevu Alındı</option>
              <option value="done">Tamamlandı</option>
            </select>
            {isMyClient && digerDanismanlar.length > 0 && !pendingTransfer && (
              <button onClick={() => setShowDevirModal(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#854f0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                ↗ Devret
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
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
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0ede6', fontSize: '13px' }}>
                  <span style={{ color: '#5a6a7a' }}>{label}</span>
                  <span style={{ fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '10px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Danışman Notları</h4>
              {notes.length === 0 && <p style={{ fontSize: '12px', color: '#9aaabb', marginBottom: '8px' }}>Henüz not yok.</p>}
              {notes.map(n => (
                <div key={n.id} style={{ background: '#faf8f3', border: '1px solid #f0ede6', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#9aaabb', marginBottom: '4px' }}>{new Date(n.created_at).toLocaleDateString('tr-TR')}</div>
                  <div style={{ fontSize: '13px' }}>{n.content}</div>
                </div>
              ))}
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Not ekle..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', resize: 'none', height: '70px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              <button onClick={addNote} style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Not Ekle</button>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #f0ede6' }}>
              {[['evrak', '📋 Evraklar'], ['odeme', '💳 Ödeme'], ['wp', '💬 WhatsApp']].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)} style={{
                  flex: 1, padding: '12px 8px', fontSize: '12px', fontWeight: '500',
                  border: 'none', background: activeTab === key ? '#faf8f3' : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  color: activeTab === key ? '#0d1f35' : '#9aaabb',
                  borderBottom: activeTab === key ? '2px solid #c9a84c' : '2px solid transparent',
                }}>{label}</button>
              ))}
            </div>

            {activeTab === 'evrak' && (
              <div style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '12px', color: '#9aaabb', marginBottom: '12px' }}>Evrak yönetimi yakında eklenecek.</p>
                <button style={{ width: '100%', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>📎 Evrak Hatırlatması Gönder</button>
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
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0ede6', fontSize: '13px' }}>
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
                    {payment.payment_note && <p style={{ fontSize: '12px', color: '#9aaabb', marginTop: '8px' }}>{payment.payment_note}</p>}
                    {kalan > 0 && <button style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>💰 Ödeme Hatırlatması Gönder</button>}
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
                    <div key={m.id} style={{ background: '#faf8f3', border: '1px solid #f0ede6', borderRadius: '8px', padding: '9px 12px', marginBottom: '8px' }}>
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
                    <button key={label} onClick={() => setNewMessage(msg)} style={{ padding: '5px 10px', fontSize: '11px', border: '1.5px solid #e8e4da', borderRadius: '20px', background: '#faf8f3', cursor: 'pointer', fontFamily: 'inherit', color: '#5a6a7a' }}>{label}</button>
                  ))}
                </div>
                <div style={{ border: '1.5px solid #e8e4da', borderRadius: '10px', overflow: 'hidden' }}>
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Mesaj yaz... (Enter ile gönder)" style={{ width: '100%', padding: '10px 12px', border: 'none', background: '#faf8f3', fontSize: '13px', resize: 'none', height: '80px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', display: 'block' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTop: '1px solid #f0ede6' }}>
                    <span style={{ fontSize: '11px', color: '#9aaabb' }}>{newMessage.length} karakter</span>
                    <button onClick={sendMessage} style={{ padding: '6px 14px', background: '#25D366', color: 'white', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>➤ Gönder</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DEVİR MODAL */}
      {showDevirModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px', color: '#0d1f35' }}>Müşteriyi Devret</h3>
            <p style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.5rem' }}>{client.full_name} dosyasını hangi danışmana devretmek istiyorsunuz?</p>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Danışman</label>
              <select value={devirHedef} onChange={e => setDevirHedef(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', background: '#faf8f3', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">Seçin...</option>
                {digerDanismanlar.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Not (opsiyonel)</label>
              <textarea value={devirNot} onChange={e => setDevirNot(e.target.value)} placeholder="Neden devrediyorsunuz?" style={{ width: '100%', padding: '10px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', resize: 'none', height: '70px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDevirModal(false)} style={{ flex: 1, padding: '10px', background: '#faf8f3', color: '#5a6a7a', border: '1px solid #e8e4da', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={devirGonder} disabled={!devirHedef || devirSaving} style={{ flex: 2, padding: '10px', background: '#854f0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', opacity: !devirHedef ? 0.5 : 1 }}>
                {devirSaving ? 'Gönderiliyor...' : '↗ Devir Talebi Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}