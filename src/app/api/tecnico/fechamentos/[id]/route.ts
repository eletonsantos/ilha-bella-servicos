import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const closing = await prisma.closing.findFirst({
    where: { id: params.id, technicianId: profile.id },
    include: { services: true, invoice: true },
  })

  if (!closing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(closing)
}
