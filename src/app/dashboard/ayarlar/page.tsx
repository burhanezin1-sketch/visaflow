'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'

export default function AyarlarPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const isMobile = useIsMobile()

  const [plan, setPlan]           = useState<string>('')
  const [logoUrl, setLogoUrl]     = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [loading, setLoading]     = useState(true)
  const fileRef                   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!companyId) return
    supabase
      .from('companies')
      .select('name, plan, logo_url')
      .eq('id', companyId)
      .single()
      .then(({ data }) => {
        if (data) {
          setCompanyName(data.name || '')
          setPlan(data.plan || '')
          setLogoUrl(data.logo_url || null)
        }
        setLoading(false)
      })
  }, [companyId])

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload-company-logo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Yükleme başarısız', false); return }
      setLogoUrl(data.logo_url)
      showToast('✓ Logo kaydedildi')
    } catch (err: any) {
      showToast('Bağlantı hatası', false)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete() {
    if (!confirm('Logoyu kaldırmak istediğinizden emin misiniz?')) return
    setUploading(true)
    try {
      const res = await fetch('/api/upload-company-logo', { method: 'DELETE' })
      if (!res.ok) { showToast('Silme başarısız', false); return }
      setLogoUrl(null)
      showToast('✓ Logo kaldırıldı')
    } finally {
      setUploading(false)
    }
  }

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  const isKurumsal = plan === 'kurumsal'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Ayarlar" />

      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? '#1a7a45' : '#c0392b', color: 'white',
          padding: '10px 20px', borderRadius: '8px', fontSize: '13px',
          fontWeight: '500', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#f5f5f7' }}>
        <div style={{ maxWidth: '520px' }}>

          {/* Firma Bilgisi */}
          <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '13px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Firma Bilgisi</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f4', fontSize: '13px' }}>
              <span style={{ color: '#5a6a7a' }}>Firma Adı</span>
              <span style={{ fontWeight: '500' }}>{companyName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
              <span style={{ color: '#5a6a7a' }}>Plan</span>
              <span style={{
                fontWeight: '600',
                color: plan === 'kurumsal' ? '#5b21b6' : plan === 'pro' ? '#1a5fa5' : '#5a6a7a',
                background: plan === 'kurumsal' ? '#f3e8ff' : plan === 'pro' ? '#eef4fb' : '#f5f5f7',
                padding: '2px 10px', borderRadius: '20px', fontSize: '12px',
              }}>
                {plan === 'kurumsal' ? '⭐ Kurumsal' : plan === 'pro' ? 'Pro' : plan || 'Standard'}
              </span>
            </div>
          </div>

          {/* Logo */}
          <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Firma Logosu</h3>
              {!isKurumsal && (
                <span style={{ fontSize: '11px', background: '#f3e8ff', color: '#5b21b6', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                  ⭐ Kurumsal
                </span>
              )}
            </div>

            {!isKurumsal ? (
              <div style={{ background: '#faf8ff', border: '1px solid #e9d8fd', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#5b21b6', marginBottom: '4px' }}>Kurumsal Pakete Özel</div>
                <div style={{ fontSize: '12px', color: '#9aaabb', lineHeight: '1.5' }}>
                  Kendi firmanızın logosunu danışman panelinde ve müşteri portalında göstermek için Kurumsal plana geçin.
                </div>
              </div>
            ) : (
              <>
                {/* Mevcut logo önizleme */}
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '80px', height: '80px', border: '2px dashed #e2e2e8',
                    borderRadius: '10px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', overflow: 'hidden', background: '#f5f5f7', flexShrink: 0,
                  }}>
                    {logoUrl
                      ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span style={{ fontSize: '24px', color: '#d0d0d8' }}>🏢</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35', marginBottom: '4px' }}>
                      {logoUrl ? 'Logo yüklendi' : 'Henüz logo yüklenmedi'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9aaabb' }}>
                      JPG, PNG, WEBP veya SVG · Maks. 2 MB
                    </div>
                  </div>
                </div>

                {/* Upload */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{
                      flex: 1, padding: '10px', background: uploading ? '#9aaabb' : '#1a3a5c',
                      color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '500', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {uploading ? 'Yükleniyor...' : logoUrl ? '🔄 Logoyu Güncelle' : '📁 Logo Yükle'}
                  </button>
                  {logoUrl && (
                    <button
                      onClick={handleDelete}
                      disabled={uploading}
                      style={{
                        padding: '10px 14px', background: '#fef0ee', color: '#c0392b',
                        border: '1px solid #f5b8b0', borderRadius: '8px', fontSize: '13px',
                        cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Kaldır
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '12px', background: '#f5f5f7', border: '1px solid #e2e2e8', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#5a6a7a', lineHeight: '1.6' }}>
                  💡 Logo, danışman panelindeki sol menüde ve müşteri portal sayfasının başlığında görünür.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
