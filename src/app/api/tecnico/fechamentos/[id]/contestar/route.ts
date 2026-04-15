import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  reason:       z.string().min(10, 'Descreva o motivo com pelo menos 10 caracteres'),
  claimedValue: z.number().positive('O valor informado deve ser positivo'),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const closing = await prisma.closing.findFirst({
    where: { id: params.id, technicianId: profile.id },
    include: { dispute: true },
  })
  if (!closing) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 })

  if (!['CLOSING_AVAILABLE', 'AWAITING_INVOICE'].includes(closing.status)) {
    return NextResponse.json({ error: 'Não é possível contestar neste status' }, { status: 400 })
  }

  if (closing.dispute) {
    return NextResponse.json({ error: 'Já existe uma contestação para este fechamento' }, { status: 409 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const dispute = await prisma.closingDispute.create({
    data: {
      closingId:    closing.id,
      technicianId: profile.id,
      reason:       parsed.data.reason,
      claimedValue: parsed.data.claimedValue,
      status:       'PENDING',
    },
  })

  return NextResponse.json(dispute, { status: 201 })
}
