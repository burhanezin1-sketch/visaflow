import { NextResponse } from 'next/server'

// IP-based fixed-window rate limiter (in-memory, per process instance)
const store = new Map<string, { count: number; reset: number }>()

// Purge expired entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.reset) store.delete(key)
  }
}, 300_000)

function allow(ip: string, route: string, max: number, windowMs: number): boolean {
  const key = `${route}:${ip}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

/**
 * Call at the top of an API route handler.
 * Returns a 429 NextResponse if the IP has exceeded the limit, otherwise null.
 *
 * @param req    - The incoming request (Request or NextRequest)
 * @param route  - A stable identifier for the route (e.g. 'niyet-mektubu')
 * @param max    - Maximum requests allowed per window
 * @param windowMs - Window size in milliseconds (default: 60 000 = 1 minute)
 */
export function rateLimit(
  req: Request,
  route: string,
  max: number,
  windowMs = 60_000
): NextResponse | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (!allow(ip, route, max, windowMs)) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen bekleyin.' },
      { status: 429 }
    )
  }
  return null
}
