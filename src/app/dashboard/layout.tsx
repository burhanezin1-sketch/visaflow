import Sidebar from '@/components/Sidebar'
import SessionTimeout from '@/components/SessionTimeout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f5f5f7',
      fontFamily: "'Outfit', 'system-ui', sans-serif",
    }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SessionTimeout />
        {children}
      </div>
    </div>
  )
}