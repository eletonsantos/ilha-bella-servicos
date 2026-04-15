import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  status:     z.enum(['APPROVED', 'REJECTED']),
  adminNotes: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const dispute = await prisma.closingDispute.findUnique({
    where: { closingId: params.id },
  })
  if (!dispute) return NextResponse.json({ error: 'Contestação não encontrada' }, { status: 404 })

  const updated = await prisma.closingDispute.update({
    where: { closingId: params.id },
    data: {
      status:     parsed.data.status,
      adminNotes: parsed.data.adminNotes,
    },
  })

  return NextResponse.json(updated)
}
