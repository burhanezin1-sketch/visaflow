'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function PortalPage() {
  const { token } = useParams()
  const [client, setClient] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('evrak')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bilgiKaydedildi, setBilgiKaydedildi] = useState(false)
  const [visaDocuments, setVisaDocuments] = useState<any[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [eldenSecilen, setEldenSecilen] = useState<Record<number, boolean>>({})
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    async function fetchClient() {
      const { data } = await supabase.rpc('get_client_by_token', { token })
      if (data && data.length > 0) {
        const c = data[0]
        setClient(c)
        setEmail(c.email || '')
        setPhone(c.phone || '')
        const { data: appData } = await supabase.from('applications').select('*').eq('client_id', c.id).single()
        setApplication(appData)

        if (appData?.country && appData?.visa_type) {
          const { data: visaDocs } = await supabase
            .from('visa_documents')
            .select('*')
            .eq('country', appData.country)
            .eq('visa_type', appData.visa_type)
            .order('order_num', { ascending: true })
          setVisaDocuments(visaDocs || [])

          const { data: uploaded } = await supabase
            .from('documents')
            .select('*')
            .eq('application_id', appData.id)
          setUploadedDocs(uploaded || [])
        }
      }
      setLoading(false)
    }
    fetchClient()
  }, [token])

  async function saveBilgi() {
    if (!client) return
    await supabase.from('clients').update({ email, phone }).eq('id', client.id)
    setBilgiKaydedildi(true)
    setTimeout(() => setBilgiKaydedildi(false), 2000)
  }

  async function handleFileUpload(idx: number, docName: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !client || !application) return
    setUploading(prev => ({ ...prev, [idx]: true }))
    const fileName = `${client.id}/${idx}_${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('documents').upload(fileName, file, { upsert: true })
    if (error) { setUploading(prev => ({ ...prev, [idx]: false })); return }
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
    await supabase.from('documents').insert({
      application_id: application.id,
      name: docName,
      file_url: urlData.publicUrl,
      file_name: file.name,
      status: 'uploaded',
      delivery_type: 'digital',
    })
    const { data: uploaded } = await supabase.from('documents').select('*').eq('application_id', application.id)
    setUploadedDocs(uploaded || [])
    setUploading(prev => ({ ...prev, [idx]: false }))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', fontFamily: 'system-ui' }}>
      <div style={{ color: 'white', fontSize: '14px' }}>Yükleniyor...</div>
    </div>
  )

  if (!client) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ fontSize: '32px', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Link geçersiz</h2>
        <p style={{ fontSize: '13px', color: '#888' }}>Bu portal linki bulunamadı.</p>
      </div>
    </div>
  )

  const tamamlanan = visaDocuments.filter(vd => {
    if (vd.delivery_type === 'company') return true
    if (vd.delivery_type === 'physical') return eldenSecilen[visaDocuments.indexOf(vd)]
    return uploadedDocs.some(d => d.name === vd.doc_name)
  }).length
  const toplam = visaDocuments.length
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '440px', maxWidth: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        <div style={{ background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Vectropus Portal</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
            Merhaba <strong style={{ color: 'white' }}>{client.full_name}</strong>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>
            {application?.country} — {application?.visa_type}
          </p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e8e4da' }}>
          {[['evrak', '📋 Evraklar'], ['bilgi', '👤 Bilgilerim']].map(([key, label]) => (
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

          {activeTab === 'evrak' && (
            <div>
              {visaDocuments.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9aaabb', textAlign: 'center', padding: '2rem 0' }}>Evrak listesi henüz hazırlanmadı.</p>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a6a7a', marginBottom: '6px' }}>
                      <span>Tamamlama Durumu</span>
                      <span style={{ fontWeight: '600', color: yuzde === 100 ? '#1a7a45' : '#0d1f35' }}>{tamamlanan}/{toplam} — %{yuzde}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f0ede6', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${yuzde}%`, background: yuzde === 100 ? '#1a7a45' : '#1a5fa5', borderRadius: '10px', transition: 'width 0.3s' }} />
                    </div>
                  </div>

                  {visaDocuments.map((vd, idx) => {
                    const yuklendi = uploadedDocs.find(d => d.name === vd.doc_name)
                    const elden = eldenSecilen[idx]

                    if (vd.delivery_type === 'company') return (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eef4fb', borderRadius: '8px', padding: '10px 12px' }}>
                          <span style={{ fontSize: '16px' }}>🏢</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{vd.doc_name}</div>
                            <div style={{ fontSize: '11px', color: '#5a6a7a', marginTop: '2px' }}>Danışmanlık firmanız tarafından karşılanacak.</div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#1a5fa5', fontWeight: '600', background: '#eef4fb', padding: '3px 8px', borderRadius: '20px', border: '1px solid #b8d4f0', whiteSpace: 'nowrap' }}>Firma</span>
                        </div>
                      </div>
                    )

                    if (vd.delivery_type === 'physical') return (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#faf8f3', borderRadius: '8px', padding: '10px 12px' }}>
                          <span style={{ fontSize: '16px' }}>🤝</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{vd.doc_name}</div>
                            <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>Randevu günü elden teslim edilmelidir.</div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#92600a', fontWeight: '600', background: '#fff8ec', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Elden</span>
                        </div>
                      </div>
                    )

                    if (yuklendi) return (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#edfaf3', border: '1.5px solid #1a7a45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#1a7a45', flexShrink: 0 }}>✓</div>
                          <span style={{ fontSize: '13px', color: '#0d1f35', flex: 1 }}>{vd.doc_name}</span>
                          <span style={{ fontSize: '11px', color: '#1a7a45', fontWeight: '500' }}>Yüklendi ✓</span>
                        </div>
                      </div>
                    )

                    if (elden) return (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff8ec', border: '1.5px solid #f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#92600a', flexShrink: 0 }}>🤝</div>
                          <span style={{ fontSize: '13px', color: '#0d1f35', flex: 1 }}>{vd.doc_name}</span>
                          <span style={{ fontSize: '11px', color: '#92600a', fontWeight: '500' }}>Elden getirilecek</span>
                        </div>
                      </div>
                    )

                    if (uploading[idx]) return (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ fontSize: '13px', color: '#9aaabb' }}>{vd.doc_name} — yükleniyor...</div>
                      </div>
                    )

                    return (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35', marginBottom: '8px' }}>{vd.doc_name}</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            ref={el => { fileRefs.current[idx] = el }}
                            onChange={e => handleFileUpload(idx, vd.doc_name, e)}
                            style={{ display: 'none' }}
                          />
                          <button onClick={() => fileRefs.current[idx]?.click()} style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            📎 Dijital Yükle
                          </button>
                          <button onClick={() => setEldenSecilen(prev => ({ ...prev, [idx]: true }))} style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '500', background: '#faf8f3', color: '#1a3a5c', border: '1.5px solid #1a3a5c', borderRadius: '8px', cursor: 'pointer' }}>
                            🤝 Elden Getireceğim
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {activeTab === 'bilgi' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ad Soyad</label>
                <input readOnly value={client.full_name} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', background: '#faf8f3', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Telefon</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>E-posta</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <button onClick={saveBilgi} style={{ width: '100%', padding: '11px', background: bilgiKaydedildi ? '#1a7a45' : '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' }}>
                {bilgiKaydedildi ? '✓ Kaydedildi!' : 'Bilgileri Kaydet'}
              </button>
              <div style={{ background: '#faf8f3', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#5a6a7a', lineHeight: '1.5' }}>
                ℹ️ Başvurunuzla ilgili güncellemeler bu iletişim bilgilerine gönderilecektir.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}