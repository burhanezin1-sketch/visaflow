'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter, useParams } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'
import { logAction } from '@/lib/activityLog'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTranslations, useLocale } from 'next-intl'
import { tField } from '@/lib/fieldMappings'

export default function MusteriDetayPage() {
  const { id } = useParams()
  const router = useRouter()
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()
  const locale = useLocale()
  const t = useTranslations('musteriDetay')
  const tc = useTranslations('common')
  const ts = useTranslations('status')
  const [client, setClient] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [waMessages, setWaMessages] = useState<any[]>([])
  const [danismanlar, setDanismanlar] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newNote, setNewNote] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [waStatus, setWaStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [waError, setWaError] = useState<string | null>(null)
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
  const [editCurrency, setEditCurrency] = useState('TRY')
  const [showOdemeEdit, setShowOdemeEdit] = useState(false)
  const [showOdemeEkleModal, setShowOdemeEkleModal] = useState(false)
  const [odemeEkleForm, setOdemeEkleForm] = useState({ total_amount: '', currency: 'TRY', paid_amount: '', notes: '' })
  const [odemeEkleSaving, setOdemeEkleSaving] = useState(false)
  const [linkKopyalandi, setLinkKopyalandi] = useState(false)
  const [userSubmittedDocs, setUserSubmittedDocs] = useState<any[]>([])
  const [docActionSaving, setDocActionSaving] = useState<Record<string, boolean>>({})
  const [physicalDismissed, setPhysicalDismissed] = useState<Set<string>>(new Set())
  const [evrakHata, setEvrakHata] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState('')
  const [companyPlan, setCompanyPlan] = useState('')
  const [showNiyetModal, setShowNiyetModal] = useState(false)
  const [niyetStep, setNiyetStep] = useState<'form' | 'result'>('form')
  const [niyetForm, setNiyetForm] = useState({ seyahatTarihi: '', donusTarihi: '', konaklamaAdresi: '', konsolosluk: '', davetEden: '', konaklamaAmaci: '', konaklamaAmaciDiger: '' })
  const [niyetMektubu, setNiyetMektubu] = useState('')
  const [niyetLoading, setNiyetLoading] = useState(false)
  const [niyetHata, setNiyetHata] = useState<string | null>(null)
  const [passportRevealed, setPassportRevealed] = useState(false)
  const [passportDecrypted, setPassportDecrypted] = useState<string | null>(null)
  const [passportLoading, setPassportLoading] = useState(false)

  useEffect(() => { fetchAll() }, [id, companyId, companyLoading])

  async function fetchAll() {
    if (companyLoading) return
    if (!companyId) { setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    const { data: clientData } = await supabase.from('clients').select('*, users(full_name)').eq('id', id).maybeSingle()
    const { data: appArr } = await supabase.from('applications').select('*').eq('client_id', id).order('created_at', { ascending: false })
    const appData = appArr?.[0] ?? null
    const { data: paymentArr } = await supabase.from('payments').select('*').eq('application_id', appData?.id ?? 'none').order('created_at', { ascending: false })
    const paymentData = paymentArr?.[0] ?? null
    const { data: notesData } = await supabase.from('notes').select('*').eq('application_id', appData?.id ?? 'none').order('created_at', { ascending: false })
    const { data: waData } = await supabase.from('wa_messages').select('*').eq('client_id', id).order('sent_at', { ascending: false })
    const { data: usersData } = await supabase.from('users').select('*').eq('company_id', companyId)
    const { data: companyData } = await supabase.from('companies').select('plan').eq('id', companyId).single()
    const { data: transferArr } = await supabase.from('transfer_requests').select('*').eq('client_id', id).eq('status', 'pending').order('created_at', { ascending: false })
    const transferData = transferArr?.[0] ?? null
    let usdData: any[] = []
    if (appData?.id) {
      try {
        const usdRes = await fetch(`/api/user-docs?application_id=${appData.id}`)
        if (usdRes.ok) {
          const usdJson = await usdRes.json()
          usdData = usdJson.docs || []
        }
      } catch (e) {
        console.error('[fetchAll] user-docs fetch error', e)
      }
    }

    console.log('[fetchAll] application.occupation:', appData?.occupation)
    setClient(clientData)
    setApplication(appData)
    setPayment(paymentData)
    if (paymentData) setPaidAmount(paymentData.paid_amount.toString())
    setNotes(notesData || [])
    setWaMessages(waData || [])
    setDanismanlar(usersData || [])
    setCurrentUserName(usersData?.find((u: any) => u.id === user?.id)?.full_name || user?.email || '')
    setCompanyPlan(companyData?.plan || 'basic')
    setPendingTransfer(transferData || null)
    setUserSubmittedDocs(usdData)
    setLoading(false)
  }

  async function revealPassport() {
    if (!client?.id || passportLoading) return
    setPassportLoading(true)
    try {
      const res = await fetch('/api/decrypt-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id, field: 'passport_no' }),
      })
      const data = await res.json()
      setPassportDecrypted(data.value ?? client.passport_no)
      setPassportRevealed(true)
    } catch {
      setPassportDecrypted(client.passport_no)
      setPassportRevealed(true)
    } finally {
      setPassportLoading(false)
    }
  }

  async function addNote() {
    if (!newNote.trim() || !application) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('notes').insert({ application_id: application.id, company_id: application.company_id, user_id: user?.id, content: newNote }).select().single()
    if (data) setNotes([data, ...notes])
    setNewNote('')
  }

  async function sendMessage() {
    if (!newMessage.trim() || !client || waStatus === 'sending') return
    setWaStatus('sending')
    setWaError(null)

    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('wa_messages')
      .insert({ company_id: client.company_id, client_id: client.id, sender_id: user?.id, message: newMessage, direction: 'outbound', sent_at: new Date().toISOString() })
      .select()
      .single()
    if (data) setWaMessages([data, ...waMessages])

    try {
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: client.phone, message: newMessage, companyId: client.company_id }),
      })
      const result = await res.json()
      if (!res.ok || result.error) throw new Error(result.error || 'Gönderim başarısız.')
      setWaStatus('success')
      setTimeout(() => setWaStatus('idle'), 3000)
    } catch (err: any) {
      setWaStatus('error')
      setWaError(err.message)
    }

    setNewMessage('')
  }

  async function devirGonder() {
    if (!devirHedef || !companyId) return
    setDevirSaving(true)
    const { error } = await supabase.from('transfer_requests').insert({
      company_id: companyId,
      client_id: id,
      from_user: currentUser?.id,
      to_user: devirHedef,
      note: devirNot || null,
      status: 'pending',
    })
    if (error) {
      alert('Devir talebi gönderilemedi: ' + error.message)
    }
    setDevirSaving(false)
    setShowDevirModal(false)
    fetchAll()
  }

  async function devirKabul() {
    if (!pendingTransfer) return
    const { error: e1 } = await supabase.from('transfer_requests').update({ status: 'accepted' }).eq('id', pendingTransfer.id)
    const { error: e2 } = await supabase.from('clients').update({ danisan_id: currentUser?.id }).eq('id', id)
    if (e1 || e2) { alert('Hata: ' + (e1?.message || e2?.message)); return }
    logAction(companyId!, currentUser?.id, currentUserName, `Devir talebi onaylandı`, 'transfer', pendingTransfer.id, client?.full_name)
    fetchAll()
  }

  async function devirReddet() {
    if (!pendingTransfer) return
    const { error } = await supabase.from('transfer_requests').update({ status: 'rejected' }).eq('id', pendingTransfer.id)
    if (error) { alert('Hata: ' + error.message); return }
    logAction(companyId!, currentUser?.id, currentUserName, `Devir talebi reddedildi`, 'transfer', pendingTransfer.id, client?.full_name)
    fetchAll()
  }

  async function deleteClient() {
    await supabase.from('notes').delete().eq('application_id', application?.id)
    await supabase.from('wa_messages').delete().eq('client_id', id)
    await supabase.from('payments').delete().eq('application_id', application?.id)
    await supabase.from('documents').delete().eq('application_id', application?.id)
    await supabase.from('transfer_requests').delete().eq('client_id', id)
    await supabase.from('applications').delete().eq('client_id', id)
    await supabase.from('clients').delete().eq('id', id)
    router.push('/dashboard/musteriler')
  }

  async function randevuEkle() {
    if (!randevuTarih || !randevuSaat || !application) return
    const dt = `${randevuTarih}T${randevuSaat}:00`
    await supabase.from('applications').update({
      appointment_date: dt, status: 'appointment', consulate: randevuKonsolosluk || null,
    }).eq('id', application.id)
    setApplication({ ...application, appointment_date: dt, status: 'appointment', consulate: randevuKonsolosluk })
    setShowRandevuModal(false)
  }

  async function odemeGuncelle() {
    if (!paidAmount || !payment) return
    const updates: any = { paid_amount: parseFloat(paidAmount) }
    await supabase.from('payments').update(updates).eq('id', payment.id)
    setPayment({ ...payment, paid_amount: parseFloat(paidAmount) })
    setShowOdemeEdit(false)
  }

  async function odemeEkle() {
    if (!odemeEkleForm.total_amount || !application || !companyId) return
    setOdemeEkleSaving(true)
    const { data } = await supabase.from('payments').insert({
      company_id: companyId,
      application_id: application.id,
      total_amount: parseFloat(odemeEkleForm.total_amount),
      paid_amount: odemeEkleForm.paid_amount ? parseFloat(odemeEkleForm.paid_amount) : 0,
      currency: odemeEkleForm.currency,
      notes: odemeEkleForm.notes || null,
    }).select().single()
    if (data) {
      setPayment(data)
      setPaidAmount(data.paid_amount.toString())
    }
    setOdemeEkleSaving(false)
    setShowOdemeEkleModal(false)
    setOdemeEkleForm({ total_amount: '', currency: 'TRY', paid_amount: '', notes: '' })
  }

  async function durumDegistir(val: string) {
    if (!val || !application) return
    const statusMap: any = {
      missing:             ts('missing'),
      appointment_waiting: ts('appointment_waiting'),
      appointment:         ts('appointment'),
      approved:            ts('approved'),
      rejected:            ts('rejected'),
    }
    if (!confirm(t('confirmStatusChange', { status: statusMap[val] || val }))) return
    await supabase.from('applications').update({ status: val }).eq('id', application.id)
    setApplication({ ...application, status: val })
    logAction(companyId!, currentUser?.id, currentUserName, `Başvuru durumu: ${statusMap[val] || val}`, 'application', application.id, client?.full_name)
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  async function callDocAction(docId: string, docName: string, action: 'approve' | 'reject' | 'elden' | 'confirm_physical', logMsg: string) {
    if (!application) return
    setDocActionSaving(prev => ({ ...prev, [docId]: true }))
    setEvrakHata(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/doc-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ docId, action, applicationId: application.id }),
      })
      const data = await res.json()
      if (!res.ok) { setEvrakHata(`${t('docs.status.rejected')}: ${data.error}`); return }
    } catch (err: any) {
      setEvrakHata(`Hata: ${err.message}`)
      return
    } finally {
      setDocActionSaving(prev => ({ ...prev, [docId]: false }))
    }
    await fetchAll()
    logAction(companyId!, currentUser?.id, currentUserName, logMsg, 'document', application.id, client?.full_name)
  }

  function approveDoc(docId: string, docName: string) {
    return callDocAction(docId, docName, 'approve', `Evrak onaylandı: ${docName}`)
  }
  function rejectDoc(docId: string, docName: string) {
    return callDocAction(docId, docName, 'reject', `Evrak reddedildi: ${docName}`)
  }
  function eldenDoc(docId: string, docName: string) {
    return callDocAction(docId, docName, 'elden', `Evrak elden teslim: ${docName}`)
  }
  function confirmPhysicalDelivery(docId: string, docName: string) {
    return callDocAction(docId, docName, 'confirm_physical', `Fiziksel teslim onaylandı: ${docName}`)
  }

  async function evraklariYenile() {
    if (!application || !companyId) return
    setEvrakHata(null)
    const nat = application.nationality || 'Türkiye Cumhuriyeti'

    // 4-way: country + visa_type + occupation + nationality
    const { data: ownTpl } = await supabase
      .from('visa_templates').select('docs')
      .eq('company_id', companyId).neq('status', 'rejected')
      .ilike('country', application.country).ilike('visa_type', application.visa_type)
      .ilike('occupation', application.occupation || '').ilike('nationality', nat)
      .limit(1).maybeSingle()

    let matchedDocs: any[] | null = null
    if (ownTpl?.docs && Array.isArray(ownTpl.docs) && ownTpl.docs.length > 0) {
      matchedDocs = ownTpl.docs
    } else {
      const { data: globalTpl } = await supabase
        .from('visa_templates').select('docs')
        .eq('is_global', true).eq('status', 'approved')
        .ilike('country', application.country).ilike('visa_type', application.visa_type)
        .ilike('occupation', application.occupation || '').ilike('nationality', nat)
        .limit(1).maybeSingle()
      if (globalTpl?.docs && Array.isArray(globalTpl.docs) && globalTpl.docs.length > 0) {
        matchedDocs = globalTpl.docs
      }
    }

    if (!matchedDocs) {
      setEvrakHata(t('docs.noTemplate'))
      return
    }

    await supabase.from('user_submitted_docs').delete().eq('application_id', application.id)
    await supabase.from('user_submitted_docs').insert(
      matchedDocs.map((d: any) => ({
        application_id: application.id,
        doc_name: d.doc_name, delivery_type: d.delivery_type,
        description: d.description || '', status: 'pending',
      }))
    )
    await fetchAll()
  }

  async function generateDocList() {
    if (!application) return
    setEvrakHata(null)
    console.log('[generateDocList] application.occupation:', application.occupation)
    const p_occupation = application.occupation || null
    const { error } = await supabase.rpc('get_visa_documents', {
      p_application_id: application.id,
      p_country: application.country,
      p_visa_type: application.visa_type,
      p_occupation,
    })
    if (error) { setEvrakHata(`Evrak listesi oluşturulamadı: ${error.message}`); return }
    await fetchAll()
  }

  async function niyetMektubuOlustur() {
    setNiyetLoading(true)
    setNiyetHata(null)
    try {
      const res = await fetch('/api/niyet-mektubu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client?.full_name,
          country: application?.country,
          visaType: application?.visa_type,
          travelDate: niyetForm.seyahatTarihi,
          returnDate: niyetForm.donusTarihi,
          accommodation: niyetForm.konaklamaAdresi,
          consulate: niyetForm.konsolosluk,
          inviter: niyetForm.davetEden,
          konaklamaAmaci: niyetForm.konaklamaAmaci === 'diger' ? niyetForm.konaklamaAmaciDiger : niyetForm.konaklamaAmaci,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setNiyetMektubu(data.letter)
      setNiyetStep('result')
    } catch (err: any) {
      setNiyetHata(err.message || 'Bir hata oluştu.')
    }
    setNiyetLoading(false)
  }

  function pdfIndir() {
    const win = window.open('', '_blank')
    if (!win) return
    const safe = niyetMektubu.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Niyet Mektubu - ${client?.full_name}</title><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.9;margin:3cm 2.5cm;color:#111}pre{white-space:pre-wrap;font-family:inherit;font-size:12pt}@media print{body{margin:2cm}}</style></head><body><pre>${safe}</pre><script>window.onload=function(){window.print();window.close()}<\/script></body></html>`)
    win.document.close()
  }

  function copyPortalLink() {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${client.portal_token}`)
    setLinkKopyalandi(true)
    setTimeout(() => setLinkKopyalandi(false), 2000)
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#888' }}>{tc('loading')}</div></div>
  if (!client) return <div style={{ flex: 1, padding: '2rem' }}>{t('notFound')}</div>

  const statusMap: any = {
    missing:             { label: ts('missing'),             bg: '#fef0ee', color: '#c0392b' },
    appointment_waiting: { label: ts('appointment_waiting'), bg: '#fff8ec', color: '#92600a' },
    appointment:         { label: ts('appointment'),         bg: '#eef4fb', color: '#1a5fa5' },
    approved:            { label: ts('approved') + ' ✓',    bg: '#edfaf3', color: '#1a7a45' },
    rejected:            { label: ts('rejected') + ' ✗',    bg: '#fef0ee', color: '#c0392b' },
  }

  const s = statusMap[application?.status] || statusMap.missing
  const kalan = payment ? payment.total_amount - payment.paid_amount : 0
  const isMyClient = client.danisan_id === currentUser?.id
  const digerDanismanlar = danismanlar.filter(d => d.id !== currentUser?.id)
  const currentUserRole = danismanlar.find(d => d.id === currentUser?.id)?.role
  const isStaff = currentUserRole === 'admin' || currentUserRole === 'danisan'

  const occupationLabels: Record<string, string> = {
    calisan: 'Çalışan', sirket_sahibi: 'İşveren / Serbest Meslek',
    devlet_memuru: 'Devlet Memuru', ev_hanimi_meslek: 'Ev Hanımı',
    ogrenci: 'Öğrenci', emekli: 'Emekli', ev_hanimi: 'Çalışmıyor',
  }

  const tamamlanan = userSubmittedDocs.filter(d =>
    d.delivery_type === 'firma' || d.status === 'approved' || d.status === 'elden'
  ).length
  const toplam = userSubmittedDocs.length
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb',
    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', border: '1.5px solid #e2e2e8',
    borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={client.full_name} />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>

        {pendingTransfer && pendingTransfer.to_user === currentUser?.id && (
          <div style={{ background: '#eef4fb', border: '1px solid #b8d4f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a5fa5' }}>{t('pendingTransferToMe')}</div>
              <div style={{ fontSize: '12px', color: '#5a6a7a', marginTop: '2px' }}>{t('pendingTransferDesc', { name: client.full_name })}</div>
              {pendingTransfer.note && <div style={{ fontSize: '12px', color: '#5a6a7a', marginTop: '2px' }}>{t('transferNote', { note: pendingTransfer.note })}</div>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={devirKabul} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('accept')}</button>
              <button onClick={devirReddet} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#888', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('decline')}</button>
            </div>
          </div>
        )}

        {pendingTransfer && pendingTransfer.from_user === currentUser?.id && (
          <div style={{ background: '#fff8ec', border: '1px solid #f0d896', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '13px', color: '#92600a' }}>{t('pendingTransferSent')}</div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#5a6a7a' }}>← {tc('back')}</button>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', color: '#9aaabb' }}>{t('consultant')} <strong style={{ color: '#0d1f35' }}>{client.users?.full_name || t('notAssigned')}</strong></div>
            <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>{s.label}</span>
            <select onChange={e => durumDegistir(e.target.value)} value="" style={{ padding: '6px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '12px', background: '#f5f5f7', outline: 'none' }}>
              <option value="">{t('changeStatus')}</option>
              <option value="missing">{ts('missing')}</option>
              <option value="appointment_waiting">{ts('appointment_waiting')}</option>
              <option value="appointment">{ts('appointment')}</option>
              <option value="approved">{ts('approved')}</option>
              <option value="rejected">{ts('rejected')}</option>
            </select>
            <button onClick={() => setShowRandevuModal(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a5fa5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('addAppointmentBtn')}</button>
            <button
              onClick={() => {
                if (companyPlan === 'basic') {
                  alert(t('planUpgradeAlert'))
                  return
                }
                setNiyetStep('form')
                setNiyetHata(null)
                setNiyetMektubu('')
                setShowNiyetModal(true)
              }}
              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: companyPlan === 'basic' ? '#f0f0f4' : '#5b21b6', color: companyPlan === 'basic' ? '#9aaabb' : 'white', border: companyPlan === 'basic' ? '1px solid #e2e2e8' : 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {companyPlan === 'basic' ? t('intentLetterLocked') : t('intentLetterBtn')}
            </button>
            {(isMyClient || currentUserRole === 'admin') && digerDanismanlar.length > 0 && !pendingTransfer && (
              <button onClick={() => setShowDevirModal(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#854f0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('transferBtn')}</button>
            )}
            <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '8px', cursor: 'pointer' }}>{t('deleteBtn')}</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '10px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{t('passportSection')}</h4>
              {[
                [t('fields.fullName'),    client.full_name],
                [t('fields.phone'),       client.phone],
                [t('fields.email'),       client.email],
                [t('fields.birthDate'),   client.birth_date ? new Date(client.birth_date).toLocaleDateString('tr-TR') : '-'],
                [t('fields.passportExpiry'), client.passport_expiry ? new Date(client.passport_expiry).toLocaleDateString('tr-TR') : '-'],
                [t('fields.visa'),        application?.country && application?.visa_type ? `${tField(application.country, 'country', locale)} ${tField(application.visa_type, 'visaType', locale)}` : (application?.country ? tField(application.country, 'country', locale) : application?.visa_type ? tField(application.visa_type, 'visaType', locale) : '-')],
                [t('fields.occupation'),  occupationLabels[application?.occupation] || (application?.occupation ? tField(application.occupation, 'occupation', locale) : '-')],
                [t('fields.consulate'),   application?.consulate || '-'],
                ...(application?.appointment_date ? [[t('fields.appointment'), new Date(application.appointment_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f0f0f4', fontSize: '13px' }}>
                  <span style={{ color: '#5a6a7a' }}>{label}</span>
                  <span style={{ fontWeight: '500', color: label === t('fields.appointment') ? '#1a5fa5' : '#0d1f35' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f0f0f4', fontSize: '13px' }}>
                <span style={{ color: '#5a6a7a' }}>{t('passportNo')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '500', color: client.passport_no ? '#0d1f35' : '#9aaabb', fontFamily: passportRevealed ? 'monospace' : 'inherit', letterSpacing: passportRevealed ? '0.5px' : 0 }}>
                    {passportRevealed ? (passportDecrypted || t('notEntered')) : (client.passport_no ? '••••••••' : t('notEntered'))}
                  </span>
                  {client.passport_no && (
                    <button
                      onClick={passportRevealed ? () => { setPassportRevealed(false); setPassportDecrypted(null) } : revealPassport}
                      disabled={passportLoading}
                      style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #e2e2e8', borderRadius: '5px', background: '#f5f5f7', color: '#5a6a7a', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {passportLoading ? '...' : passportRevealed ? t('hide') : t('reveal')}
                    </button>
                  )}
                </span>
              </div>
              <div style={{ marginTop: '12px', padding: '10px 12px', background: '#f5f5f7', border: '1px solid #e2e2e8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#5a6a7a' }}>{t('portalLink')}</span>
                <button onClick={copyPortalLink} style={{ padding: '4px 12px', fontSize: '11px', fontWeight: '500', background: linkKopyalandi ? '#1a7a45' : '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {linkKopyalandi ? t('copied') : t('copy')}
                </button>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '10px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{t('notesSection')}</h4>
              {notes.length === 0 && <p style={{ fontSize: '12px', color: '#9aaabb', marginBottom: '8px' }}>{t('noNotes')}</p>}
              {notes.map(n => (
                <div key={n.id} style={{ background: '#f5f5f7', border: '1px solid #e2e2e8', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#9aaabb', marginBottom: '4px' }}>{new Date(n.created_at).toLocaleDateString('tr-TR')}</div>
                  <div style={{ fontSize: '13px' }}>{n.content}</div>
                </div>
              ))}
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder={t('addNotePlaceholder')} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', resize: 'none', height: '70px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              <button onClick={addNote} style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>{t('addNoteBtn')}</button>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f4' }}>
              {([['evrak', t('tabs.documents')], ['odeme', t('tabs.payment')], ['wp', t('tabs.whatsapp')]] as [string, string][]).map(([key, label]) => (
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
                {userSubmittedDocs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <p style={{ fontSize: '12px', color: '#9aaabb', marginBottom: '1rem' }}>{t('docs.noList')}</p>
                    {application?.country && application?.visa_type && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <button onClick={evraklariYenile} style={{ padding: '9px 18px', background: '#1a5fa5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                          {t('docs.refreshFromTemplate')}
                        </button>
                        <button onClick={generateDocList} style={{ padding: '9px 18px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                          {t('docs.generateList')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a6a7a', marginBottom: '6px' }}>
                        <span>{t('docs.completionLabel')}</span>
                        <span style={{ fontWeight: '600', color: yuzde === 100 ? '#1a7a45' : '#0d1f35' }}>{t('docs.progress', { completed: tamamlanan, total: toplam, percentage: yuzde })}</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e2e8', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${yuzde}%`, background: yuzde === 100 ? '#1a7a45' : '#1a5fa5', borderRadius: '10px', transition: 'width 0.3s' }} />
                      </div>
                    </div>

                    {userSubmittedDocs.map((evrak) => {
                      const saving = !!docActionSaving[evrak.id]
                      const isFirma    = evrak.delivery_type === 'firma'
                      const isPhysical = evrak.delivery_type === 'physical'
                      const isApproved = evrak.status === 'approved'
                      const isRejected = evrak.status === 'rejected'
                      const isElden    = evrak.status === 'elden'
                      const hasFile    = !!evrak.file_url
                      const isDone     = isFirma || isApproved || isElden

                      return (
                        <div key={evrak.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f4' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            {isFirma ? (
                              <span style={{ fontSize: '14px', flexShrink: 0 }}>🏢</span>
                            ) : isApproved ? (
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#edfaf3', border: '1.5px solid #1a7a45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#1a7a45', flexShrink: 0 }}>✓</div>
                            ) : isElden ? (
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff8ec', border: '1.5px solid #f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>🤝</div>
                            ) : isRejected ? (
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fef0ee', border: '1.5px solid #c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#c0392b', flexShrink: 0 }}>✗</div>
                            ) : hasFile ? (
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#eef4fb', border: '1.5px solid #1a5fa5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#1a5fa5', flexShrink: 0 }}>↑</div>
                            ) : isPhysical ? (
                              <span style={{ fontSize: '14px', flexShrink: 0 }}>🤝</span>
                            ) : (
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #e2e2e8', flexShrink: 0 }} />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', color: '#0d1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evrak.doc_name}</div>
                              <div style={{ fontSize: '10px', color: '#9aaabb', marginTop: '1px' }}>
                                {isFirma    ? t('docs.status.firma')
                                  : isApproved ? t('docs.status.approved')
                                  : isElden    ? t('docs.status.elden')
                                  : isRejected ? t('docs.status.rejected')
                                  : hasFile    ? t('docs.status.uploaded')
                                  : isPhysical ? t('docs.status.physical')
                                  : t('docs.status.awaiting')}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '6px' }}>
                            {isFirma    && <span style={{ fontSize: '10px', color: '#1a5fa5', fontWeight: '600', background: '#eef4fb', padding: '3px 8px', borderRadius: '20px' }}>{t('docs.badge.firma')}</span>}
                            {isApproved && <span style={{ fontSize: '10px', color: '#1a7a45', fontWeight: '600', background: '#edfaf3', padding: '3px 8px', borderRadius: '20px' }}>{t('docs.badge.approved')}</span>}
                            {isElden    && <span style={{ fontSize: '10px', color: '#92600a', fontWeight: '600', background: '#fff8ec', padding: '3px 8px', borderRadius: '20px' }}>{t('docs.badge.elden')}</span>}
                            {isRejected && <span style={{ fontSize: '10px', color: '#c0392b', fontWeight: '600', background: '#fef0ee', padding: '3px 8px', borderRadius: '20px' }}>{t('docs.badge.rejected')}</span>}
                            {hasFile && evrak.file_url && (() => {
                              let urls: string[]
                              try { const p = JSON.parse(evrak.file_url); urls = Array.isArray(p) ? p : [evrak.file_url] }
                              catch { urls = [evrak.file_url] }
                              return urls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ padding: '3px 7px', fontSize: '11px', background: '#1a3a5c', color: 'white', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                  {urls.length > 1 ? `${t('docs.viewBtn')} ${i + 1}` : t('docs.viewBtn')}
                                </a>
                              ))
                            })()}
                            {isStaff && !isFirma && !isDone && (
                              <>
                                <button onClick={() => approveDoc(evrak.id, evrak.doc_name)} disabled={saving} style={{ padding: '3px 7px', fontSize: '11px', fontWeight: '500', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: saving ? 0.6 : 1 }}>
                                  {saving ? '...' : t('docs.approveBtn')}
                                </button>
                                <button onClick={() => eldenDoc(evrak.id, evrak.doc_name)} disabled={saving} style={{ padding: '3px 7px', fontSize: '11px', fontWeight: '500', background: '#fff8ec', color: '#92600a', border: '1px solid #f0d08a', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: saving ? 0.6 : 1 }}>
                                  {t('docs.eldenBtn')}
                                </button>
                                {!isRejected && (
                                  <button onClick={() => rejectDoc(evrak.id, evrak.doc_name)} disabled={saving} style={{ padding: '3px 7px', fontSize: '11px', fontWeight: '500', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5c2bb', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', opacity: saving ? 0.6 : 1 }}>
                                    {t('docs.rejectBtn')}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          </div>
                          {isPhysical && (
                            <div style={{ marginTop: '5px', paddingLeft: '26px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              {evrak.marked_physical_at && (
                                <span style={{ fontSize: '10px', color: '#9aaabb' }}>
                                  📅 İşaretlendi: {fmtDate(evrak.marked_physical_at)}
                                </span>
                              )}
                              {evrak.physical_delivery_confirmed ? (
                                <span style={{ fontSize: '10px', color: '#1a7a45', fontWeight: '600', background: '#edfaf3', padding: '2px 8px', borderRadius: '20px', border: '1px solid #a8e6c1' }}>
                                  ✅ Getirildi — {fmtDate(evrak.physical_delivery_confirmed_at)}
                                </span>
                              ) : physicalDismissed.has(evrak.id) ? (
                                <span style={{ fontSize: '10px', color: '#9aaabb', background: '#f5f5f7', padding: '2px 8px', borderRadius: '20px' }}>
                                  ⏳ Henüz Getirilmedi
                                </span>
                              ) : isStaff ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '10px', color: '#5a6a7a' }}>Getirildi mi?</span>
                                  <button
                                    onClick={() => confirmPhysicalDelivery(evrak.id, evrak.doc_name)}
                                    disabled={saving}
                                    style={{ padding: '2px 8px', fontSize: '10px', fontWeight: '600', background: '#edfaf3', color: '#1a7a45', border: '1px solid #a8e6c1', borderRadius: '20px', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
                                  >
                                    ✅ Getirildi
                                  </button>
                                  <button
                                    onClick={() => setPhysicalDismissed(prev => new Set([...prev, evrak.id]))}
                                    style={{ padding: '2px 8px', fontSize: '10px', fontWeight: '600', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5c2bb', borderRadius: '20px', cursor: 'pointer' }}
                                  >
                                    ❌ Getirilmedi
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button onClick={evraklariYenile} style={{ flex: 1, padding: '10px', background: '#eef4fb', color: '#1a5fa5', border: '1px solid #b8d4f0', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                        {t('docs.refreshBtn')}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('wp')
                          setNewMessage(t('docs.reminderMsg', { name: client.full_name }))
                        }}
                        style={{ flex: 1, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        {t('docs.reminderBtn')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'odeme' && (
              <div style={{ padding: '1.25rem' }}>
                {payment ? (
                  <>
                    {[
                      [t('payment.total'),     payment.total_amount.toLocaleString('tr-TR') + (payment.currency === 'EUR' ? '€' : payment.currency === 'USD' ? '$' : '₺'), '#0d1f35'],
                      [t('payment.paid'),      payment.paid_amount.toLocaleString('tr-TR') + (payment.currency === 'EUR' ? '€' : payment.currency === 'USD' ? '$' : '₺'), '#1a7a45'],
                      [t('payment.remaining'), kalan.toLocaleString('tr-TR') + (payment.currency === 'EUR' ? '€' : payment.currency === 'USD' ? '$' : '₺'), kalan > 0 ? '#c0392b' : '#1a7a45'],
                    ].map(([label, value, color]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f4', fontSize: '13px' }}>
                        <span style={{ color: '#5a6a7a' }}>{label}</span>
                        <span style={{ fontWeight: '600', color }}>{value}</span>
                      </div>
                    ))}
                    {payment.notes && (
                      <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f4', fontSize: '13px' }}>
                        <span style={{ color: '#5a6a7a' }}>{t('payment.noteLabel')} </span>
                        <span style={{ color: '#0d1f35' }}>{payment.notes}</span>
                      </div>
                    )}
                    <div style={{ padding: '8px 0', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5a6a7a' }}>{t('payment.statusLabel')}</span>
                      <span style={{ background: kalan <= 0 ? '#edfaf3' : kalan < payment.total_amount ? '#fff8ec' : '#fef0ee', color: kalan <= 0 ? '#1a7a45' : kalan < payment.total_amount ? '#92600a' : '#c0392b', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>
                        {kalan <= 0 ? t('payment.collected') : kalan < payment.total_amount ? t('payment.partial') : t('payment.waiting')}
                      </span>
                    </div>
                    {showOdemeEdit ? (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={labelStyle}>{t('payment.currencyLabel')}</label>
                          <select value={editCurrency} onChange={e => setEditCurrency(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}>
                            <option value="TRY">₺ TRY</option>
                            <option value="EUR">€ EUR</option>
                            <option value="USD">$ USD</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>{t('payment.totalWithCurrency', { currency: editCurrency })}</label>
                          <input type="number" defaultValue={payment.total_amount} id="edit-total" style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={labelStyle}>{t('payment.paidWithCurrency', { currency: editCurrency })}</label>
                          <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={async () => {
                            const totalEl = document.getElementById('edit-total') as HTMLInputElement
                            const newTotal = totalEl ? parseFloat(totalEl.value) : payment.total_amount
                            const newPaid = parseFloat(paidAmount)
                            await supabase.from('payments').update({ total_amount: newTotal, paid_amount: newPaid, currency: editCurrency }).eq('id', payment.id)
                            setPayment({ ...payment, total_amount: newTotal, paid_amount: newPaid, currency: editCurrency })
                            setShowOdemeEdit(false)
                          }} style={{ flex: 1, padding: '8px 14px', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>{tc('save')}</button>
                          <button onClick={() => setShowOdemeEdit(false)} style={{ padding: '8px 10px', background: '#f5f5f7', color: '#888', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>{tc('cancel')}</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setShowOdemeEdit(true); setEditCurrency(payment.currency || 'TRY') }} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>{t('payment.editBtn')}</button>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <p style={{ fontSize: '13px', color: '#9aaabb', marginBottom: '1rem' }}>{t('payment.noPayment')}</p>
                    {application && (
                      <button onClick={() => setShowOdemeEkleModal(true)} style={{ padding: '10px 20px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>{t('payment.addBtn')}</button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wp' && (
              <div style={{ padding: '1.25rem' }}>
                {waStatus === 'success' && (
                  <div style={{ background: '#edfaf3', border: '1px solid #a8e6c1', borderRadius: '8px', padding: '9px 12px', marginBottom: '10px', fontSize: '12px', color: '#1a7a45', fontWeight: '500' }}>
                    {t('whatsapp.sent')}
                  </div>
                )}
                {waStatus === 'error' && waError && (
                  <div style={{ background: '#fef0ee', border: '1px solid #f5c2bb', borderRadius: '8px', padding: '9px 12px', marginBottom: '10px', fontSize: '12px', color: '#c0392b' }}>
                    {t('whatsapp.errorPrefix')} {waError}
                  </div>
                )}
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                  {waMessages.length === 0 && <p style={{ fontSize: '12px', color: '#9aaabb' }}>{t('whatsapp.noMessages')}</p>}
                  {waMessages.map(m => (
                    <div key={m.id} style={{ background: '#f5f5f7', border: '1px solid #e2e2e8', borderRadius: '8px', padding: '9px 12px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#9aaabb', marginBottom: '4px' }}>📤 {new Date(m.sent_at ?? m.created_at).toLocaleDateString('tr-TR')}</div>
                      <div style={{ fontSize: '13px' }}>{m.message}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {([
                    [t('whatsapp.quick.docs'),        t('whatsapp.quick.docsMsg')],
                    [t('whatsapp.quick.appointment'),  t('whatsapp.quick.appointmentMsg')],
                    [t('whatsapp.quick.payment'),      t('whatsapp.quick.paymentMsg')],
                    [t('whatsapp.quick.congrats'),     t('whatsapp.quick.congratsMsg')],
                  ] as [string, string][]).map(([label, msg]) => (
                    <button key={label} onClick={() => setNewMessage(msg)} style={{ padding: '5px 10px', fontSize: '11px', border: '1.5px solid #e2e2e8', borderRadius: '20px', background: '#f5f5f7', cursor: 'pointer', fontFamily: 'inherit', color: '#5a6a7a' }}>{label}</button>
                  ))}
                </div>
                <div style={{ border: '1.5px solid #e2e2e8', borderRadius: '10px', overflow: 'hidden' }}>
                  <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder={t('whatsapp.placeholder')} style={{ width: '100%', padding: '10px 12px', border: 'none', background: '#f5f5f7', fontSize: '13px', resize: 'none', height: '80px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', display: 'block' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderTop: '1px solid #e2e2e8' }}>
                    <span style={{ fontSize: '11px', color: '#9aaabb' }}>{t('whatsapp.charCount', { count: newMessage.length })}</span>
                    <button onClick={sendMessage} disabled={waStatus === 'sending' || !newMessage.trim()} style={{ padding: '6px 14px', background: waStatus === 'sending' ? '#888' : '#25D366', color: 'white', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: waStatus === 'sending' ? 'not-allowed' : 'pointer', opacity: !newMessage.trim() ? 0.5 : 1 }}>
                      {waStatus === 'sending' ? t('whatsapp.sending') : t('whatsapp.sendBtn')}
                    </button>
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
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>{t('appointmentModal.title')}</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>{t('appointmentModal.consulate')}</label>
              <input value={randevuKonsolosluk} onChange={e => setRandevuKonsolosluk(e.target.value)} placeholder={t('appointmentModal.consulatePlaceholder')} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>{t('appointmentModal.date')}</label>
              <input type="date" value={randevuTarih} onChange={e => setRandevuTarih(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>{t('appointmentModal.time')}</label>
              <input type="time" value={randevuSaat} onChange={e => setRandevuSaat(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowRandevuModal(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('cancel')}</button>
              <button onClick={randevuEkle} style={{ flex: 2, padding: '10px', background: '#1a5fa5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{t('appointmentModal.saveBtn')}</button>
            </div>
          </div>
        </div>
      )}

      {showDevirModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px', color: '#0d1f35' }}>{t('transferModal.title')}</h3>
            <p style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.5rem' }}>{t('transferModal.desc', { name: client.full_name })}</p>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>{t('transferModal.consultantLabel')}</label>
              <select value={devirHedef} onChange={e => setDevirHedef(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}>
                <option value="">{t('transferModal.selectPlaceholder')}</option>
                {digerDanismanlar.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('transferModal.noteLabel')}</label>
              <textarea value={devirNot} onChange={e => setDevirNot(e.target.value)} placeholder={t('transferModal.notePlaceholder')} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', resize: 'none', height: '70px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDevirModal(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('cancel')}</button>
              <button onClick={devirGonder} disabled={!devirHedef || devirSaving} style={{ flex: 2, padding: '10px', background: '#854f0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', opacity: !devirHedef ? 0.5 : 1 }}>
                {devirSaving ? t('transferModal.sending') : t('transferModal.sendBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNiyetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: niyetStep === 'result' ? '600px' : '420px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            {niyetStep === 'form' ? (
              <>
                <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '4px', color: '#0d1f35' }}>{t('intentModal.title')}</h3>
                <p style={{ fontSize: '12px', color: '#9aaabb', marginBottom: '1.5rem' }}>{client.full_name} — {application?.country ? tField(application.country, 'country', locale) : ''} {application?.visa_type ? tField(application.visa_type, 'visaType', locale) : ''}</p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>{t('intentModal.travelDate')}</label>
                    <input type="date" value={niyetForm.seyahatTarihi} onChange={e => setNiyetForm({ ...niyetForm, seyahatTarihi: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>{t('intentModal.returnDate')}</label>
                    <input type="date" value={niyetForm.donusTarihi} onChange={e => setNiyetForm({ ...niyetForm, donusTarihi: e.target.value })} style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>{t('intentModal.consulate')}</label>
                  <input value={niyetForm.konsolosluk} onChange={e => setNiyetForm({ ...niyetForm, konsolosluk: e.target.value })} placeholder={t('intentModal.consulatePlaceholder')} style={inputStyle} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>{t('intentModal.travelPurpose')}</label>
                  <select value={niyetForm.konaklamaAmaci} onChange={e => setNiyetForm({ ...niyetForm, konaklamaAmaci: e.target.value, konaklamaAmaciDiger: '' })} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'white', color: niyetForm.konaklamaAmaci ? '#0d1f35' : '#9aaabb' }}>
                    <option value="">{t('intentModal.selectPurpose')}</option>
                    <option value="turistik">{t('intentModal.purposes.tourist')}</option>
                    <option value="is">{t('intentModal.purposes.business')}</option>
                    <option value="ogrenci">{t('intentModal.purposes.student')}</option>
                    <option value="aile">{t('intentModal.purposes.family')}</option>
                    <option value="diger">{t('intentModal.purposes.other')}</option>
                  </select>
                  {niyetForm.konaklamaAmaci === 'diger' && (
                    <input value={niyetForm.konaklamaAmaciDiger} onChange={e => setNiyetForm({ ...niyetForm, konaklamaAmaciDiger: e.target.value })} placeholder={t('intentModal.purposeOtherPlaceholder')} style={{ ...inputStyle, marginTop: '8px' }} />
                  )}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>{t('intentModal.accommodation')}</label>
                  <input value={niyetForm.konaklamaAdresi} onChange={e => setNiyetForm({ ...niyetForm, konaklamaAdresi: e.target.value })} placeholder={t('intentModal.accommodationPlaceholder')} style={inputStyle} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>{t('intentModal.inviter')}</label>
                  <input value={niyetForm.davetEden} onChange={e => setNiyetForm({ ...niyetForm, davetEden: e.target.value })} placeholder={t('intentModal.inviterPlaceholder')} style={inputStyle} />
                </div>

                {niyetHata && (
                  <div style={{ background: '#fef0ee', border: '1px solid #f5c2bb', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#c0392b' }}>{niyetHata}</div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowNiyetModal(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('cancel')}</button>
                  <button onClick={niyetMektubuOlustur} disabled={niyetLoading} style={{ flex: 2, padding: '10px', background: niyetLoading ? '#9b7ecb' : '#5b21b6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {niyetLoading ? t('intentModal.generating') : t('intentModal.generateBtn')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '600', margin: 0, color: '#0d1f35' }}>{t('intentModal.resultTitle')}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setNiyetStep('form')} style={{ padding: '6px 12px', fontSize: '12px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', cursor: 'pointer' }}>{t('intentModal.editBtn')}</button>
                    <button onClick={pdfIndir} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{t('intentModal.pdfBtn')}</button>
                    <button onClick={() => setShowNiyetModal(false)} style={{ padding: '6px 10px', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9aaabb' }}>✕</button>
                  </div>
                </div>
                <textarea value={niyetMektubu} onChange={e => setNiyetMektubu(e.target.value)} style={{ width: '100%', padding: '14px', border: '1.5px solid #e2e2e8', borderRadius: '10px', fontSize: '13px', lineHeight: '1.8', resize: 'vertical', minHeight: '420px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia, serif', color: '#111' }} />
                <p style={{ fontSize: '11px', color: '#9aaabb', marginTop: '8px' }}>{t('intentModal.editHint')}</p>
              </>
            )}
          </div>
        </div>
      )}

      {showOdemeEkleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '400px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>{t('payment.addModalTitle')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={labelStyle}>{t('payment.currencyLabel')} *</label>
                <select value={odemeEkleForm.currency} onChange={e => setOdemeEkleForm({ ...odemeEkleForm, currency: e.target.value })} style={{ width: '100%', padding: '10px', border: '1.5px solid #378add', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: '#f0f6ff', outline: 'none', fontFamily: 'inherit', color: '#0d1f35' }}>
                  <option value="TRY">₺ TRY — Türk Lirası</option>
                  <option value="EUR">€ EUR — Euro</option>
                  <option value="USD">$ USD — Dolar</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('payment.totalAmountLabel', { currency: odemeEkleForm.currency })}</label>
                <input type="number" value={odemeEkleForm.total_amount} onChange={e => setOdemeEkleForm({ ...odemeEkleForm, total_amount: e.target.value })} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('payment.paidAmountLabel', { currency: odemeEkleForm.currency })}</label>
                <input type="number" value={odemeEkleForm.paid_amount} onChange={e => setOdemeEkleForm({ ...odemeEkleForm, paid_amount: e.target.value })} placeholder="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t('payment.notesLabel')}</label>
                <input value={odemeEkleForm.notes} onChange={e => setOdemeEkleForm({ ...odemeEkleForm, notes: e.target.value })} placeholder={t('payment.notesPlaceholder')} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={() => { setShowOdemeEkleModal(false); setOdemeEkleForm({ total_amount: '', currency: 'TRY', paid_amount: '', notes: '' }) }} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('cancel')}</button>
              <button onClick={odemeEkle} disabled={!odemeEkleForm.total_amount || odemeEkleSaving} style={{ flex: 2, padding: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', opacity: !odemeEkleForm.total_amount ? 0.5 : 1 }}>
                {odemeEkleSaving ? tc('saving') : t('payment.saveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '360px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '8px', color: '#0d1f35' }}>{t('deleteModal.title')}</h3>
            <p style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.5rem' }}>
              {t('deleteModal.desc', { name: client.full_name })}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{tc('cancel')}</button>
              <button onClick={deleteClient} style={{ flex: 1, padding: '10px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{t('deleteModal.confirmBtn')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
