import { NextResponse } from 'next/server'

/** Auth is Bearer-token + client-side redirects (Express API). */
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
