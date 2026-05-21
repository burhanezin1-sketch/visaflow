import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import Sidebar from '@/components/Sidebar'
import SessionTimeout from '@/components/SessionTimeout'
import { SidebarProvider } from '@/lib/SidebarContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <SidebarProvider>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f5f5f7',
        fontFamily: "'Outfit', 'system-ui', sans-serif",
      }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <SessionTimeout />
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
