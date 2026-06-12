import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'

const LOCALES = ['tr', 'en', 'de', 'pl'] as const
type Locale = (typeof LOCALES)[number]

async function loadMessages(locale: Locale) {
  switch (locale) {
    case 'en': return (await import('@/messages/en.json')).default
    case 'de': return (await import('@/messages/de.json')).default
    case 'pl': return (await import('@/messages/pl.json')).default
    default:   return (await import('@/messages/tr.json')).default
  }
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined
  const locale: Locale = (cookieLocale && LOCALES.includes(cookieLocale)) ? cookieLocale : 'tr'
  const messages = await loadMessages(locale)

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
