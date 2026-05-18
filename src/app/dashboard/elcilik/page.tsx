'use client'

import Topbar from '@/components/Topbar'
import { useIsMobile } from '@/lib/useIsMobile'

const schengen = [
  { ulke: '🇩🇪 Almanya', kurum: 'iDATA', url: 'https://www.idata.com.tr' },
  { ulke: '🇫🇷 Fransa', kurum: 'VFS Global', url: 'https://www.vfsglobal.com' },
  { ulke: '🇮🇹 İtalya', kurum: 'VFS Global', url: 'https://www.vfsglobal.com' },
  { ulke: '🇳🇱 Hollanda', kurum: 'VFS Global', url: 'https://www.vfsglobal.com' },
  { ulke: '🇪🇸 İspanya', kurum: 'VFS Global', url: 'https://www.vfsglobal.com' },
  { ulke: '🇧🇪 Belçika', kurum: 'VFS Global', url: 'https://www.vfsglobal.com' },
]

const diger = [
  { ulke: '🇺🇸 ABD', kurum: 'Büyükelçilik', url: 'https://tr.usembassy.gov' },
  { ulke: '🇬🇧 UK', kurum: 'VFS Global', url: 'https://www.vfsglobal.com' },
  { ulke: '🇨🇦 Kanada', kurum: 'IRCC', url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
  { ulke: '🇯🇵 Japonya', kurum: 'Büyükelçilik', url: 'https://www.tr.emb-japan.go.jp' },
  { ulke: '🇦🇺 Avustralya', kurum: 'Home Affairs', url: 'https://immi.homeaffairs.gov.au' },
]

const araclar = [
  { ulke: '📋 VFS Global', kurum: 'Vize Merkezi', url: 'https://www.vfsglobal.com' },
  { ulke: '✈️ IATA Travel Centre', kurum: 'Seyahat Kuralları', url: 'https://www.iatatravelcentre.com' },
  { ulke: '📰 T.C. Dışişleri Bakanlığı', kurum: 'Resmi Site', url: 'https://www.mfa.gov.tr' },
  { ulke: '🌐 DS-160 Formu', kurum: 'ABD Vize Başvurusu', url: 'https://ceac.state.gov' },
]

function LinkKarti({ items, title, isMobile }: { items: any[], title: string, isMobile: boolean }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden', marginBottom: isMobile ? '0.75rem' : '1.25rem' }}>
      <div style={{ padding: isMobile ? '0.625rem 0.875rem' : '1rem 1.25rem', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>
        <h3 style={{ margin: 0, fontSize: isMobile ? '13px' : '14px', fontWeight: '500', color: '#0d1f35' }}>{title}</h3>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '10px 0.875rem' : '12px 1.25rem', borderBottom: i < items.length - 1 ? '1px solid #f0ede6' : 'none', gap: '8px' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '500', color: '#0d1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.ulke}</div>
            <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{item.kurum}</div>
          </div>
          <button
            onClick={() => window.open(item.url, '_blank')}
            style={{ padding: isMobile ? '5px 10px' : '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
          >
            Aç →
          </button>
        </div>
      ))}
    </div>
  )
}

export default function ElcilikPage() {
  const isMobile = useIsMobile()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Elçilik Linkleri" />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ fontSize: '12px', color: '#5a6a7a', marginBottom: isMobile ? '0.75rem' : '1.25rem' }}>
          Sık kullanılan konsolosluk ve vize sitelerine hızlı erişim.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0' : '1.25rem' }}>
          <div>
            <LinkKarti title="🇪🇺 Schengen Ülkeleri" items={schengen} isMobile={isMobile} />
          </div>
          <div>
            <LinkKarti title="🌍 Diğer Ülkeler" items={diger} isMobile={isMobile} />
            <LinkKarti title="🔧 Araçlar" items={araclar} isMobile={isMobile} />
          </div>
        </div>
      </div>
    </div>
  )
}
