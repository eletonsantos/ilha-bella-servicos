import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'PAYMENT_RELEASED', 'PAID', 'REJECTED']).optional(),
  adminNotes: z.string().optional(),
  pixKey: z.string().optional(),
  pixKeyType: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const r = await prisma.reimbursement.findUnique({
    where: { id: params.id },
    include: {
      technician: { include: { user: { select: { email: true } } } },
      items: true,
      attachments: true,
    },
  })
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(r)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const r = await prisma.reimbursement.update({
    where: { id: params.id },
    data: parsed.data,
  })
  return NextResponse.json(r)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.reimbursement.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
