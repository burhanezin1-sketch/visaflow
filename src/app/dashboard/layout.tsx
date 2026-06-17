import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { NextIntlClientProvider } from 'next-intl'
import Sidebar from '@/components/Sidebar'
import SessionTimeout from '@/components/SessionTimeout'
import { SidebarProvider } from '@/lib/SidebarContext'

const LOCALES = ['tr', 'en', 'de', 'pl', 'ar', 'ru', 'es'] as const
type Locale = (typeof LOCALES)[number]

async function loadMessages(locale: Locale) {
  switch (locale) {
    case 'en': return (await import('@/messages/en.json')).default
    case 'de': return (await import('@/messages/de.json')).default
    case 'pl': return (await import('@/messages/pl.json')).default
    case 'ar': return (await import('@/messages/ar.json')).default
    case 'ru': return (await import('@/messages/ru.json')).default
    case 'es': return (await import('@/messages/es.json')).default
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

  // Kurumsal marka renkleri
  let brandPrimary = '#0e1524'
  let brandSecondary = '#60a5fa'
  try {
    const { data: ud } = await supabase.from('users').select('company_id').eq('id', user.id).maybeSingle()
    if (ud?.company_id) {
      const { data: co } = await supabase
        .from('companies').select('plan, primary_color, secondary_color').eq('id', ud.company_id).maybeSingle()
      if (co?.plan === 'kurumsal') {
        if (co.primary_color)   brandPrimary   = co.primary_color
        if (co.secondary_color) brandSecondary = co.secondary_color
      }
    }
  } catch { /* renk çekme hatası — fallback kullan */ }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        <div style={{
          '--brand-primary':   brandPrimary,
          '--brand-secondary': brandSecondary,
          display: 'flex',
          minHeight: '100vh',
          background: '#e9eef6',
          fontFamily: "'Outfit', 'system-ui', sans-serif",
          direction: locale === 'ar' ? 'rtl' : 'ltr',
        } as React.CSSProperties}>
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
