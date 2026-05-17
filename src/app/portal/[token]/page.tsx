'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function PortalPage() {
  const { token } = useParams()
  const [client, setClient] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showConsent, setShowConsent] = useState(false)
  const [consentSaving, setConsentSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('evrak')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bilgiKaydedildi, setBilgiKaydedildi] = useState(false)
  const [visaDocuments, setVisaDocuments] = useState<any[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [eldenSaving, setEldenSaving] = useState<Record<number, boolean>>({})
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    async function fetchClient() {
      const { data } = await supabase.rpc('get_client_by_token', { token })
      if (data && data.length > 0) {
        const c = data[0]
        setClient(c)
        setEmail(c.email || '')
        setPhone(c.phone || '')
        if (c.consent_approved !== true) setShowConsent(true)
        const { data: appData } = await supabase.from('applications').select('*').eq('client_id', c.id).maybeSingle()
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

  async function approveConsent() {
    if (!client) return
    setConsentSaving(true)
    await supabase.from('clients').update({ consent_approved: true }).eq('id', client.id)
    setConsentSaving(false)
    setShowConsent(false)
  }

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
    await supabase.from('documents').delete().eq('application_id', application.id).eq('name', docName)
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

  async function handleEldenSec(idx: number, docName: string) {
    if (!client || !application) return
    setEldenSaving(prev => ({ ...prev, [idx]: true }))
    await supabase.from('documents').delete().eq('application_id', application.id).eq('name', docName)
    await supabase.from('documents').insert({
      application_id: application.id,
      name: docName,
      file_url: null,
      file_name: null,
      status: 'physical',
      delivery_type: 'physical',
    })
    const { data: uploaded } = await supabase.from('documents').select('*').eq('application_id', application.id)
    setUploadedDocs(uploaded || [])
    setEldenSaving(prev => ({ ...prev, [idx]: false }))
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

  if (showConsent) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '2rem 1rem', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '520px', maxWidth: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
          <h2 style={{ color: 'white', fontSize: '17px', fontWeight: '600', margin: 0 }}>Kişisel Verilerin Korunması</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '6px 0 0' }}>KVKK Aydınlatma Metni ve Açık Rıza</p>
        </div>

        <div style={{ padding: '1.5rem', maxHeight: '55vh', overflowY: 'auto', borderBottom: '1px solid #f0ede6' }}>
          <p style={{ fontSize: '13px', color: '#0d1f35', fontWeight: '600', marginTop: 0 }}>Sayın {client.full_name},</p>
          <p style={{ fontSize: '13px', color: '#5a6a7a', lineHeight: '1.7', marginTop: 0 }}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin işlenmesine ilişkin bilgiler aşağıda sunulmaktadır.
          </p>

          <p style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f35', marginBottom: '4px' }}>1. Veri Sorumlusu</p>
          <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6', marginTop: 0 }}>
            Vize başvurunuzu yürüten danışmanlık firması, veri sorumlusu sıfatıyla kişisel verilerinizi işlemektedir.
          </p>

          <p style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f35', marginBottom: '4px' }}>2. İşlenen Kişisel Veriler</p>
          <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6', marginTop: 0 }}>
            Ad-soyad, telefon numarası, e-posta adresi, pasaport bilgileri ve vize başvurusu kapsamında paylaştığınız belgeler işlenmektedir.
          </p>

          <p style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f35', marginBottom: '4px' }}>3. İşleme Amaçları</p>
          <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6', marginTop: 0 }}>
            Verileriniz; vize başvuru sürecinizin yürütülmesi, konsolosluk randevusunun alınması, evrak takibi ve tarafınızla iletişim kurulması amacıyla işlenmektedir.
          </p>

          <p style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f35', marginBottom: '4px' }}>4. Aktarım</p>
          <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6', marginTop: 0 }}>
            Verileriniz; ilgili konsolosluk, büyükelçilik ve yetkili kamu kurumlarıyla yasal zorunluluk çerçevesinde paylaşılabilir.
          </p>

          <p style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f35', marginBottom: '4px' }}>5. Saklama Süresi</p>
          <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6', marginTop: 0 }}>
            Kişisel verileriniz, başvuru sürecinizin tamamlanmasından itibaren yasal yükümlülükler kapsamında en fazla 5 yıl süreyle saklanacaktır.
          </p>

          <p style={{ fontSize: '12px', fontWeight: '600', color: '#0d1f35', marginBottom: '4px' }}>6. Haklarınız</p>
          <p style={{ fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6', marginTop: 0 }}>
            KVKK'nın 11. maddesi kapsamında; verilerinize erişim, düzeltme, silme, işlemeye itiraz ve taşınabilirlik haklarına sahipsiniz. Taleplerinizi danışmanınıza iletebilirsiniz.
          </p>
        </div>

        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: '12px', color: '#9aaabb', marginTop: 0, marginBottom: '1rem', lineHeight: '1.5' }}>
            Yukarıdaki aydınlatma metnini okuduğumu, kişisel verilerimin belirtilen amaçlar kapsamında işlenmesine <strong>açık rıza</strong> verdiğimi onaylıyorum.
          </p>
          <button
            onClick={approveConsent}
            disabled={consentSaving}
            style={{ width: '100%', padding: '13px', background: consentSaving ? '#9aaabb' : '#0d1f35', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: consentSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {consentSaving ? 'Kaydediliyor...' : '✓ Okudum ve onaylıyorum'}
          </button>
        </div>
      </div>
    </div>
  )

  const tamamlanan = visaDocuments.filter(vd => {
    if (vd.delivery_type === 'company') return true
    return uploadedDocs.some(d => d.name === vd.doc_name)
  }).length
  const toplam = visaDocuments.length
  const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'system-ui' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '440px', maxWidth: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        <div style={{ background: 'linear-gradient(135deg, #0d1f35, #1a3a5c)', padding: '1.5rem', textAlign: 'center' }}>
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
          <h2 style={{ color: 'white', fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '400', letterSpacing: '3px', marginBottom: '12px' }}>VECTROPUS</h2>
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
                    const yuklenenDoc = uploadedDocs.find(d => d.name === vd.doc_name)
                    const yuklendi = yuklenenDoc?.delivery_type === 'digital'
                    const eldenSecildi = yuklenenDoc?.delivery_type === 'physical'

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

                    if (eldenSecildi) return (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff8ec', border: '1.5px solid #f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>🤝</div>
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
                          <button
                            onClick={() => handleEldenSec(idx, vd.doc_name)}
                            disabled={eldenSaving[idx]}
                            style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '500', background: '#faf8f3', color: '#1a3a5c', border: '1.5px solid #1a3a5c', borderRadius: '8px', cursor: 'pointer', opacity: eldenSaving[idx] ? 0.6 : 1 }}
                          >
                            {eldenSaving[idx] ? 'Kaydediliyor...' : '🤝 Elden Getireceğim'}
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