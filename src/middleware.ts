import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  // Supabase OAuth (PKCE): if `redirect_to` is not allow-listed, Auth falls back to Site URL,
  // often the site root — `/?code=…` never reaches `/auth/callback` and the session is not exchanged.
  if (
    url.pathname === '/' &&
    (url.searchParams.has('code') || url.searchParams.has('error'))
  ) {
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // Not logged in and trying to access a protected route (dashboard) → redirect to login
  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Already logged in and visiting /login → redirect to dashboard
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/auth/:path*'],
}
