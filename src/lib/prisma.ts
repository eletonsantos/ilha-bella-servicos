import ws from 'ws'
import { Pool, neonConfig, types } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

// Node.js não tem WebSocket nativo — usa a lib `ws` instalada
neonConfig.webSocketConstructor = ws

// Retorna timestamps como strings brutas para o Prisma converter corretamente
// (evita que o pg-types converta para Date objects antes do Prisma processar)
types.setTypeParser(1082, (v: string) => v)   // date
types.setTypeParser(1114, (v: string) => v)   // timestamp
types.setTypeParser(1184, (v: string) => v)   // timestamptz
types.setTypeParser(1700, (v: string) => v)   // numeric/decimal

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool    = new Pool({ connectionString: process.env.DATABASE_URL! })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
