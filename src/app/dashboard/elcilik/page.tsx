'use client'

import Topbar from '@/components/Topbar'

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

function LinkKarti({ items, title }: { items: any[], title: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ede6', background: '#faf8f3' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#0d1f35' }}>{title}</h3>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 1.25rem', borderBottom: i < items.length - 1 ? '1px solid #f0ede6' : 'none' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#0d1f35' }}>{item.ulke}</div>
            <div style={{ fontSize: '11px', color: '#9aaabb', marginTop: '2px' }}>{item.kurum}</div>
          </div>
          <button
            onClick={() => window.open(item.url, '_blank')}
            style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Aç →
          </button>
        </div>
      ))}
    </div>
  )
}

export default function ElcilikPage() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Elçilik Linkleri" />
      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ fontSize: '13px', color: '#5a6a7a', marginBottom: '1.25rem' }}>
          Sık kullanılan konsolosluk ve vize sitelerine hızlı erişim.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <LinkKarti title="🇪🇺 Schengen Ülkeleri" items={schengen} />
          </div>
          <div>
            <LinkKarti title="🌍 Diğer Ülkeler" items={diger} />
            <LinkKarti title="🔧 Araçlar" items={araclar} />
          </div>
        </div>
      </div>
    </div>
  )
}