import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth/server'
import { userCanAccessPortal } from '@/lib/auth/roles'
import { AUTH_COOKIE_NAME } from '@/lib/auth/shared'

// Define which routes are protected and which portal they belong to
const PROTECTED_CONFIG: Record<string, { portal: string, loginPath: string }> = {
  '/admin': { portal: 'admin', loginPath: '/auth/login/admin' },
  '/vendedor': { portal: 'vendedor', loginPath: '/auth/login/vendedor' },
  '/entregador': { portal: 'entregador', loginPath: '/auth/login/entregador' },
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Find if the current path is protected
  const protectedRoute = Object.entries(PROTECTED_CONFIG).find(([path]) => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!protectedRoute) {
    return NextResponse.next()
  }

  const [pathPrefix, config] = protectedRoute
  
  // Debug cookies
  const allCookies = request.cookies.getAll().map(c => c.name)
  console.log(`[Middleware] Processing ${pathname}`, { 
    hasSessionCookie: request.cookies.has(AUTH_COOKIE_NAME),
    allCookies 
  })

  // Try to get the session from the request cookies
  const session = await getSessionFromRequest(request)

  // 1. No session -> Redirect to login
  if (!session) {
    const url = new URL(config.loginPath, request.url)
    // Add callback URL to redirect back after login if needed
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Session exists -> Check role permissions
  const roles = session.user.roles || []
  if (!userCanAccessPortal(roles, config.portal)) {
    // If they have a session but NO access to this portal, redirect to their home
    // or to a public home if they are totally unauthorized for this portal.
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/vendedor/:path*',
    '/entregador/:path*',
    // Add other protected paths here if needed (e.g., /profile, /orders)
  ],
}
