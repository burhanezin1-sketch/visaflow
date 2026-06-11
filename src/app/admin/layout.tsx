import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import AdminSidebarWrapper from './AdminSidebarWrapper'
import Topbar from '@/components/Topbar'
import SessionTimeout from '@/components/SessionTimeout'
import { SidebarProvider } from '@/lib/SidebarContext'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users').select('role').eq('id', user.id).maybeSingle()
  if (!userData || userData.role !== 'admin') redirect('/dashboard')

  return (
    <SidebarProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#e4eaf5', fontFamily: 'system-ui' }}>
        <AdminSidebarWrapper />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <SessionTimeout />
          <Topbar />
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
