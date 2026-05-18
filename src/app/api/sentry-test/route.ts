import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const err = new Error('Sentry test hatası — entegrasyon çalışıyor')
  Sentry.captureException(err)
  await Sentry.flush(2000)
  return NextResponse.json({ ok: true, message: 'Hata Sentry\'ye gönderildi' })
}
