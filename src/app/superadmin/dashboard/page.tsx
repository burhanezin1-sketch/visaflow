'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchCompanies()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/superadmin/login'); return }
    const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
    if (!sa) router.push('/superadmin/login')
  }

  async function fetchCompanies() {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    setCompanies(data || [])
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/superadmin/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f3', fontFamily: 'system-ui' }}>
      <div style={{ background: '#0d1f35', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#c9a84c', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
          <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>Vectropus Süper Admin</span>
        </div>
        <button onClick={logout} style={{ padding: '6px 14px', fontSize: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>Çıkış</button>
      </div>

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#0d1f35' }}>Firmalar</h2>
            <p style={{ fontSize: '13px', color: '#5a6a7a', marginTop: '4px' }}>{companies.length} aktif firma</p>
          </div>
          <button onClick={() => router.push('/superadmin/firma/yeni')} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '500', background: '#0d1f35', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
            + Yeni Firma Ekle
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {companies.map(c => (
            <div key={c.id} style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: '#eef4fb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏢</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0d1f35' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#9aaabb', marginTop: '2px' }}>{c.city || '-'}</div>
                </div>
              </div>
              {[
                ['Email', c.email],
                ['Telefon', c.phone || '-'],
                ['Plan', c.plan || 'Standart'],
                ['Kayıt', new Date(c.created_at).toLocaleDateString('tr-TR')],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0ede6', fontSize: '12px' }}>
                  <span style={{ color: '#9aaabb' }}>{label}</span>
                  <span style={{ color: '#0d1f35', fontWeight: '500' }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button onClick={() => router.push(`/login`)} style={{ flex: 1, padding: '7px', fontSize: '11px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Panele Git
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}