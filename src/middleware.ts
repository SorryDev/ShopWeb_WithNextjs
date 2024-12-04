import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Allow public routes
  const publicRoutes = ['/', '/scripts', '/theme', '/guide', '/discord']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Handle API routes separately
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (!token) {
    // Create a new URL for the sign-in page
    const signInUrl = new URL('/api/auth/signin/discord', request.url)
    
    // Only add callbackUrl if it's not the login page itself
    if (!pathname.includes('/api/auth/signin')) {
      signInUrl.searchParams.set('callbackUrl', pathname)
    }
    
    return NextResponse.redirect(signInUrl)
  }

  // Special handling for admin routes
  if (pathname.startsWith('/admin')) {
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

