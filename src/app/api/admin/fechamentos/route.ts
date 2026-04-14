import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const closings = await prisma.closing.findMany({
    include: {
      technician: { select: { fullName: true, cpf: true } },
      invoice: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(closings)
}
