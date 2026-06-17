import type { Metadata } from 'next'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Vectropus',
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'tr'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}