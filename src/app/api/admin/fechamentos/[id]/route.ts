import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['AWAITING_CLOSING','CLOSING_AVAILABLE','AWAITING_INVOICE','INVOICE_SENT','UNDER_REVIEW','PAYMENT_RELEASED','PAID']).optional(),
  adminNotes:           z.string().optional(),
  competence:           z.string().min(1).optional(),
  periodStart:          z.string().datetime().optional(),
  periodEnd:            z.string().datetime().optional(),
  totalValue:           z.number().positive().optional(),
  serviceCount:         z.number().int().min(0).optional(),
  observations:         z.string().optional(),
  scheduledPaymentDate: z.string().datetime().optional().nullable(),
})

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const closing = await prisma.closing.findUnique({ where: { id: params.id } })
  if (!closing) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 })

  await prisma.closing.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const closing = await prisma.closing.findUnique({
    where: { id: params.id },
    include: { technician: true, services: true, invoice: true },
  })
  if (!closing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(closing)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const closing = await prisma.closing.update({
    where: { id: params.id },
    data: parsed.data,
  })
  return NextResponse.json(closing)
}
