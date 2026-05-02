'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/useCompany'

export default function GorevlerPage() {
  const { companyId, loading: companyLoading } = useCompany()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!companyId) return
    fetchTasks()
  }, [companyId])

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*, clients(*)')
      .eq('company_id', companyId)
      .eq('is_done', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  async function toggleTask(task: any) {
    await supabase.from('tasks').update({ is_done: true }).eq('id', task.id)
    fetchTasks()
  }

  const acil = tasks.filter(t => t.priority === 'urgent')
  const normal = tasks.filter(t => t.priority === 'normal')

  if (companyLoading || loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888' }}>Yükleniyor...</div>
    </div>
  )

  function GorevItem({ task }: { task: any }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '8px',
        border: '1px solid #f0ede6', marginBottom: '8px', background: 'white',
        borderLeft: task.priority === 'urgent' ? '3px solid #c0392b' : '3px solid #c9a84c',
      }}>
        <div onClick={() => toggleTask(task)} style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #e8e4da', flexShrink: 0, cursor: 'pointer' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#0d1f35' }}>{task.title}</div>
          {task.clients && <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{task.clients.full_name}</div>}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {task.due_date && <span style={{ fontSize: '11px', color: '#9aaabb' }}>{new Date(task.due_date).toLocaleDateString('tr-TR')}</span>}
          {task.client_id && (
            <button onClick={() => router.push(`/dashboard/musteriler/${task.client_id}`)} style={{ padding: '3px 8px', fontSize: '10px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Profil</button>
          )}
          <button onClick={() => toggleTask(task)} style={{ padding: '3px 8px', fontSize: '10px', background: '#1a7a45', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✓ Tamamla</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Görev Listesi" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9aaabb', fontSize: '13px' }}>🎉 Tüm görevler tamamlandı!</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fef0ee, #fff5f4)' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#c0392b' }}>⚡ Acil Görevler</h3>
                  <span style={{ background: '#fef0ee', color: '#c0392b', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid #f5b8b0' }}>{acil.length}</span>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  {acil.length === 0 ? <div style={{ textAlign: 'center', padding: '1rem', color: '#9aaabb', fontSize: '12px' }}>✓ Acil görev yok</div> : acil.map(t => <GorevItem key={t.id} task={t} />)}
                </div>
              </div>
            </div>
            <div>
              <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fff8ec, #fffbf0)' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#92600a' }}>📋 Normal Görevler</h3>
                  <span style={{ background: '#fff8ec', color: '#92600a', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', border: '1px solid #f0d896' }}>{normal.length}</span>
                </div>
                <div style={{ padding: '0.75rem' }}>
                  {normal.length === 0 ? <div style={{ textAlign: 'center', padding: '1rem', color: '#9aaabb', fontSize: '12px' }}>✓ Normal görev yok</div> : normal.map(t => <GorevItem key={t.id} task={t} />)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}