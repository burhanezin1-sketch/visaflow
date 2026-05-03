'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'firmalar' | 'evraklar'>('firmalar')
  const router = useRouter()

  // Evrak şablonları state
  const [visaDocs, setVisaDocs] = useState<any[]>([])
  const [visaOptions, setVisaOptions] = useState<{ country: string; visa_type: string }[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedVisa, setSelectedVisa] = useState('')
  const [showEvrakModal, setShowEvrakModal] = useState(false)
  const [editEvrak, setEditEvrak] = useState<any>(null)
  const [evrakForm, setEvrakForm] = useState({ country: '', visa_type: '', doc_name: '', delivery_type: 'digital', order_num: 1 })
  const [savingEvrak, setSavingEvrak] = useState(false)
  const [newCountry, setNewCountry] = useState('')
  const [newVisa, setNewVisa] = useState('')
  const [showNewCombo, setShowNewCombo] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchCompanies()
    fetchVisaDocs()
    fetchVisaOptions()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/superadmin/login'); return }
    const { data: sa } = await supabase.from('superadmins').select('id').eq('id', user.id).single()
    if (!sa) router.push('/superadmin/login')
  }

  async function fetchCompanies() {
    const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
    setCompanies(data || [])
    setLoading(false)
  }

  async function fetchVisaDocs() {
    const { data } = await supabase.from('visa_documents').select('*').order('country').order('visa_type').order('order_num')
    setVisaDocs(data || [])
  }

  async function fetchVisaOptions() {
    const { data } = await supabase.from('visa_documents').select('country, visa_type').order('country')
    const unique = Array.from(new Map(data?.map((d: any) => [`${d.country}__${d.visa_type}`, d])).values()) as { country: string; visa_type: string }[]
    setVisaOptions(unique)
    if (unique.length > 0 && !selectedCountry) {
      setSelectedCountry(unique[0].country)
      setSelectedVisa(unique[0].visa_type)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/superadmin/login')
  }

  async function saveEvrak() {
    if (!evrakForm.country || !evrakForm.visa_type || !evrakForm.doc_name) return
    setSavingEvrak(true)
    if (editEvrak) {
      await supabase.from('visa_documents').update({
        country: evrakForm.country,
        visa_type: evrakForm.visa_type,
        doc_name: evrakForm.doc_name,
        delivery_type: evrakForm.delivery_type,
        order_num: evrakForm.order_num,
      }).eq('id', editEvrak.id)
    } else {
      await supabase.from('visa_documents').insert({
        country: evrakForm.country,
        visa_type: evrakForm.visa_type,
        doc_name: evrakForm.doc_name,
        delivery_type: evrakForm.delivery_type,
        order_num: evrakForm.order_num,
      })
    }
    setSavingEvrak(false)
    setShowEvrakModal(false)
    setEditEvrak(null)
    setEvrakForm({ country: '', visa_type: '', doc_name: '', delivery_type: 'digital', order_num: 1 })
    await fetchVisaDocs()
    await fetchVisaOptions()
  }

  async function deleteEvrak(id: string) {
    if (!confirm('Bu evrakı silmek istediğinizden emin misiniz?')) return
    await supabase.from('visa_documents').delete().eq('id', id)
    fetchVisaDocs()
  }

  async function addNewCombo() {
    if (!newCountry || !newVisa) return
    setSelectedCountry(newCountry)
    setSelectedVisa(newVisa)
    setEvrakForm({ country: newCountry, visa_type: newVisa, doc_name: '', delivery_type: 'digital', order_num: 1 })
    setShowNewCombo(false)
    setNewCountry('')
    setNewVisa('')
    setShowEvrakModal(true)
  }

  const countries = [...new Set(visaOptions.map(v => v.country))].sort()
  const visaTypesForCountry = [...new Set(visaOptions.filter(v => v.country === selectedCountry).map(v => v.visa_type))].sort()
  const filteredDocs = visaDocs.filter(d => d.country === selectedCountry && d.visa_type === selectedVisa)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ background: '#1c1c24', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="37" stroke="white" strokeWidth="2.5"/>
            <circle cx="40" cy="40" r="27" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
            <polygon points="40,4 45.5,37 40,31 34.5,37" fill="white"/>
            <polygon points="40,76 45.5,43 40,49 34.5,43" fill="rgba(255,255,255,0.3)"/>
            <line x1="3" y1="40" x2="13" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="67" y1="40" x2="77" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="40" cy="40" r="3.5" fill="white"/>
            <circle cx="40" cy="40" r="1.5" fill="#1c1c24"/>
          </svg>
          <span style={{ color: 'white', fontWeight: '500', fontSize: '14px', letterSpacing: '1px', fontFamily: "'Playfair Display', serif" }}>VECTROPUS</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: '4px' }}>/ Süper Admin</span>
        </div>
        <button onClick={logout} style={{ padding: '6px 14px', fontSize: '12px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer' }}>Çıkış</button>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e2e8', padding: '0 2rem', display: 'flex', gap: '0' }}>
        {[['firmalar', '🏢 Firmalar'], ['evraklar', '📋 Evrak Şablonları']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key as any)} style={{
            padding: '14px 20px', fontSize: '13px', fontWeight: '500',
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: activeTab === key ? '#1c1c24' : '#9aaabb',
            borderBottom: activeTab === key ? '2px solid #378ADD' : '2px solid transparent',
            fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '2rem' }}>

        {/* FİRMALAR */}
        {activeTab === 'firmalar' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1c1c24' }}>Firmalar</h2>
                <p style={{ fontSize: '13px', color: '#5a6a7a', marginTop: '4px' }}>{companies.length} aktif firma</p>
              </div>
              <button onClick={() => router.push('/superadmin/firma/yeni')} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '500', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                + Yeni Firma Ekle
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {companies.map(c => (
                <div key={c.id} style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eef4fb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏢</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1c1c24' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#9aaabb', marginTop: '2px' }}>{c.city || '-'}</div>
                    </div>
                  </div>
                  {[
                    ['Email', c.email],
                    ['Telefon', c.phone || '-'],
                    ['Plan', c.plan || 'Standart'],
                    ['Kayıt', new Date(c.created_at).toLocaleDateString('tr-TR')],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f4', fontSize: '12px' }}>
                      <span style={{ color: '#9aaabb' }}>{label}</span>
                      <span style={{ color: '#1c1c24', fontWeight: '500' }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '12px' }}>
                    <button onClick={() => router.push('/login')} style={{ width: '100%', padding: '7px', fontSize: '11px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                      Panele Git
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* EVRAK ŞABLONLARI */}
        {activeTab === 'evraklar' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#1c1c24' }}>Evrak Şablonları</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowNewCombo(true)} style={{ padding: '8px 14px', fontSize: '12px', background: '#f5f5f7', color: '#1c1c24', border: '1px solid #e2e2e8', borderRadius: '8px', cursor: 'pointer' }}>
                  + Yeni Ülke/Vize Tipi
                </button>
                <button onClick={() => {
                  setEditEvrak(null)
                  setEvrakForm({ country: selectedCountry, visa_type: selectedVisa, doc_name: '', delivery_type: 'digital', order_num: filteredDocs.length + 1 })
                  setShowEvrakModal(true)
                }} style={{ padding: '8px 14px', fontSize: '12px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  + Evrak Ekle
                </button>
              </div>
            </div>

            {/* Ülke + Vize Tipi Seçici */}
            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: '#9aaabb', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Ülke</label>
                <select value={selectedCountry} onChange={e => {
                  const c = e.target.value
                  const firstVisa = visaOptions.find(v => v.country === c)?.visa_type || ''
                  setSelectedCountry(c)
                  setSelectedVisa(firstVisa)
                }} style={{ padding: '7px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none' }}>
                  {countries.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '11px', color: '#9aaabb', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Vize Tipi</label>
                <select value={selectedVisa} onChange={e => setSelectedVisa(e.target.value)} style={{ padding: '7px 10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none' }}>
                  {visaTypesForCountry.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <span style={{ fontSize: '12px', color: '#9aaabb' }}>{filteredDocs.length} evrak</span>
            </div>

            {/* Evrak Listesi */}
            <div style={{ background: 'white', border: '1px solid #e2e2e8', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Evrak Adı', 'Teslimat Tipi', ''].map(h => (
                      <th key={h} style={{ fontSize: '10px', color: '#9aaabb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '10px 1.25rem', textAlign: 'left', borderBottom: '1px solid #f0f0f4', background: '#f5f5f7' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', fontSize: '13px', color: '#9aaabb' }}>
                        Bu kombinasyon için evrak tanımlanmamış.
                      </td>
                    </tr>
                  )}
                  {filteredDocs.map((d, idx) => (
                    <tr key={d.id}>
                      <td style={{ padding: '11px 1.25rem', fontSize: '12px', color: '#9aaabb', borderBottom: '1px solid #f0f0f4', width: '40px' }}>{idx + 1}</td>
                      <td style={{ padding: '11px 1.25rem', fontSize: '13px', fontWeight: '500', borderBottom: '1px solid #f0f0f4' }}>{d.doc_name}</td>
                      <td style={{ padding: '11px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
                          background: d.delivery_type === 'digital' ? '#eef4fb' : d.delivery_type === 'physical' ? '#fff8ec' : '#edfaf3',
                          color: d.delivery_type === 'digital' ? '#1a5fa5' : d.delivery_type === 'physical' ? '#92600a' : '#1a7a45',
                        }}>
                          {d.delivery_type === 'digital' ? 'Dijital' : d.delivery_type === 'physical' ? 'Elden' : 'Firma'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 1.25rem', borderBottom: '1px solid #f0f0f4' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => {
                            setEditEvrak(d)
                            setEvrakForm({ country: d.country, visa_type: d.visa_type, doc_name: d.doc_name, delivery_type: d.delivery_type, order_num: d.order_num })
                            setShowEvrakModal(true)
                          }} style={{ padding: '4px 10px', fontSize: '11px', background: '#eef4fb', color: '#1a5fa5', border: '1px solid #b8d4f0', borderRadius: '6px', cursor: 'pointer' }}>Düzenle</button>
                          <button onClick={() => deleteEvrak(d.id)} style={{ padding: '4px 10px', fontSize: '11px', background: '#fef0ee', color: '#c0392b', border: '1px solid #f5b8b0', borderRadius: '6px', cursor: 'pointer' }}>Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Evrak Modal */}
      {showEvrakModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '400px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#1c1c24' }}>
              {editEvrak ? 'Evrak Düzenle' : 'Yeni Evrak Ekle'}
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
              <input value={evrakForm.country} readOnly={!!editEvrak} onChange={e => setEvrakForm({...evrakForm, country: e.target.value})} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: editEvrak ? '#f5f5f7' : 'white' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
              <input value={evrakForm.visa_type} readOnly={!!editEvrak} onChange={e => setEvrakForm({...evrakForm, visa_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: editEvrak ? '#f5f5f7' : 'white' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Evrak Adı</label>
              <input value={evrakForm.doc_name} onChange={e => setEvrakForm({...evrakForm, doc_name: e.target.value})} placeholder="Pasaport fotokopisi" style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Teslimat Tipi</label>
              <select value={evrakForm.delivery_type} onChange={e => setEvrakForm({...evrakForm, delivery_type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit' }}>
                <option value="digital">Dijital (portal üzerinden yüklenir)</option>
                <option value="physical">Elden (randevu günü teslim)</option>
                <option value="company">Firma (danışmanlık firması ekler)</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Sıra No</label>
              <input type="number" value={evrakForm.order_num} onChange={e => setEvrakForm({...evrakForm, order_num: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowEvrakModal(false); setEditEvrak(null) }} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={saveEvrak} disabled={savingEvrak} style={{ flex: 2, padding: '10px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {savingEvrak ? 'Kaydediliyor...' : editEvrak ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Ülke/Vize Tipi Modal */}
      {showNewCombo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,53,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '380px', maxWidth: '95vw', boxShadow: '0 12px 40px rgba(13,31,53,0.12)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '1.5rem', color: '#1c1c24' }}>Yeni Ülke / Vize Tipi</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Ülke</label>
              <input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="Avustralya" style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Vize Tipi</label>
              <input value={newVisa} onChange={e => setNewVisa(e.target.value)} placeholder="Turist, İş, Öğrenci..." style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowNewCombo(false)} style={{ flex: 1, padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>İptal</button>
              <button onClick={addNewCombo} style={{ flex: 2, padding: '10px', background: '#1c1c24', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                Oluştur ve Evrak Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}