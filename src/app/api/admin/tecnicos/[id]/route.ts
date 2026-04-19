import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const VALID_STATUSES = ['INITIATED', 'AWAITING_APPROVAL', 'APPROVED', 'LINKED'] as const

// Schema para edição completa do cadastro pelo admin
const patchSchema = z.object({
  // Status / notas
  status:       z.enum(VALID_STATUSES).optional(),
  adminNotes:   z.string().optional(),
  // Dados pessoais
  fullName:     z.string().min(3).optional(),
  cpf:          z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  phone:        z.string().min(10).optional(),
  email:        z.string().email().optional(),
  city:         z.string().min(2).optional(),
  pixKey:       z.string().min(1).optional(),
  pixKeyType:   z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
  iaAssistLogin: z.string().optional(),
  cnpj:         z.string().optional(),
  razaoSocial:  z.string().optional(),
  contractType: z.enum(['PJ_TERCEIRIZADO', 'AUTONOMO', 'CLT']).optional(),
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
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const tech = await prisma.technicianProfile.findUnique({ where: { id: params.id } })
  if (!tech) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })

  const { cpf, ...rest } = parsed.data

  // Se CPF foi alterado, atualiza também o e-mail interno do User
  if (cpf && cpf !== tech.cpf) {
    const newInternalEmail = `${cpf.replace(/\D/g, '')}@tecnico.interno`
    await prisma.technicianProfile.update({ where: { id: params.id }, data: { cpf, ...rest } })
    await prisma.user.update({ where: { id: tech.userId }, data: { email: newInternalEmail } })
  } else {
    await prisma.technicianProfile.update({ where: { id: params.id }, data: rest })
  }

  const updated = await prisma.technicianProfile.findUnique({ where: { id: params.id } })
  return NextResponse.json({ success: true, profile: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const tech = await prisma.technicianProfile.findUnique({ where: { id: params.id } })
  if (!tech) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })

  // Delete the user — cascades to TechnicianProfile, Closings, Invoices via onDelete: Cascade
  await prisma.user.delete({ where: { id: tech.userId } })

  return NextResponse.json({ success: true })
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

  if (!tech) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
  return NextResponse.json(tech)
}
