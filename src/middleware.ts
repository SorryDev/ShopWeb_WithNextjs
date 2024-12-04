import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
// import rateLimit from 'express-rate-limit'
// 
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// })

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Apply rate limiting
  // await new Promise((resolve) => limiter(request, NextResponse.next(), resolve))

  // Allow public routes
  const publicRoutes = ['/', '/login', '/register']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated and trying to access a protected route
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access login/register, redirect to home
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

