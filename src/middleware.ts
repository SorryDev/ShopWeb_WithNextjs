import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Allow public routes and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/' ||
    pathname === '/scripts' ||
    pathname === '/theme' ||
    pathname === '/guide' ||
    pathname === '/discord'
  ) {
    return NextResponse.next()
  }

  // Check authentication
  if (!token) {
    // Direct to Discord OAuth
    return NextResponse.redirect(new URL('/api/auth/signin/discord', request.url))
  }

  // Handle admin routes
  if (pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}

