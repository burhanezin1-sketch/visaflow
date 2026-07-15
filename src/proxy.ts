import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Rate limiting (in-memory, Edge-uyumlu) ─────────────────────
interface RLEntry { count: number; resetAt: number }
const rateLimitStore = new Map<string, RLEntry>()
const RL_WINDOW = 5 * 60 * 1000 // 5 dakika

// Farklı limitler farklı path grupları için
const RL_RULES: Array<{ prefix: string; max: number }> = [
  { prefix: '/login',              max: 10 },
  { prefix: '/superadmin/login',   max: 10 },
  { prefix: '/api/portal-data',    max: 60 },   // token brute-force koruması
  { prefix: '/api/portal-upload',  max: 20 },
  { prefix: '/api/portal-elden',   max: 30 },
  { prefix: '/api/niyet-mektubu',  max: 15 },   // Anthropic maliyet koruması
  { prefix: '/api/send-whatsapp',  max: 20 },   // Twilio maliyet koruması
  { prefix: '/api/webhook/',       max: 200 },  // n8n webhook
]

function checkRateLimit(ip: string, pathname: string): boolean {
  const rule = RL_RULES.find(r => pathname.startsWith(r.prefix))
  if (!rule) return false

  const key = `${ip}:${rule.prefix}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RL_WINDOW })
    return false
  }
  entry.count++
  return entry.count > rule.max
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
const PUBLIC_EXACT = new Set(['/login', '/superadmin/login', '/reset-password'])
const PUBLIC_PREFIXES = ['/portal/', '/api/', '/_next/']
const PUBLIC_EXT = /\.(svg|png|jpg|jpeg|gif|webp|ico)$/

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
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

// UUID format check (v4)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathLower = pathname.toLowerCase()

  // ── Per-request nonce + CSP ────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://irwxcj6j.rcsrv.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')

  // x-nonce → server components can read it via headers()
  const reqHeaders = new Headers(request.headers)
  reqHeaders.set('x-nonce', nonce)
  reqHeaders.set('Content-Security-Policy', csp)

  // ── Rate limiting (tüm path grupları) ─────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  if (checkRateLimit(ip, pathname)) {
    const rl = new NextResponse(RATE_LIMIT_HTML, {
      status: 429,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '300' },
    })
    rl.headers.set('Content-Security-Policy', csp)
    return rl
  }

  if (isPublic(pathname)) {
    const pub = NextResponse.next({ request: { headers: reqHeaders } })
    pub.headers.set('Content-Security-Policy', csp)
    return pub
  }

  let response = NextResponse.next({ request: { headers: reqHeaders } })
  response.headers.set('Content-Security-Policy', csp)

  // ── 1. Auth kontrolü ───────────────────────────────────────────
  // pendingCookies: Supabase'in token yenileme veya silme sırasında
  // set etmek istediği cookie'leri toplar. Redirect durumunda da
  // uygulanması gerekir; aksi hâlde süresi dolmuş cookie tarayıcıda
  // kalır ve sonraki isteğe tekrar eklenir.
  const pendingCookies: Array<{ name: string; value: string; options: any }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: reqHeaders } })
          response.headers.set('Content-Security-Policy', csp)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Redirect oluştururken bekleyen cookie değişikliklerini de uygula
  function makeRedirect(targetPathname: string) {
    const target = request.nextUrl.clone()
    target.pathname = targetPathname
    const res = NextResponse.redirect(target)
    pendingCookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
    return res
  }

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase'e ulaşılamazsa güvenli taraf: login'e yönlendir
  }

  if (!user) {
    return makeRedirect(pathname.startsWith('/superadmin') ? '/superadmin/login' : '/login')
  }

  // ── 2. Rol bazlı panel izolasyonu ──────────────────────────────
  // Paralel: superadmin kontrolü + firma kullanıcısı kontrolü
  const adminClient = makeAdminClient()
  const [{ data: saRow }, { data: userRow }] = await Promise.all([
    adminClient.from('superadmins').select('id').eq('id', user.id).maybeSingle(),
    adminClient.from('users').select('role, company_id').eq('id', user.id).maybeSingle(),
  ])

  const isSuperAdmin = !!saRow
  const isFirmaUser  = !!userRow

  // Superadmin → dashboard veya admin paneline erişemez
  if (isSuperAdmin && (pathLower.startsWith('/dashboard') || pathLower.startsWith('/admin'))) {
    return makeRedirect('/superadmin/dashboard')
  }

  // Superadmin gerektiren path → superadmin değilse login
  if (pathLower.startsWith('/superadmin')) {
    if (!isSuperAdmin) return makeRedirect('/superadmin/login')
  }

  // Firma kullanıcısı → superadmin paneline erişemez
  if (isFirmaUser && pathLower.startsWith('/superadmin')) {
    return makeRedirect('/login')
  }

  // Firma kullanıcısı değil VE superadmin de değil → login
  if (!isSuperAdmin && !isFirmaUser) {
    return makeRedirect('/login')
  }

  // ── 3. /admin rol kontrolü ─────────────────────────────────────
  if (pathLower.startsWith('/admin')) {
    if (!userRow || userRow.role !== 'admin') return makeRedirect('/dashboard')
  }

  // ── 4. IDOR: /dashboard/musteriler/[id] ───────────────────────
  // Bir kullanıcının başka firmanın müşterisine ID yazarak erişimini engeller
  const musteriMatch = pathname.match(/^\/dashboard\/musteriler\/([^/]+)$/)
  if (musteriMatch) {
    const clientId = musteriMatch[1]
    if (UUID_RE.test(clientId)) {
      try {
        const admin = makeAdminClient()
        const [{ data: userData }, { data: clientData }] = await Promise.all([
          admin.from('users').select('company_id').eq('id', user.id).maybeSingle(),
          admin.from('clients').select('company_id').eq('id', clientId).maybeSingle(),
        ])
        if (
          !userData?.company_id ||
          !clientData?.company_id ||
          userData.company_id !== clientData.company_id
        ) {
          return makeRedirect('/dashboard/musteriler')
        }
      } catch {
        return makeRedirect('/dashboard/musteriler')
      }
    }
  }

  // Korumalı sayfalara Cache-Control: no-store ekle.
  // Bu olmadan tarayıcı bfcache/önbelleği logout sonrası eski sayfa HTML'ini
  // gösterebilir ve kullanıcı "Geri" tuşuyla kimliği doğrulanmış içeriğe erişebilir.
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Surrogate-Control', 'no-store')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
