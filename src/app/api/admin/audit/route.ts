import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const page     = Math.max(1, Number(searchParams.get('page')  ?? 1))
  const limit    = Math.min(100, Number(searchParams.get('limit') ?? 50))
  const event    = searchParams.get('event')   ?? undefined
  const userId   = searchParams.get('userId')  ?? undefined
  const dateFrom = searchParams.get('from')    ?? undefined
  const dateTo   = searchParams.get('to')      ?? undefined

  const where = {
    ...(event  ? { event } : {}),
    ...(userId ? { userId } : {}),
    ...(dateFrom || dateTo ? {
      createdAt: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo   ? { lte: new Date(dateTo)   } : {}),
      },
    } : {}),
  }

  const [total, logs] = await Promise.all([
    prisma.loginAudit.count({ where }),
    prisma.loginAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) })
}
