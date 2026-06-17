import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en', 'de', 'pl', 'ar', 'ru', 'es'],
  defaultLocale: 'tr',
  // Portal için locale prefix, dashboard/admin için henüz aktif değil
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
