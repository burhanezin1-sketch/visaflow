import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      lock: undefined,
    },
  }
)

if (typeof window !== 'undefined') {
  // Supabase auth state değişikliklerini dinle
  supabase.auth.onAuthStateChange((event) => {
    const path = window.location.pathname
    const isAuthPage =
      path.startsWith('/login') ||
      path.startsWith('/superadmin/login') ||
      path.startsWith('/portal/')

    if (event === 'SIGNED_OUT' && !isAuthPage) {
      window.location.href = '/login'
    }
  })

  // Her 10 dakikada bir session geçerliliğini kontrol et
  setInterval(async () => {
    const path = window.location.pathname
    const isAuthPage =
      path.startsWith('/login') ||
      path.startsWith('/superadmin/login') ||
      path.startsWith('/portal/')
    if (isAuthPage) return

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
  }, 10 * 60 * 1000)
}
