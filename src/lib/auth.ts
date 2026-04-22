import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { timingSafeEqual } from 'crypto'
import { authConfig } from '@/lib/auth.config'

/**
 * Comparação resistente a timing attack.
 * Evita que variações no tempo de resposta revelem informações sobre a senha.
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8')
    const bufB = Buffer.from(b, 'utf8')
    if (bufA.length !== bufB.length) {
      timingSafeEqual(bufA, Buffer.alloc(bufA.length))
      return false
    }
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/** Registra evento de login/logout na tabela LoginAudit (não-crítico) */
async function logAudit(data: {
  userId?:    string
  techName?:  string
  email?:     string
  event:      string
  ip?:        string
  userAgent?: string
}) {
  try {
    await prisma.loginAudit.create({ data })
  } catch {
    // Audit logging é não-crítico — nunca bloqueia o fluxo de autenticação
  }
}

/** Extrai IP do cabeçalho x-forwarded-for ou similar */
function extractIP(req?: Request): string | undefined {
  if (!req) return undefined
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return undefined
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  /* eslint-disable-next-line */
  adapter: PrismaAdapter(prisma) as unknown as import('next-auth').NextAuthConfig['adapter'],
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // allowDangerousEmailAccountLinking REMOVIDO:
      // Previne account takeover via Google OAuth com mesmo e-mail de técnico.
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        login:    { label: 'CPF / E-mail', type: 'text' },
        password: { label: 'Senha',        type: 'password' },
      },
      async authorize(credentials, req) {
        const parsed = z.object({
          login:    z.string().min(3).max(100),
          password: z.string().min(1).max(200),
        }).safeParse(credentials)
        if (!parsed.success) return null

        const { login, password } = parsed.data
        const ip = extractIP(req as unknown as Request)
        const ua = (req as unknown as Request)?.headers?.get?.('user-agent') ?? undefined

        // ── Admin login (resistente a timing attack) ───────────────────────
        const adminEmail    = process.env.ADMIN_EMAIL    ?? ''
        const adminPassword = process.env.ADMIN_PASSWORD ?? ''

        if (login.includes('@')) {
          // Sempre executa ambas as comparações para evitar timing leak
          const emailMatch = safeCompare(login, adminEmail)
          const passMatch  = safeCompare(password, adminPassword)
          if (emailMatch && passMatch && adminEmail && adminPassword) {
            const user = await prisma.user.upsert({
              where:  { email: adminEmail },
              update: { role: 'ADMIN' },
              create: { email: adminEmail, role: 'ADMIN', name: 'Admin' },
            })
            await logAudit({ userId: user.id, email: adminEmail, event: 'login_success', ip, userAgent: ua })
            return user
          }
          await logAudit({ email: login, event: 'login_failure', ip, userAgent: ua })
          return null // Bloqueia qualquer e-mail que não seja o admin
        }

        // ── Técnico login por CPF ──────────────────────────────────────────
        const cpfRaw = login.replace(/\D/g, '')
        if (cpfRaw.length < 11) return null

        // Aceita CPF salvo como dígitos brutos (06954209929) OU formatado
        // (069.542.099-29) — lida com inconsistências históricas no banco
        const cpfFormatted = `${cpfRaw.slice(0,3)}.${cpfRaw.slice(3,6)}.${cpfRaw.slice(6,9)}-${cpfRaw.slice(9)}`
        const profile = await prisma.technicianProfile.findFirst({
          where:   { cpf: { in: [cpfRaw, cpfFormatted] } },
          include: { user: true },
        })
        if (!profile?.user?.password) {
          await logAudit({ event: 'login_failure', ip, userAgent: ua })
          return null
        }

        const valid = await bcrypt.compare(password, profile.user.password)
        if (!valid) {
          await logAudit({
            userId:   profile.user.id,
            techName: profile.user.name ?? undefined,
            email:    profile.user.email ?? undefined,
            event:    'login_failure',
            ip,
            userAgent: ua,
          })
          return null
        }

        await logAudit({
          userId:   profile.user.id,
          techName: profile.user.name ?? undefined,
          email:    profile.user.email ?? undefined,
          event:    'login_success',
          ip,
          userAgent: ua,
        })
        return profile.user
      },
    }),
  ],
  events: {
    async signOut(message) {
      // token está disponível em JWT strategy
      const token = 'token' in message ? message.token : null
      if (token) {
        await logAudit({
          userId: typeof token.sub === 'string' ? token.sub : undefined,
          email:  typeof token.email === 'string' ? token.email : undefined,
          event:  'logout',
        })
      }
    },
  },
})
