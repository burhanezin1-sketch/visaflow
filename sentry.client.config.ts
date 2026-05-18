import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://045d552b590734e428b3406526f1217d@o4511411092324352.ingest.de.sentry.io/4511411106611280',

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  debug: false,
})
