import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/lib/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  /* eslint-disable-next-line */
  adapter: PrismaAdapter(prisma) as unknown as import('next-auth').NextAuthConfig['adapter'],
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        login:    { label: 'CPF',   type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          login:    z.string().min(3),
          password: z.string().min(1),
        }).safeParse(credentials)
        if (!parsed.success) return null

        const { login, password } = parsed.data

        // Admin login — detecta pelo @
        const adminEmail    = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        if (login.includes('@') && adminEmail && adminPassword &&
            login === adminEmail && password === adminPassword) {
          const user = await prisma.user.upsert({
            where:  { email: adminEmail },
            update: { role: 'ADMIN' },
            create: { email: adminEmail, role: 'ADMIN', name: 'Admin' },
          })
          return user
        }

        // Técnico login por CPF (somente números)
        const cpf = login.replace(/\D/g, '')
        if (cpf.length >= 11) {
          const profile = await prisma.technicianProfile.findUnique({
            where:   { cpf },
            include: { user: true },
          })
          if (!profile || !profile.user?.password) return null
          const valid = await bcrypt.compare(password, profile.user.password)
          if (!valid) return null
          return profile.user
        }

        return null
      },
    }),
  ],
})
