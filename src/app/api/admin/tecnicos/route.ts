import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const technicians = await prisma.technicianProfile.findMany({
    include: { user: { select: { email: true, image: true } }, _count: { select: { closings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(technicians)
}
