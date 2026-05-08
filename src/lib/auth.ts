import NextAuth from 'next-auth'
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
  // SEM PrismaAdapter — o adapter usa transações internas que o Neon HTTP mode
  // não suporta. Toda persistência de usuário é feita manualmente abaixo.
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
            // Busca admin no banco (sem upsert para evitar transação implícita)
            let user = await prisma.user.findUnique({ where: { email: adminEmail } })
            if (!user) {
              user = await prisma.user.create({
                data: { email: adminEmail, role: 'ADMIN', name: 'Admin' },
              })
            } else if (user.role !== 'ADMIN') {
              user = await prisma.user.update({
                where: { id: user.id },
                data:  { role: 'ADMIN' },
              })
            }
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
  callbacks: {
    ...authConfig.callbacks,

    /**
     * signIn callback — gerencia usuários Google OAuth manualmente.
     * Cada operação é um INSERT/SELECT independente (sem transações)
     * para compatibilidade com o Neon HTTP mode.
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // 1. Verifica se conta Google já está vinculada
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider:          account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            include: { user: true },
          })

          if (existingAccount) {
            // Conta já existe — injeta id e role do banco no objeto user
            user.id   = existingAccount.user.id
            ;(user as { role?: string }).role = existingAccount.user.role
            return true
          }

          // 2. Conta não existe — busca ou cria usuário pelo e-mail
          let dbUser = user.email
            ? await prisma.user.findUnique({ where: { email: user.email } })
            : null

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
                name:  user.name  ?? null,
                image: user.image ?? null,
              },
            })
          }

          // 3. Vincula a conta Google ao usuário (operação independente)
          await prisma.account.create({
            data: {
              userId:            dbUser.id,
              type:              account.type,
              provider:          account.provider,
              providerAccountId: account.providerAccountId,
              access_token:      account.access_token  ?? null,
              refresh_token:     account.refresh_token ?? null,
              expires_at:        account.expires_at    ?? null,
              token_type:        account.token_type    ?? null,
              scope:             account.scope         ?? null,
              id_token:          account.id_token      ?? null,
            },
          })

          // Injeta id e role no objeto user para o JWT callback
          user.id   = dbUser.id
          ;(user as { role?: string }).role = dbUser.role
          return true
        } catch (err) {
          console.error('[signIn:google]', err)
          return false
        }
      }
      // Credentials: authorize() já validou tudo
      return true
    },
  },
  events: {
    async signOut(message) {
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
