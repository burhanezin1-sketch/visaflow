import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { routing, type Locale } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Önce URL'deki locale'e bak, yoksa cookie'ye, yoksa varsayılan
  let locale = await requestLocale as Locale | undefined

  if (!locale || !routing.locales.includes(locale)) {
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined
    locale = cookieLocale && routing.locales.includes(cookieLocale)
      ? cookieLocale
      : routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
