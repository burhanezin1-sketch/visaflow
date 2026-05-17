import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Rate limiting (in-memory, Edge-uyumlu) ─────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RL_WINDOW = 5 * 60 * 1000 // 5 dakika
const RL_MAX = 10
const RATE_LIMITED_PATHS = ['/login', '/superadmin/login']

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RL_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RL_MAX
}

const RATE_LIMIT_HTML = `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Çok Fazla Deneme</title>
<style>*{box-sizing:border-box}body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f7}
.box{background:white;border-radius:16px;padding:2.5rem 2rem;max-width:380px;width:90%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
h2{margin:0 0 12px;color:#c0392b;font-size:20px;font-weight:600}
p{color:#5a6a7a;margin:0;font-size:14px;line-height:1.6}</style>
</head>
<body><div class="box">
<div style="font-size:40px;margin-bottom:16px">⛔</div>
<h2>Çok Fazla Deneme</h2>
<p>5 dakika içinde çok fazla istek gönderildi.<br>Lütfen birkaç dakika bekleyip tekrar deneyin.</p>
</div></body></html>`

// ── Public path helpers ─────────────────────────────────────────
const PUBLIC_PATHS = ['/login', '/superadmin/login']
const PUBLIC_PREFIXES = ['/portal/', '/api/', '/_next/']
const PUBLIC_EXT = /\.(svg|png|jpg|jpeg|gif|webp|ico)$/

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return true
  if (pathname === '/favicon.ico') return true
  if (PUBLIC_EXT.test(pathname)) return true
  return false
}

// Service role client — cookie'siz, sadece DB sorguları için
function makeAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limiting: login sayfalarına IP bazlı sınırlama
  if (RATE_LIMITED_PATHS.includes(pathname)) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    if (isRateLimited(ip)) {
      return new NextResponse(RATE_LIMIT_HTML, {
        status: 429,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '300' },
      })
    }
  }

  if (isPublic(pathname)) return NextResponse.next()

  let response = NextResponse.next({ request })

  // ── 1. Auth kontrolü ───────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // ağ hatasında unauthenticated say
  }

  if (!user) {
    const target = request.nextUrl.clone()
    target.pathname = pathname.startsWith('/superadmin') ? '/superadmin/login' : '/login'
    return NextResponse.redirect(target)
  }

  // ── 2. /superadmin rol kontrolü ────────────────────────────────
  if (pathname.startsWith('/superadmin')) {
    try {
      const admin = makeAdminClient()
      const { data: sa } = await admin
        .from('superadmins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      if (!sa) {
        const target = request.nextUrl.clone()
        target.pathname = '/superadmin/login'
        return NextResponse.redirect(target)
      }
    } catch {
      const target = request.nextUrl.clone()
      target.pathname = '/superadmin/login'
      return NextResponse.redirect(target)
    }
  }

  // ── 3. /admin rol kontrolü ─────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    try {
      const admin = makeAdminClient()
      const { data: userData } = await admin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      if (!userData || userData.role !== 'admin') {
        const target = request.nextUrl.clone()
        target.pathname = '/dashboard'
        return NextResponse.redirect(target)
      }
    } catch {
      const target = request.nextUrl.clone()
      target.pathname = '/dashboard'
      return NextResponse.redirect(target)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
