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
    .from('users').select('role, company_id').eq('id', user.id).maybeSingle()
  if (!userData || userData.role !== 'admin') redirect('/dashboard')

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined
  const locale: Locale = (cookieLocale && LOCALES.includes(cookieLocale)) ? cookieLocale : 'tr'
  const messages = await loadMessages(locale)

  let sidebarBg   = '#0e1524'
  let sidebarText = 'rgba(255,255,255,0.92)'
  let buttonBg    = '#1a3a5c'
  let buttonText  = '#ffffff'
  let panelBg     = '#e4eaf5'
  try {
    if (userData.company_id) {
      const { data: co } = await supabase
        .from('companies')
        .select('plan, sidebar_bg_color, sidebar_text_color, button_color, button_text_color, panel_bg_color')
        .eq('id', userData.company_id).maybeSingle()
      if (co?.plan === 'kurumsal') {
        if (co.sidebar_bg_color)   sidebarBg   = co.sidebar_bg_color
        if (co.sidebar_text_color) sidebarText = co.sidebar_text_color
        if (co.button_color)       buttonBg    = co.button_color
        if (co.button_text_color)  buttonText  = co.button_text_color
        if (co.panel_bg_color)     panelBg     = co.panel_bg_color
      }
    }
  } catch { /* fallback */ }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider>
        <div style={{
          '--sidebar-bg':   sidebarBg,
          '--sidebar-text': sidebarText,
          '--button-bg':    buttonBg,
          '--button-text':  buttonText,
          '--panel-bg':     panelBg,
          display: 'flex', minHeight: '100vh',
          background: panelBg,
          fontFamily: 'system-ui',
          direction: locale === 'ar' ? 'rtl' : 'ltr',
        } as React.CSSProperties}>
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
