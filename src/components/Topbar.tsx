'use client'

export default function Topbar({ title }: { title: string }) {
  return (
    <div style={{
      background: '#f5f5f7',
      borderBottom: '1px solid #e2e2e8',
      padding: '0.875rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '17px',
        fontWeight: '500',
        color: '#1c1c24',
        margin: 0,
        letterSpacing: '-0.2px',
      }}>
        {title}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width="38" height="38" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="37" stroke="#1c1c24" strokeWidth="2.5"/>
          <circle cx="40" cy="40" r="27" stroke="#c8d4e0" strokeWidth="1"/>
          <polygon points="40,4 45.5,37 40,31 34.5,37" fill="#1c1c24"/>
          <polygon points="40,76 45.5,43 40,49 34.5,43" fill="#c8d4e0"/>
          <line x1="3" y1="40" x2="13" y2="40" stroke="#1c1c24" strokeWidth="2" strokeLinecap="round"/>
          <line x1="67" y1="40" x2="77" y2="40" stroke="#1c1c24" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="3" x2="40" y2="9" stroke="#1c1c24" strokeWidth="2" strokeLinecap="round"/>
          <line x1="40" y1="71" x2="40" y2="77" stroke="#1c1c24" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="14" x2="19" y2="19" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="66" y1="14" x2="61" y2="19" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="14" y1="66" x2="19" y2="61" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="66" y1="66" x2="61" y2="61" stroke="#c8d4e0" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="40" cy="40" r="3.5" fill="#1c1c24"/>
          <circle cx="40" cy="40" r="1.5" fill="#f5f5f7"/>
        </svg>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '16px',
          letterSpacing: '3px',
          color: '#1c1c24',
          fontWeight: '400',
        }}>
          VECTROPUS
        </span>
      </div>
    </div>
  )
}