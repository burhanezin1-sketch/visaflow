import AdminSidebarWrapper from './AdminSidebarWrapper'
import Topbar from '@/components/Topbar'
import SessionTimeout from '@/components/SessionTimeout'
import { SidebarProvider } from '@/lib/SidebarContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: 'system-ui' }}>
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
