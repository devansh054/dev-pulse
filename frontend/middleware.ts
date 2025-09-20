import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to auth pages, API routes, and landing page
  if (
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api') || 
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // For dashboard routes, check for authentication cookie
  if (pathname.startsWith('/dashboard')) {
    const githubToken = request.cookies.get('github_token')
    const userData = request.cookies.get('user_data')
    const demoMode = request.cookies.get('demo_mode')
    
    // Check if demo mode is requested via URL parameter
    const isDemoModeRequested = request.nextUrl.searchParams.get('demo') === 'true'

    // Allow access if authenticated OR in demo mode OR demo mode is requested
    if (!githubToken && !userData && !demoMode && !isDemoModeRequested) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
