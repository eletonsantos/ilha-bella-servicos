import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
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
        login: { label: 'CPF', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          login: z.string().min(3),
          password: z.string().min(1),
        }).safeParse(credentials)
        if (!parsed.success) return null

        const { login, password } = parsed.data

        // Admin login — detecta pelo @
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        if (login.includes('@') && adminEmail && adminPassword &&
            login === adminEmail && password === adminPassword) {
          const user = await prisma.user.upsert({
            where: { email: adminEmail },
            update: { role: 'ADMIN' },
            create: { email: adminEmail, role: 'ADMIN', name: 'Admin' },
          })
          return user
        }

        // Técnico login por CPF (somente números)
        const cpf = login.replace(/\D/g, '')
        if (cpf.length >= 11) {
          const profile = await prisma.technicianProfile.findUnique({
            where: { cpf },
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
  callbacks: {
    async signIn({ user }) {
      // Garante role ADMIN para o e-mail admin no banco
      if (user.email === process.env.ADMIN_EMAIL) {
        user.role = 'ADMIN'
      }
      return true
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // Salva email no token no primeiro login
        if (user.email) token.email = user.email
      }
      // Pega email do profile OAuth se disponível
      if (!token.email && profile?.email) {
        token.email = profile.email as string
      }
      // Garante papel ADMIN pelo e-mail (cobre todos os casos)
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail && token.email === adminEmail) {
        token.role = 'ADMIN'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      return baseUrl + '/tecnico/painel' // painel verifica role e redireciona admin para /admin
    },
  },
  pages: {
    signIn: '/tecnico/login',
    error: '/tecnico/login',
  },
  session: { strategy: 'jwt' },
})
