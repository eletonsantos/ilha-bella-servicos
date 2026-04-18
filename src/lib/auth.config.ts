import type { NextAuthConfig } from 'next-auth'

/**
 * Configuração edge-safe do NextAuth — sem imports do Prisma.
 * Usada pelo middleware (Edge Runtime) para verificar o JWT.
 * A config completa (com PrismaAdapter e providers) está em auth.ts.
 */
export const authConfig: NextAuthConfig = {
  providers: [],   // providers completos ficam em auth.ts
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: string }).role
        if (user.email) token.email = user.email
      }
      if (!token.email && profile?.email) {
        token.email = profile.email as string
      }
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail && token.email === adminEmail) {
        token.role = 'ADMIN'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id as string
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
    error:  '/tecnico/login',
  },
  session: { strategy: 'jwt' },
}
