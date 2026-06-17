import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { NextIntlClientProvider } from 'next-intl'
import AdminSidebarWrapper from './AdminSidebarWrapper'
import Topbar from '@/components/Topbar'
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users').select('role').eq('id', user.id).maybeSingle()
  if (!userData || userData.role !== 'admin') redirect('/dashboard')

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined
  const locale: Locale = (cookieLocale && LOCALES.includes(cookieLocale)) ? cookieLocale : 'tr'
  const messages = await loadMessages(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#e4eaf5', fontFamily: 'system-ui', direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
          <AdminSidebarWrapper />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <SessionTimeout />
            <Topbar />
            {children}
          </div>
        </div>
      </SidebarProvider>
    </NextIntlClientProvider>
  )
}
