'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function YeniFirmaPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [firmaForm, setFirmaForm] = useState({
    name: '', email: '', phone: '', city: '', plan: 'basic'
  })
  const [adminForm, setAdminForm] = useState({
    full_name: '', email: '', password: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/superadmin/login'); return }
    const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
    if (!sa) router.push('/superadmin/login')
  }

  async function kaydet() {
    if (!firmaForm.name || !firmaForm.email || !adminForm.full_name || !adminForm.email || !adminForm.password) {
      setError('Tüm zorunlu alanları doldurun')
      return
    }
    setSaving(true)
    setError('')

    // 1. Firma oluştur
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: firmaForm.name,
        email: firmaForm.email,
        phone: firmaForm.phone,
        city: firmaForm.city,
        plan: firmaForm.plan,
      })
      .select()
      .single()

    if (companyError || !company) {
      setError('Firma oluşturulamadı: ' + companyError?.message)
      setSaving(false)
      return
    }

    // 2. Admin kullanıcı oluştur
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: adminForm.full_name,
        email: adminForm.email,
        password: adminForm.password,
        role: 'admin',
        company_id: company.id,
      }),
    })

    const data = await res.json()
    if (data.error) {
      setError('Admin oluşturulamadı: ' + data.error)
      setSaving(false)
      return
    }

    setSaving(false)
    router.push('/superadmin/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f3', fontFamily: 'system-ui' }}>
      <div style={{ background: '#0d1f35', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/superadmin/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px' }}>← Geri</button>
        <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>Yeni Firma Ekle</span>
      </div>

      <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem' }}>

        {/* Steps */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
          {[['1', 'Firma Bilgileri'], ['2', 'Admin Kullanıcı']].map(([num, label]) => (
            <div key={num} style={{ flex: 1, padding: '10px', background: step >= parseInt(num) ? '#0d1f35' : 'white', border: '1px solid #e8e4da', borderRadius: '10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setStep(parseInt(num))}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: step >= parseInt(num) ? 'rgba(255,255,255,0.6)' : '#9aaabb' }}>Adım {num}</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: step >= parseInt(num) ? 'white' : '#0d1f35', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '16px', padding: '2rem' }}>

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>🏢 Firma Bilgileri</h3>
              {[
                { label: 'Firma Adı *', key: 'name', placeholder: 'Çınar Danışmanlık' },
                { label: 'Email *', key: 'email', placeholder: 'info@firma.com' },
                { label: 'Telefon', key: 'phone', placeholder: '+90 5xx xxx xx xx' },
                { label: 'Şehir', key: 'city', placeholder: 'İstanbul' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{field.label}</label>
                  <input
                    value={(firmaForm as any)[field.key]}
                    onChange={e => setFirmaForm({...firmaForm, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Plan</label>
                <select value={firmaForm.plan} onChange={e => setFirmaForm({...firmaForm, plan: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', background: '#faf8f3', outline: 'none', fontFamily: 'inherit' }}>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <button onClick={() => setStep(2)} style={{ width: '100%', padding: '12px', background: '#0d1f35', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                Devam Et →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#0d1f35' }}>👤 Admin Kullanıcı</h3>
              {[
                { label: 'Ad Soyad *', key: 'full_name', placeholder: 'Serdar Çevik', type: 'text' },
                { label: 'Email *', key: 'email', placeholder: 'serdar@firma.com', type: 'email' },
                { label: 'Şifre *', key: 'password', placeholder: 'En az 6 karakter', type: 'password' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={(adminForm as any)[field.key]}
                    onChange={e => setAdminForm({...adminForm, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e4da', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
              ))}
              <div style={{ background: '#faf8f3', border: '1px solid #e8e4da', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#5a6a7a', marginBottom: '1.5rem' }}>
                ℹ️ Bu kullanıcı firmaya admin olarak eklenecek ve sisteme giriş yapabilecek.
              </div>
              {error && <p style={{ color: '#c0392b', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: '#faf8f3', color: '#5a6a7a', border: '1px solid #e8e4da', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}>← Geri</button>
                <button onClick={kaydet} disabled={saving} style={{ flex: 2, padding: '12px', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Oluşturuluyor...' : '✓ Firmayı Oluştur'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
