import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vectropus',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}