'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations, useMessages, useLocale } from 'next-intl'
import { tField } from '@/lib/fieldMappings'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// startsWith ile eşleşir — DB'deki parantez içi sıralamadan bağımsız
const MULTI_UPLOAD_PREFIXES = [
  'Şirket evrakları',
  'Diploma ve mesleki belgeler',
  'İş deneyimi belgeleri',
]

function isMultiUploadDoc(docName: string) {
  return MULTI_UPLOAD_PREFIXES.some(p => docName.startsWith(p))
}

export default function PortalPage() {
  const { token } = useParams()
  const locale = useLocale()
  const t = useTranslations('portal')
  const tc = useTranslations('common')
  const messages = useMessages()
  const docNamesMap: Record<string, string> = (messages as any).documentNames || {}
  const tDoc = (name: string) => docNamesMap[name] || name

  const [client, setClient] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showConsent, setShowConsent] = useState(false)
  const [consentSaving, setConsentSaving] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [kvkkOpen, setKvkkOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('evrak')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bilgiKaydedildi, setBilgiKaydedildi] = useState(false)
  const [userSubmittedDocs, setUserSubmittedDocs] = useState<any[]>([])
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [ocrStatus, setOcrStatus] = useState<Record<string, 'scanning' | 'done' | 'error'>>({})
  const [fileEntries, setFileEntries] = useState<Record<string, { name: string; status: 'uploading' | 'done' | 'error' }[]>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    async function fetchClient() {
      const tokenStr = Array.isArray(token) ? token[0] : String(token)
      if (!tokenStr || tokenStr === 'undefined') return
      try {
        const res = await fetch(`/api/portal-data?token=${encodeURIComponent(tokenStr)}`)
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        if (!data.client) { setLoading(false); return }
        setClient(data.client)
        setEmail(data.client.email || '')
        setPhone(data.client.phone || '')
        if (data.client.consent_approved !== true) setShowConsent(true)
        setApplication(data.application)
        setUserSubmittedDocs(data.userSubmittedDocs || [])
      } catch (err) {
        console.error('[portal] fetchClient error', err)
      }
      setLoading(false)
    }
    fetchClient()
  }, [token])

  async function approveConsent() {
    if (!client) return
    setConsentSaving(true)
    const tokenStr = Array.isArray(token) ? token[0] : String(token)
    try {
      await fetch('/api/portal-bilgi-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenStr, clientId: client.id, consentApproved: true }),
      })
    } catch (err) {
      console.error('[consent] fetch error', err)
    }
    setConsentSaving(false)
    setShowConsent(false)
  }

  async function saveBilgi() {
    if (!client) return
    const tokenStr = Array.isArray(token) ? token[0] : String(token)
    try {
      const res = await fetch('/api/portal-bilgi-kaydet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenStr, clientId: client.id, email, phone }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error('[bilgi-kaydet]', err.error)
        return
      }
    } catch (err) {
      console.error('[bilgi-kaydet] fetch error', err)
      return
    }
    setBilgiKaydedildi(true)
    setTimeout(() => setBilgiKaydedildi(false), 2000)
  }

  function removeFileEntry(idx: string, i: number) {
    setFileEntries(prev => ({ ...prev, [idx]: (prev[idx] || []).filter((_, j) => j !== i) }))
  }

  async function handleFileUpload(idx: string, docName: string, e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0 || !client || !application) return

    const fileArr = Array.from(fileList)
    const isMulti = isMultiUploadDoc(docName)
    const tokenStr = Array.isArray(token) ? token[0] : String(token)
    const isIdDoc = ['pasaport', 'passport', 'kimlik', 'id card'].some(k => docName.toLowerCase().includes(k))

    setFileEntries(prev => ({ ...prev, [idx]: fileArr.map(f => ({ name: f.name, status: 'uploading' as const })) }))
    setUploading(prev => ({ ...prev, [idx]: true }))
    if (isIdDoc && fileArr.some(f => f.type.startsWith('image/'))) {
      setOcrStatus(prev => ({ ...prev, [idx]: 'scanning' }))
    }

    if (isMulti) {
      const collectedUrls: string[] = []
      for (let i = 0; i < fileArr.length; i++) {
        const f = fileArr[i]
        const fd = new FormData()
        fd.append('file', f)
        fd.append('token', tokenStr)
        fd.append('clientId', client.id)
        fd.append('applicationId', application.id)
        fd.append('docName', docName)
        fd.append('idx', idx)
        fd.append('skipDocUpdate', 'true')
        try {
          const res = await fetch('/api/portal-upload', { method: 'POST', body: fd })
          const data = await res.json()
          if (!res.ok) {
            setFileEntries(prev => ({ ...prev, [idx]: (prev[idx] || []).map((e, j) => j === i ? { ...e, status: 'error' as const } : e) }))
          } else {
            const url = data.fileUrls?.[0]
            if (url) collectedUrls.push(url)
            setFileEntries(prev => ({ ...prev, [idx]: (prev[idx] || []).map((e, j) => j === i ? { ...e, status: 'done' as const } : e) }))
          }
        } catch {
          setFileEntries(prev => ({ ...prev, [idx]: (prev[idx] || []).map((e, j) => j === i ? { ...e, status: 'error' as const } : e) }))
        }
      }
      if (collectedUrls.length > 0) {
        await fetch('/api/portal-update-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenStr, clientId: client.id, applicationId: application.id, docName, fileUrls: collectedUrls }),
        })
      }
    } else {
      const fd = new FormData()
      fd.append('file', fileArr[0])
      fd.append('token', tokenStr)
      fd.append('clientId', client.id)
      fd.append('applicationId', application.id)
      fd.append('docName', docName)
      fd.append('idx', idx)
      try {
        const res = await fetch('/api/portal-upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          console.error('[upload]', data.error)
          setFileEntries(prev => ({ ...prev, [idx]: (prev[idx] || []).map(e => ({ ...e, status: 'error' as const })) }))
          setUploading(prev => ({ ...prev, [idx]: false }))
          if (isIdDoc) setOcrStatus(prev => ({ ...prev, [idx]: 'error' }))
          return
        }
        setFileEntries(prev => ({ ...prev, [idx]: (prev[idx] || []).map(e => ({ ...e, status: 'done' as const })) }))
        if (isIdDoc && fileArr.some(f => f.type.startsWith('image/'))) {
          setOcrStatus(prev => ({ ...prev, [idx]: data.ocrFields?.length > 0 ? 'done' : 'error' }))
        }
      } catch (err) {
        console.error('[upload] fetch error', err)
        setFileEntries(prev => ({ ...prev, [idx]: (prev[idx] || []).map(e => ({ ...e, status: 'error' as const })) }))
        setUploading(prev => ({ ...prev, [idx]: false }))
        return
      }
    }

    const refreshRes = await fetch(`/api/portal-data?token=${encodeURIComponent(tokenStr)}`)
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json()
      setUserSubmittedDocs(refreshData.userSubmittedDocs || [])
    }
    setUploading(prev => ({ ...prev, [idx]: false }))
  }

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', fontFamily: 'system-ui' }}>
      <div style={{ color: 'white', fontSize: '14px' }}>{t('loading')}</div>
    </div>
  )

  // ── Invalid link ──
  if (!client) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ fontSize: '32px', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>{t('invalidLink')}</h2>
        <p style={{ fontSize: '13px', color: '#888' }}>{t('invalidLinkDesc')}</p>
      </div>
    </div>
  )

  // ── KVKK consent ──
  if (showConsent) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '2rem 1rem', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '480px', maxWidth: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

        <div style={{ background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
          {/* Language switcher */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <LanguageSwitcher light />
          </div>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
          <h2 style={{ color: 'white', fontSize: '17px', fontWeight: '600', margin: 0 }}>{t('consent.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '6px 0 0' }}>{t('consent.subtitle')}</p>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* KVKK accordion */}
          <div style={{ border: '1px solid #e8e4da', borderRadius: '10px', marginBottom: '1.25rem', overflow: 'hidden' }}>
            <button
              onClick={() => setKvkkOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#faf8f3', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: '#0d1f35' }}
            >
              <span>{t('consent.kvkkTitle')}</span>
              <span style={{ fontSize: '11px', color: '#5b21b6', fontWeight: '500' }}>
                {kvkkOpen ? t('consent.closeText') : t('consent.viewText')}
              </span>
            </button>

            {kvkkOpen && (
              <div style={{ padding: '14px 14px 16px', borderTop: '1px solid #e8e4da', maxHeight: '320px', overflowY: 'auto' }}>
                <p style={{ fontSize: '12px', color: '#0d1f35', fontWeight: '600', marginTop: 0 }}>{t('consent.kvkkDear', { name: client.full_name })}</p>
                <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.7', marginTop: 0 }}>{t('consent.kvkkIntro')}</p>
                {([
                  [t('consent.kvkk1Title'), t('consent.kvkk1Text')],
                  [t('consent.kvkk2Title'), t('consent.kvkk2Text')],
                  [t('consent.kvkk3Title'), t('consent.kvkk3Text')],
                  [t('consent.kvkk4Title'), t('consent.kvkk4Text')],
                  [t('consent.kvkk5Title'), t('consent.kvkk5Text')],
                  [t('consent.kvkk6Title'), t('consent.kvkk6Text')],
                ] as [string, string][]).map(([title, body]) => (
                  <div key={title} style={{ marginBottom: '10px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f35', margin: '0 0 3px' }}>{title}</p>
                    <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6', margin: 0 }}>{body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '1.25rem' }}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={e => setConsentChecked(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#0d1f35', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', color: '#0d1f35', lineHeight: '1.5' }}>
              {t('consent.checkboxLabel')}
            </span>
          </label>

          <button
            onClick={approveConsent}
            disabled={!consentChecked || consentSaving}
            style={{
              width: '100%', padding: '13px',
              background: !consentChecked ? '#e8e4da' : consentSaving ? '#9aaabb' : '#0d1f35',
              color: !consentChecked ? '#9aaabb' : 'white',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
              cursor: !consentChecked || consentSaving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.2s',
            }}
          >
            {consentSaving ? tc('saving') : t('consent.continueBtn')}
          </button>
        </div>
      </div>
    </div>
  )

  const tamamlanan = userSubmittedDocs.filter(d =>
    d.delivery_type === 'firma' || d.status === 'approved' || d.status === 'elden' || (d.file_url && d.status === 'pending')
  ).length
  const toplam = userSubmittedDocs.length
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '440px', maxWidth: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
          {/* Language switcher — top right */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <LanguageSwitcher light />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="44" height="44" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="37" stroke="white" strokeWidth="2.5"/>
              <circle cx="40" cy="40" r="27" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <polygon points="40,4 45.5,37 40,31 34.5,37" fill="white"/>
              <polygon points="40,76 45.5,43 40,49 34.5,43" fill="rgba(255,255,255,0.3)"/>
              <line x1="3" y1="40" x2="13" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="67" y1="40" x2="77" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="40" y1="3" x2="40" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="40" y1="71" x2="40" y2="77" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="14" x2="19" y2="19" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="66" y1="14" x2="61" y2="19" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="14" y1="66" x2="19" y2="61" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="66" y1="66" x2="61" y2="61" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="40" cy="40" r="3.5" fill="white"/>
              <circle cx="40" cy="40" r="1.5" fill="#0d1f35"/>
            </svg>
          </div>
          <h2 style={{ color: 'white', fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '400', letterSpacing: '3px', marginBottom: '12px' }}>
            {t('brand')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
            {t('greeting', { name: '' })
              .replace('', '')}{' '}
            <strong style={{ color: 'white' }}>{client.full_name}</strong>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>
            {application?.country ? tField(application.country, 'country', locale) : ''} — {application?.visa_type ? tField(application.visa_type, 'visaType', locale) : ''}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e8e4da' }}>
          {([
            ['evrak', t('tabs.documents')],
            ['bilgi',  t('tabs.myInfo')],
          ] as [string, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              flex: 1, padding: '12px 8px', fontSize: '12px', fontWeight: '500',
              border: 'none', background: activeTab === key ? '#faf8f3' : 'white',
              cursor: 'pointer', fontFamily: 'inherit',
              color: activeTab === key ? '#0d1f35' : '#9aaabb',
              borderBottom: activeTab === key ? '2px solid #c9a84c' : '2px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: '1.5rem' }}>

          {/* Documents tab */}
          {activeTab === 'evrak' && (
            <div>
              {userSubmittedDocs.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9aaabb', textAlign: 'center', padding: '2rem 0' }}>
                  {t('documents.noDocsReady')}
                </p>
              ) : (
                <>
                  {/* Progress */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a6a7a', marginBottom: '6px' }}>
                      <span>{t('documents.completionStatus')}</span>
                      <span style={{ fontWeight: '600', color: yuzde === 100 ? '#1a7a45' : '#0d1f35' }}>
                        {t('documents.progress', { completed: tamamlanan, total: toplam, percentage: yuzde })}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#f0ede6', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${yuzde}%`, background: yuzde === 100 ? '#1a7a45' : '#1a5fa5', borderRadius: '10px', transition: 'width 0.3s' }} />
                    </div>
                  </div>

                  {userSubmittedDocs.map((doc) => {
                    const key = doc.id
                    const isFirma    = doc.delivery_type === 'firma'
                    const isPhysical = doc.delivery_type === 'physical'
                    const isApproved = doc.status === 'approved'
                    const isRejected = doc.status === 'rejected'
                    const isElden    = doc.status === 'elden'
                    const hasFile    = !!doc.file_url

                    if (isFirma) return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eef4fb', borderRadius: '8px', padding: '10px 12px' }}>
                          <span style={{ fontSize: '16px' }}>🏢</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{tDoc(doc.doc_name)}</div>
                            <div style={{ fontSize: '11px', color: '#5a6a7a', marginTop: '2px' }}>{t('documents.docStatus.firmaDesc')}</div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#1a5fa5', fontWeight: '600', background: '#eef4fb', padding: '3px 8px', borderRadius: '20px', border: '1px solid #b8d4f0', whiteSpace: 'nowrap' }}>
                            {t('documents.docStatus.firmaBadge')}
                          </span>
                        </div>
                      </div>
                    )

                    if (isPhysical) return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: doc.physical_delivery_confirmed ? '#edfaf3' : '#faf8f3', borderRadius: '8px', padding: '10px 12px' }}>
                          <span style={{ fontSize: '16px' }}>{doc.physical_delivery_confirmed ? '✅' : '🤝'}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{tDoc(doc.doc_name)}</div>
                            <div style={{ fontSize: '11px', color: doc.physical_delivery_confirmed ? '#1a7a45' : '#9aaabb', marginTop: '2px' }}>
                              {doc.physical_delivery_confirmed ? t('documents.docStatus.eldenReceivedDesc') : t('documents.docStatus.appointmentDayDesc')}
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', color: doc.physical_delivery_confirmed ? '#1a7a45' : '#92600a', fontWeight: '600', background: doc.physical_delivery_confirmed ? '#edfaf3' : '#fff8ec', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                            {doc.physical_delivery_confirmed ? t('documents.docStatus.approvedBadge') : t('documents.docStatus.eldenBadge')}
                          </span>
                        </div>
                      </div>
                    )

                    if (isElden) return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff8ec', borderRadius: '8px', padding: '10px 12px' }}>
                          <span style={{ fontSize: '16px' }}>🤝</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{tDoc(doc.doc_name)}</div>
                            <div style={{ fontSize: '11px', color: '#92600a', marginTop: '2px' }}>{t('documents.docStatus.eldenDesc')}</div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#92600a', fontWeight: '600', background: '#fff8ec', padding: '3px 8px', borderRadius: '20px', border: '1px solid #f0d08a', whiteSpace: 'nowrap' }}>
                            {t('documents.docStatus.eldenBadge')}
                          </span>
                        </div>
                      </div>
                    )

                    if (isApproved) return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#edfaf3', border: '1.5px solid #1a7a45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#1a7a45', flexShrink: 0 }}>✓</div>
                          <span style={{ fontSize: '13px', color: '#0d1f35', flex: 1 }}>{tDoc(doc.doc_name)}</span>
                          <span style={{ fontSize: '11px', color: '#1a7a45', fontWeight: '500' }}>{t('documents.docStatus.approvedDesc')}</span>
                        </div>
                      </div>
                    )

                    if (isRejected) return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fef0ee', border: '1.5px solid #c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#c0392b', flexShrink: 0 }}>✗</div>
                          <span style={{ fontSize: '13px', color: '#0d1f35', flex: 1 }}>{tDoc(doc.doc_name)}</span>
                          <span style={{ fontSize: '11px', color: '#c0392b', fontWeight: '500' }}>{t('documents.docStatus.rejectedDesc')}</span>
                        </div>
                        <div>
                          <input type="file" {...(isMultiUploadDoc(doc.doc_name) ? { multiple: true } : {})} accept="image/*,application/pdf" ref={el => { fileRefs.current[key] = el }} onChange={e => handleFileUpload(key, doc.doc_name, e)} style={{ display: 'none' }} />
                          <button onClick={() => fileRefs.current[key]?.click()} style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: '500', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            {t('documents.docStatus.uploadAgain')}
                          </button>
                          {(fileEntries[key] || []).map((entry, fi) => (
                            <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11px', color: entry.status === 'done' ? '#1a7a45' : entry.status === 'error' ? '#c0392b' : '#5a6a7a' }}>
                              <span>{entry.status === 'done' ? '✓' : entry.status === 'error' ? '✗' : '⏳'}</span>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                              <button onClick={() => removeFileEntry(key, fi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aaabb', fontSize: '14px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )

                    const isMulti = isMultiUploadDoc(doc.doc_name)

                    if (hasFile && !isMulti) return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eef4fb', border: '1.5px solid #1a5fa5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#1a5fa5', flexShrink: 0 }}>↑</div>
                          <span style={{ fontSize: '13px', color: '#0d1f35', flex: 1 }}>{tDoc(doc.doc_name)}</span>
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontSize: '11px', color: '#1a5fa5', fontWeight: '500' }}>{t('documents.docStatus.uploadedReview')}</span>
                            {ocrStatus[key] === 'scanning' && <span style={{ fontSize: '10px', color: '#5b21b6' }}>{t('documents.docStatus.scanning')}</span>}
                            {ocrStatus[key] === 'done'     && <span style={{ fontSize: '10px', color: '#1a7a45' }}>{t('documents.docStatus.dataRead')}</span>}
                          </span>
                        </div>
                      </div>
                    )

                    if (uploading[key]) return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ fontSize: '13px', color: '#9aaabb' }}>
                          {t('documents.docStatus.uploading', { docName: tDoc(doc.doc_name) })}
                        </div>
                      </div>
                    )

                    return (
                      <div key={key} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35', marginBottom: '8px' }}>{tDoc(doc.doc_name)}</div>
                        {hasFile && isMulti && (
                          <div style={{ fontSize: '11px', color: '#1a5fa5', marginBottom: '6px' }}>
                            {t('documents.docStatus.uploadedMore')}
                          </div>
                        )}
                        <input type="file" {...(isMulti ? { multiple: true } : {})} accept="image/*,application/pdf" ref={el => { fileRefs.current[key] = el }} onChange={e => handleFileUpload(key, doc.doc_name, e)} style={{ display: 'none' }} />
                        <button onClick={() => fileRefs.current[key]?.click()} style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                          {isMulti
                            ? (hasFile ? t('documents.docStatus.addMoreBtn') : t('documents.docStatus.uploadBtn'))
                            : t('documents.docStatus.digitalUploadBtn')}
                        </button>
                        {isMulti && !hasFile && (
                          <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '4px' }}>
                            {t('documents.docStatus.multipleFilesHint')}
                          </div>
                        )}
                        {(fileEntries[key] || []).map((entry, fi) => (
                          <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11px', color: entry.status === 'done' ? '#1a7a45' : entry.status === 'error' ? '#c0392b' : '#5a6a7a' }}>
                            <span>{entry.status === 'done' ? '✓' : entry.status === 'error' ? '✗' : '⏳'}</span>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                            <button onClick={() => removeFileEntry(key, fi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aaabb', fontSize: '14px', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* My info tab */}
          {activeTab === 'bilgi' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {t('myInfo.fullNameLabel')}
                </label>
                <input readOnly value={client.full_name} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', background: '#faf8f3', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {t('myInfo.phoneLabel')}
                </label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {t('myInfo.emailLabel')}
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <button onClick={saveBilgi} style={{ width: '100%', padding: '11px', background: bilgiKaydedildi ? '#1a7a45' : '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' }}>
                {bilgiKaydedildi ? t('myInfo.savedToast') : t('myInfo.saveBtn')}
              </button>
              <div style={{ background: '#faf8f3', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#5a6a7a', lineHeight: '1.5' }}>
                {t('myInfo.infoNote')}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
