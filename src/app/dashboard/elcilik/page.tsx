'use client'

import Topbar from '@/components/Topbar'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTranslations } from 'next-intl'

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
  { ulke: '🇭🇺 Macaristan',  kurum: 'AS Visa',        url: 'https://www.as-visa.com' },
  { ulke: '🇨🇭 İsviçre',     kurum: 'TLScontact',     url: 'https://www.tlscontact.com/en/start-your-visa-journey/' },
  { ulke: '🇵🇹 Portekiz',    kurum: 'AS Visa Solutions', url: 'https://www.as-visa.com' },
  { ulke: '🇨🇿 Çekya',       kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/cze' },
  { ulke: '🇩🇰 Danimarka',   kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/dnk' },
  { ulke: '🇸🇪 İsveç',       kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/swe' },
  { ulke: '🇫🇮 Finlandiya',  kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/fin' },
  { ulke: '🇳🇴 Norveç',      kurum: 'AS Visa Solutions', url: 'https://www.as-visa.com' },
  { ulke: '🇲🇹 Malta',       kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/mlt' },
  { ulke: '🇸🇰 Slovakya',    kurum: 'VFS Global',     url: 'https://visa.vfsglobal.com/tur/tr/svk' },
  { ulke: '🇸🇮 Slovenya',    kurum: 'VFS Global / AS Visa Solutions', url: 'https://visa.vfsglobal.com/tur/tr/svn', url2: 'https://www.as-visa.com' },
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
  { ulke: '🇭🇺 AS Visa',                  kurum: 'Macaristan Vize Merkezi',    url: 'https://www.as-visa.com' },
  { ulke: '🇨🇭 TLScontact',              kurum: 'İsviçre Vize Merkezi',       url: 'https://www.tlscontact.com/en/start-your-visa-journey/' },
  { ulke: '✈️ IATA Travel Centre',        kurum: 'Seyahat Kuralları',          url: 'https://www.iatatravelcentre.com' },
  { ulke: '📰 T.C. Dışişleri Bakanlığı', kurum: 'Resmi Site',                 url: 'https://www.mfa.gov.tr' },
  { ulke: '🌐 DS-160 Formu',             kurum: 'ABD Vize Başvurusu',         url: 'https://ceac.state.gov' },
  { ulke: '🇨🇦 IRCC',                    kurum: 'Kanada Göçmenlik Portalı',   url: 'https://www.canada.ca/en/immigration-refugees-citizenship.html' },
  { ulke: '🇩🇪 iDATA',                   kurum: 'Almanya & İtalya Vize',      url: 'https://www.idata.com.tr' },
]

type LinkItem = { ulke: string; kurum: string; url: string; url2?: string }

function LinkKarti({ items, title, isMobile, openBtn, vfsBtn, asBtn }: {
  items: LinkItem[]; title: string; isMobile: boolean;
  openBtn: string; vfsBtn: string; asBtn: string
}) {
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
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => window.open(item.url, '_blank')}
              style={{ padding: isMobile ? '5px 10px' : '6px 14px', fontSize: '12px', fontWeight: '500', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {item.url2 ? vfsBtn : openBtn}
            </button>
            {item.url2 && (
              <button
                onClick={() => window.open(item.url2, '_blank')}
                style={{ padding: isMobile ? '5px 10px' : '6px 14px', fontSize: '12px', fontWeight: '500', background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                {asBtn}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ElcilikPage() {
  const isMobile = useIsMobile()
  const t = useTranslations('elcilik')
  const ts = useTranslations('sidebar')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Topbar title={ts('embassyLinks')} />
      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>
        <div style={{ fontSize: '12px', color: '#5a6a7a', marginBottom: isMobile ? '0.75rem' : '1.25rem' }}>
          {t('pageDesc')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0' : '1.25rem' }}>
          <div>
            <LinkKarti title={t('schengen')} items={schengen} isMobile={isMobile} openBtn={t('openBtn')} vfsBtn={t('vfsBtn')} asBtn={t('asBtn')} />
          </div>
          <div>
            <LinkKarti title={t('nonSchengen')} items={diger} isMobile={isMobile} openBtn={t('openBtn')} vfsBtn={t('vfsBtn')} asBtn={t('asBtn')} />
            <LinkKarti title={t('tools')} items={araclar} isMobile={isMobile} openBtn={t('openBtn')} vfsBtn={t('vfsBtn')} asBtn={t('asBtn')} />
          </div>
        </div>
      </div>
    </div>
  )
}
