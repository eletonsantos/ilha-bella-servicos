import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const VALID_STATUSES = ['INITIATED', 'AWAITING_APPROVAL', 'APPROVED', 'LINKED'] as const

const patchSchema = z.object({
  status: z.enum(VALID_STATUSES),
  adminNotes: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: params.id },
  })
  if (!tech) {
    return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
  }

  const updated = await prisma.technicianProfile.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.adminNotes !== undefined && { adminNotes: parsed.data.adminNotes }),
    },
  })

  return NextResponse.json({ success: true, profile: updated })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, name: true } },
      closings: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!tech) {
    return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
  }

  return NextResponse.json(tech)
}
