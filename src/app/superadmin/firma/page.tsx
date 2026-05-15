'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PLAN_LIMITS: Record<string, number> = { basic: 30, pro: 100 }

export default function FirmaListPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [userCounts, setUserCounts] = useState<Record<string, number>>({})
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [changingPlan, setChangingPlan] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/superadmin/login'); return }
    const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
    if (!sa) { router.push('/superadmin/login'); return }
    await fetchAll()
  }

  async function fetchAll() {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    const list = data || []
    setCompanies(list)

    const { data: users } = await supabase.from('users').select('company_id')
    const counts: Record<string, number> = {}
    users?.forEach((u: any) => { counts[u.company_id] = (counts[u.company_id] || 0) + 1 })
    setUserCounts(counts)

    const monthlyData: Record<string, number> = {}
    await Promise.all(list.map(async (c: any) => {
      const { data: cnt } = await supabase.rpc('get_monthly_application_count', { company_id: c.id })
      monthlyData[c.id] = cnt || 0
    }))
    setMonthlyCounts(monthlyData)
    setLoading(false)
  }

  async function changePlan(companyId: string, currentPlan: string) {
    const newPlan = currentPlan === 'basic' ? 'pro' : 'basic'
    if (!confirm(`Planı "${newPlan.toUpperCase()}" olarak değiştirmek istiyor musunuz?`)) return
    setChangingPlan(companyId)
    await supabase.from('companies').update({ plan: newPlan }).eq('id', companyId)
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, plan: newPlan } : c))
    setChangingPlan(null)
  }

  async function deleteFirma(companyId: string, name: string) {
    if (!confirm(`"${name}" firmasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`)) return
    setDeleting(companyId)
    await supabase.from('companies').delete().eq('id', companyId)
    setCompanies(prev => prev.filter(c => c.id !== companyId))
    setDeleting(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ background: '#1c1c24', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.push('/superadmin/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px', padding: 0 }}>← Dashboard</button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>Firma Yönetimi</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' }}>{companies.length} firma</span>
        </div>
        <button onClick={() => router.push('/superadmin/firma/yeni')} style={{ padding: '7px 16px', fontSize: '12px', background: '#378ADD', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
          + Yeni Firma
        </button>
      </div>

      <div style={{ padding: '2rem' }}>
        <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Firma', 'Plan', 'Kullanıcı', 'Aylık Kullanım', 'Kayıt Tarihi', 'İşlemler'].map(h => (
                  <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '12px 1.25rem', textAlign: 'left', borderBottom: '1px solid #e2e2e8', background: '#f5f5f7' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>Henüz kayıtlı firma yok.</td></tr>
              )}
              {companies.map(c => {
                const limit = PLAN_LIMITS[c.plan] || 0
                const used = monthlyCounts[c.id] || 0
                const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f4' }}>
                    <td style={{ padding: '14px 1.25rem' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c24' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{c.email}</div>
                      {c.city && <div style={{ fontSize: '11px', color: '#c0c8d4', marginTop: '1px' }}>{c.city}</div>}
                    </td>
                    <td style={{ padding: '14px 1.25rem' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                        background: c.plan === 'pro' ? '#eef4fb' : '#f0f0f4',
                        color: c.plan === 'pro' ? '#1a5fa5' : '#5a6a7a',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        {c.plan || 'basic'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 1.25rem', fontSize: '13px', fontWeight: '500', color: '#1c1c24' }}>
                      {userCounts[c.id] || 0}
                    </td>
                    <td style={{ padding: '14px 1.25rem' }}>
                      {limit > 0 ? (
                        <div style={{ minWidth: '120px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                            <span style={{ color: '#5a6a7a' }}>{used}/{limit}</span>
                            <span style={{ fontWeight: '600', color: pct >= 90 ? '#c0392b' : '#9aaabb' }}>{Math.round(pct)}%</span>
                          </div>
                          <div style={{ height: '5px', background: '#f0f0f4', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 90 ? '#c0392b' : '#378ADD', borderRadius: '99px' }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#c0c8d4' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 1.25rem', fontSize: '12px', color: '#5a6a7a' }}>
                      {new Date(c.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ padding: '14px 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => changePlan(c.id, c.plan || 'basic')}
                          disabled={changingPlan === c.id}
                          style={{
                            padding: '5px 10px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', borderRadius: '6px',
                            background: c.plan === 'pro' ? '#fff8ec' : '#eef4fb',
                            color: c.plan === 'pro' ? '#92600a' : '#1a5fa5',
                            border: `1px solid ${c.plan === 'pro' ? '#f0d090' : '#b8d4f0'}`,
                            opacity: changingPlan === c.id ? 0.6 : 1,
                          }}
                        >
                          {changingPlan === c.id ? '...' : c.plan === 'pro' ? '→ Basic' : '→ Pro'}
                        </button>
                        <button
                          onClick={() => deleteFirma(c.id, c.name)}
                          disabled={deleting === c.id}
                          style={{ padding: '5px 10px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer', opacity: deleting === c.id ? 0.6 : 1 }}
                        >
                          {deleting === c.id ? '...' : 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
