import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const technicians = await prisma.technicianProfile.findMany({
    include: { user: { select: { email: true, image: true } }, _count: { select: { closings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(technicians)
}

const createSchema = z.object({
  fullName:      z.string().min(2, 'Nome obrigatório'),
  cpf:           z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (use 000.000.000-00)'),
  phone:         z.string().min(8, 'Telefone obrigatório'),
  email:         z.string().email('E-mail inválido'),
  city:          z.string().min(2, 'Cidade obrigatória'),
  pixKey:        z.string().min(1, 'Chave Pix obrigatória'),
  pixKeyType:    z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']),
  contractType:  z.enum(['AUTONOMO', 'PJ_TERCEIRIZADO', 'CLT']).default('AUTONOMO'),
  cnpj:          z.string().optional(),
  razaoSocial:   z.string().optional(),
  iaAssistLogin: z.string().optional(),
  password:      z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? 'Dados inválidos'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const d = parsed.data
  const cpfRaw = d.cpf.replace(/\D/g, '')

  const existing = await prisma.technicianProfile.findUnique({ where: { cpf: cpfRaw } })
  if (existing) return NextResponse.json({ error: 'Já existe um técnico com esse CPF' }, { status: 409 })

  const hashedPassword = await bcrypt.hash(d.password, 12)
  const internalEmail  = `${cpfRaw}@tecnico.interno`

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: internalEmail, name: d.fullName, role: 'TECHNICIAN', password: hashedPassword },
      })

      const profile = await tx.technicianProfile.create({
        data: {
          userId:        user.id,
          fullName:      d.fullName,
          cpf:           cpfRaw,
          phone:         d.phone,
          email:         d.email,
          city:          d.city,
          pixKey:        d.pixKey,
          pixKeyType:    d.pixKeyType,
          contractType:  d.contractType,
          cnpj:          d.cnpj          || undefined,
          razaoSocial:   d.razaoSocial   || undefined,
          iaAssistLogin: d.iaAssistLogin || undefined,
          status:        'APPROVED',
        },
      })

      return { profileId: profile.id }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar técnico.' }, { status: 500 })
  }
}
