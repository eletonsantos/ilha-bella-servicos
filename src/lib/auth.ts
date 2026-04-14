import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const { handlers, signIn, signOut, auth } = NextAuth({
  /* eslint-disable-next-line */
  adapter: PrismaAdapter(prisma) as unknown as import('next-auth').NextAuthConfig['adapter'],
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }).safeParse(credentials)
        if (!parsed.success) return null
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null
        return user
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      // Pega o email do user ou do profile OAuth
      const email = user.email ?? (profile?.email as string | undefined)
      if (email && email === process.env.ADMIN_EMAIL) {
        try {
          await prisma.user.upsert({
            where: { email },
            update: { role: 'ADMIN' },
            create: {
              email,
              name: user.name ?? '',
              image: user.image ?? null,
              role: 'ADMIN',
            },
          })
        } catch {
          // ignora erro se o upsert falhar, o jwt callback cobre
        }
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
      return baseUrl + '/tecnico/painel'
    },
  },
  pages: {
    signIn: '/tecnico/login',
    error: '/tecnico/login',
  },
  session: { strategy: 'jwt' },
})
