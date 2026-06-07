'use client'

import Topbar from '@/components/Topbar'
import { useIsMobile } from '@/lib/useIsMobile'

const schengen = [
  { ulke: '🇩🇪 Almanya',     kurum: 'iDATA',          url: 'https://www.idata.com.tr' },
  { ulke: '🇫🇷 Fransa',      kurum: 'VFS Global / France-Visas', url: 'https://france-visas.gouv.fr' },
  { ulke: '🇮🇹 İtalya',      kurum: 'iDATA',          url: 'https://www.idata.com.tr' },
  { ulke: '🇪🇸 İspanya',     kurum: 'BLS International', url: 'https://turkey.blsspainvisa.com' },
  { ulke: '🇳🇱 Hollanda',    kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/nld' },
  { ulke: '🇧🇪 Belçika',     kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/bel' },
  { ulke: '🇦🇹 Avusturya',   kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/aut' },
  { ulke: '🇬🇷 Yunanistan',  kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/grc' },
  { ulke: '🇵🇱 Polonya',     kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/pol' },
  { ulke: '🇭🇺 Macaristan',  kurum: 'AS Visa',        url: 'https://hungary.askvisacenters.com' },
  { ulke: '🇨🇭 İsviçre',     kurum: 'TLScontact',     url: 'https://tr.tlscontact.com/visa/CH' },
  { ulke: '🇵🇹 Portekiz',    kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/prt' },
  { ulke: '🇨🇿 Çekya',       kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/cze' },
  { ulke: '🇩🇰 Danimarka',   kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/dnk' },
  { ulke: '🇸🇪 İsveç',       kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/swe' },
  { ulke: '🇫🇮 Finlandiya',  kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/fin' },
  { ulke: '🇳🇴 Norveç',      kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/nor' },
  { ulke: '🇲🇹 Malta',       kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/mlt' },
  { ulke: '🇸🇰 Slovakya',    kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/svk' },
  { ulke: '🇸🇮 Slovenya',    kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/svn' },
  { ulke: '🇭🇷 Hırvatistan', kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/hrv' },
  { ulke: '🇪🇪 Estonya',     kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/est' },
  { ulke: '🇱🇻 Letonya',     kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/lva' },
  { ulke: '🇱🇹 Litvanya',    kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/ltu' },
  { ulke: '🇱🇺 Lüksemburg',  kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/lux' },
  { ulke: '🇷🇴 Romanya',     kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/rou' },
  { ulke: '🇧🇬 Bulgaristan', kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/bgr' },
  { ulke: '🇮🇪 İrlanda',     kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/irl' },
]

const diger = [
  { ulke: '🇬🇧 İngiltere',   kurum: 'VFS Global',              url: 'https://visa.vfsglobal.com/tur/tr/gbr' },
  { ulke: '🇺🇸 ABD',         kurum: 'Büyükelçilik / DS-160',   url: 'https://tr.usembassy.gov/visas' },
  { ulke: '🇨🇦 Kanada',      kurum: 'IRCC Online Portal',      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html' },
  { ulke: '🇯🇵 Japonya',     kurum: 'Japonya Büyükelçiliği',   url: 'https://www.tr.emb-japan.go.jp' },
  { ulke: '🇰🇷 Güney Kore',  kurum: 'HiKorea / Büyükelçilik', url: 'https://www.hikorea.go.kr' },
]

const araclar = [
  { ulke: '🇫🇷 France-Visas Portal',      kurum: 'Fransa Vize Başvurusu',     url: 'https://france-visas.gouv.fr' },
  { ulke: '📋 VFS Global Türkiye',         kurum: 'Vize Merkezi',               url: 'https://www.vfsglobal.com/turkey' },
  { ulke: '🇪🇸 BLS International',        kurum: 'İspanya Vize Merkezi',       url: 'https://turkey.blsspainvisa.com' },
  { ulke: '🇭🇺 AS Visa',                  kurum: 'Macaristan Vize Merkezi',    url: 'https://hungary.askvisacenters.com' },
  { ulke: '🇨🇭 TLScontact',              kurum: 'İsviçre Vize Merkezi',       url: 'https://tr.tlscontact.com' },
  { ulke: '✈️ IATA Travel Centre',        kurum: 'Seyahat Kuralları',          url: 'https://www.iatatravelcentre.com' },
  { ulke: '📰 T.C. Dışişleri Bakanlığı', kurum: 'Resmi Site',                 url: 'https://www.mfa.gov.tr' },
  { ulke: '🌐 DS-160 Formu',             kurum: 'ABD Vize Başvurusu',         url: 'https://ceac.state.gov' },
  { ulke: '🇨🇦 IRCC',                    kurum: 'Kanada Göçmenlik Portalı',   url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
  { ulke: '🇩🇪 iDATA',                   kurum: 'Almanya & İtalya Vize',      url: 'https://www.idata.com.tr' },
]

function LinkKarti({ items, title, isMobile }: { items: { ulke: string; kurum: string; url: string }[], title: string, isMobile: boolean }) {
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
            <LinkKarti title="🌍 Schengen Dışı Ülkeler" items={diger} isMobile={isMobile} />
            <LinkKarti title="🔧 Araçlar & Portallar" items={araclar} isMobile={isMobile} />
          </div>
        </div>
      </div>
    </div>
  )
}
