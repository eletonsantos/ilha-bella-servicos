import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

// Middleware edge-safe: usa authConfig sem Prisma (apenas verifica JWT)
const { auth } = NextAuth(authConfig)

const RATE_LIMITED: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/signin':          { limit: 10, windowMs: 60_000 },  // 10 tentativas/min
  '/api/candidatura':          { limit: 5,  windowMs: 60_000 },  // 5 cadastros/min por IP
  '/api/chat':                 { limit: 30, windowMs: 60_000 },  // 30 msgs/min no chat
  '/api/tecnico/alterar-senha':{ limit: 5,  windowMs: 60_000 },  // 5 tentativas/min
}

function getIP(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const ip = getIP(req)

  // ── Rate limiting ───────────────────────────────────────────────────────────
  for (const [path, cfg] of Object.entries(RATE_LIMITED)) {
    if (pathname.startsWith(path)) {
      const result = rateLimit(`${path}:${ip}`, cfg.limit, cfg.windowMs)
      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(result.retryAfter),
              'X-RateLimit-Limit': String(cfg.limit),
              'X-RateLimit-Remaining': '0',
            },
          }
        )
      }
      break
    }
  }

  // ── Proteção de /tecnico/* (exceto landing e login) ────────────────────────
  if (
    pathname.startsWith('/tecnico') &&
    pathname !== '/tecnico' &&
    !pathname.startsWith('/tecnico/login')
  ) {
    if (!session) {
      const url = new URL('/tecnico/login', req.url)
      url.searchParams.set('callbackUrl', encodeURIComponent(pathname))
      return NextResponse.redirect(url)
    }
  }

  // ── Proteção de /admin/* ──────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/tecnico/login', req.url))
    }
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/tecnico/painel', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/tecnico/:path*',
    '/admin/:path*',
    '/api/auth/signin',
    '/api/candidatura',
    '/api/chat',
    '/api/tecnico/alterar-senha',
  ],
}
