import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('Sentry test hatası — bu görünüyorsa entegrasyon çalışıyor')
  return NextResponse.json({ ok: true })
}
