import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const patchSchema = z.object({
  status:     z.enum(['PENDING', 'EM_ANALISE', 'APPROVED', 'REJECTED']).optional(),
  adminNotes: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const app = await prisma.technicianApplication.findUnique({ where: { id: params.id } })
  if (!app) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(app)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const app = await prisma.technicianApplication.update({
    where: { id: params.id },
    data: parsed.data,
  })
  return NextResponse.json(app)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.technicianApplication.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
