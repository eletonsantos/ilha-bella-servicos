import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

// Middleware edge-safe: usa authConfig sem Prisma (apenas verifica JWT)
const { auth } = NextAuth(authConfig)

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
