import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protect /tecnico/* (except the portal landing and login pages)
  if (
    pathname.startsWith('/tecnico') &&
    pathname !== '/tecnico' &&
    !pathname.startsWith('/tecnico/login')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/tecnico/login', req.url))
    }
  }

  // Protect /admin/*
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/tecnico/login', req.url))
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/tecnico/painel', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/tecnico/:path*', '/admin/:path*'],
}
