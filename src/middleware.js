import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE = 'shreeji_session'
const PROTECTED = ['/checkout', '/profile']

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret')
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (!needsAuth) return NextResponse.next()

  const token = request.cookies.get(COOKIE)?.value
  if (!token) {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  try {
    await jwtVerify(token, secret())
    return NextResponse.next()
  } catch {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', pathname)
    const res = NextResponse.redirect(login)
    res.cookies.delete(COOKIE)
    return res
  }
}

export const config = {
  matcher: ['/checkout', '/checkout/:path*', '/profile', '/profile/:path*'],
}
