import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { NextIntlClientProvider } from 'next-intl'
import Sidebar from '@/components/Sidebar'
import SessionTimeout from '@/components/SessionTimeout'
import { SidebarProvider } from '@/lib/SidebarContext'

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined
  const locale: Locale = (cookieLocale && LOCALES.includes(cookieLocale)) ? cookieLocale : 'tr'
  const messages = await loadMessages(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          background: '#e9eef6',
          fontFamily: "'Outfit', 'system-ui', sans-serif",
        }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <SessionTimeout />
            {children}
          </div>
        </div>
      </SidebarProvider>
    </NextIntlClientProvider>
  )
}
