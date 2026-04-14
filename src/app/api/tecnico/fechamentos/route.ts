import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const closings = await prisma.closing.findMany({
    where: { technicianId: profile.id },
    include: { invoice: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(closings)
}
