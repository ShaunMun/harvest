import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/feed', '/create-listing', '/profile', '/messages']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtected = PROTECTED.some(path => pathname.startsWith(path))
  if (!isProtected) return NextResponse.next()

  // Check for Supabase session cookie (sb-*-auth-token)
  const hasCookie = [...request.cookies.getAll()].some(c =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  if (!hasCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/feed/:path*', '/create-listing/:path*', '/profile/:path*', '/messages/:path*'],
}
