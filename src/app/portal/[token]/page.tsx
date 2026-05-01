'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

const EVRAK_LISTESI = [
  { ad: 'Pasaport fotokopisi', tip: 'ikisi' },
  { ad: 'Biyometrik fotoğraf', tip: 'ikisi' },
  { ad: 'Banka dekontu (son 3 ay)', tip: 'ikisi' },
  { ad: 'Otel rezervasyonu', tip: 'ikisi' },
  { ad: 'Motivasyon mektubu', tip: 'ikisi' },
  { ad: 'Pasaportun orijinali', tip: 'elden' },
  { ad: 'Seyahat sigortası', tip: 'firma' },
]

export default function PortalPage() {
  const { token } = useParams()
  const [client, setClient] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pasaport')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)
  const [phoneSaved, setPhoneSaved] = useState(false)
  const [evraklar, setEvraklar] = useState<Record<number, { tip: string, url?: string, yukleniyor?: boolean }>>({})
  const [ocrDone, setOcrDone] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrData, setOcrData] = useState<any>(null)
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
      }
      setLoading(false)
    }
    fetchClient()
  }, [token])

  async function saveBilgi() {
    if (!client) return
    await supabase.from('clients').update({ email, phone }).eq('id', client.id)
    setEmailSaved(true)
    setPhoneSaved(true)
  }

  function startOCR() {
    setOcrLoading(true)
    setTimeout(() => {
      setOcrData({
        ad: client?.full_name || 'AD SOYAD',
        no: 'TR' + Math.floor(10000000 + Math.random() * 90000000),
        uyruk: 'TÜRKİYE',
        dogum: '01.01.1990',
        gecerlilik: '01.01.2030',
      })
      setOcrLoading(false)
      setOcrDone(true)
    }, 2500)
  }

  async function handleFileUpload(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !client) return

    setEvraklar(prev => ({ ...prev, [idx]: { tip: 'dijital', yukleniyor: true } }))

    const fileName = `${client.id}/${idx}_${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setEvraklar(prev => ({ ...prev, [idx]: { tip: 'hata' } }))
      return
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)

    await supabase.from('documents').insert({
      application_id: application?.id,
      name: EVRAK_LISTESI[idx].ad,
      file_url: urlData.publicUrl,
      file_name: file.name,
      status: 'uploaded',
      delivery_type: 'digital',
    })

    setEvraklar(prev => ({ ...prev, [idx]: { tip: 'dijital', url: urlData.publicUrl, yukleniyor: false } }))
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
            Merhaba <strong style={{ color: 'white' }}>{client.full_name}</strong> — {application?.country} {application?.visa_type}
          </p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e8e4da' }}>
          {[['pasaport', '📄 Pasaport'], ['evrak', '📋 Evraklar'], ['bilgi', '👤 Bilgilerim']].map(([key, label]) => (
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

          {activeTab === 'pasaport' && (
            <div>
              {!ocrDone && !ocrLoading && (
                <div onClick={startOCR} style={{ border: '2px dashed #e8e4da', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#faf8f3', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35', marginBottom: '4px' }}>Pasaport fotoğrafınızı yükleyin</p>
                  <p style={{ fontSize: '11px', color: '#9aaabb' }}>JPG, PNG veya PDF · Maks. 10MB</p>
                </div>
              )}
              {ocrLoading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ width: '28px', height: '28px', border: '2px solid #e8e4da', borderTopColor: '#1a3a5c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '13px', color: '#9aaabb' }}>Pasaport okunuyor...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
              {ocrDone && ocrData && (
                <div>
                  <div style={{ background: '#edfaf3', border: '1px solid #a8e6c1', borderRadius: '8px', padding: '8px 12px', marginBottom: '1rem', fontSize: '12px', color: '#1a7a45' }}>
                    ✓ Pasaport başarıyla okundu
                  </div>
                  {[['Ad Soyad', ocrData.ad], ['Pasaport No', ocrData.no], ['Uyruk', ocrData.uyruk], ['Doğum Tarihi', ocrData.dogum], ['Son Geçerlilik', ocrData.gecerlilik]].map(([label, value]) => (
                    <div key={label} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
                      <input readOnly value={value} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #a8e6c1', borderRadius: '8px', fontSize: '13px', background: '#edfaf3', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('evrak')} style={{ width: '100%', padding: '11px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' }}>
                    Bilgileri Onayla ve Devam Et →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evrak' && (
            <div>
              {EVRAK_LISTESI.map((evrak, idx) => {
                const secim = evraklar[idx]

                if (evrak.tip === 'firma') return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eef4fb', borderRadius: '8px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '16px' }}>🏢</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{evrak.ad}</div>
                        <div style={{ fontSize: '11px', color: '#5a6a7a', marginTop: '2px' }}>Danışmanlık firmanız tarafından karşılanacak.</div>
                      </div>
                      <span style={{ background: '#eef4fb', color: '#1a5fa5', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid #b8d4f0', whiteSpace: 'nowrap' }}>Firma Ekleyecek</span>
                    </div>
                  </div>
                )

                if (evrak.tip === 'elden') return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#faf8f3', borderRadius: '8px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '16px' }}>🤝</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{evrak.ad}</div>
                        <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>Randevu günü elden teslim edilmelidir.</div>
                      </div>
                      <span style={{ background: '#fff8ec', color: '#92600a', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Zorunlu Elden</span>
                    </div>
                  </div>
                )

                if (secim?.yukleniyor) return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ fontSize: '13px', color: '#9aaabb' }}>{evrak.ad} — yükleniyor...</div>
                  </div>
                )

                if (secim?.tip === 'dijital' && secim.url) return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#edfaf3', border: '1px solid #a8e6c1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#1a7a45', flexShrink: 0 }}>✓</div>
                      <span style={{ fontSize: '13px', color: '#0d1f35' }}>{evrak.ad}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#1a7a45', fontWeight: '500' }}>Yüklendi ✓</span>
                    </div>
                  </div>
                )

                if (secim?.tip === 'elden') return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#0d1f35' }}>{evrak.ad}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#92600a', fontWeight: '500' }}>Elden getirilecek</span>
                    </div>
                  </div>
                )

                return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f0ede6' }}>
                    <div style={{ fontSize: '13px', color: '#0d1f35', marginBottom: '8px', fontWeight: '500' }}>{evrak.ad}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        ref={el => { fileRefs.current[idx] = el }}
                        onChange={e => handleFileUpload(idx, e)}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => fileRefs.current[idx]?.click()}
                        style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        📎 Dijital Yükle
                      </button>
                      <button
                        onClick={() => setEvraklar(prev => ({ ...prev, [idx]: { tip: 'elden' } }))}
                        style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '500', background: '#faf8f3', color: '#1a3a5c', border: '1.5px solid #1a3a5c', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        🤝 Elden Getireceğim
                      </button>
                    </div>
                  </div>
                )
              })}
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
                <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setPhoneSaved(false) }} placeholder="+90 5xx xxx xx xx" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>E-posta</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailSaved(false) }} placeholder="ornek@email.com" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <button onClick={saveBilgi} style={{ width: '100%', padding: '11px', background: emailSaved && phoneSaved ? '#1a7a45' : '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' }}>
                {emailSaved && phoneSaved ? '✓ Kaydedildi!' : 'Bilgileri Kaydet'}
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