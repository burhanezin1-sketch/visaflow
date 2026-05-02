export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf8f3', fontFamily: 'system-ui' }}>
        {children}
      </div>
    )
  }