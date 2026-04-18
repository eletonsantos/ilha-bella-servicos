import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  password:     z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  fullName:     z.string().min(2).optional(),
  phone:        z.string().min(8).optional(),
  email:        z.string().email().optional(),
  city:         z.string().min(2).optional(),
  pixKey:       z.string().min(1).optional(),
  pixKeyType:   z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
  cnpj:         z.string().optional(),
  razaoSocial:  z.string().optional(),
  contractType: z.enum(['PJ_TERCEIRIZADO', 'AUTONOMO', 'CLT']).optional(),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors.password?.[0] ?? 'Dados inválidos' }, { status: 400 })

  const application = await prisma.technicianApplication.findUnique({ where: { id: params.id } })
  if (!application) return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 })
  if (application.status !== 'APPROVED') return NextResponse.json({ error: 'Candidatura não está aprovada' }, { status: 400 })

  const cpf = application.cpfCnpj.replace(/\D/g, '')
  if (cpf.length < 11) return NextResponse.json({ error: 'CPF/CNPJ inválido na candidatura' }, { status: 400 })

  // Verifica se já existe perfil com esse CPF
  const existing = await prisma.technicianProfile.findUnique({ where: { cpf } })
  if (existing) return NextResponse.json({ error: 'Já existe um técnico cadastrado com esse CPF' }, { status: 409 })

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  // Merge form overrides with application defaults
  const d = parsed.data
  const profileFullName    = d.fullName    ?? application.fullName
  const profilePhone       = d.phone       ?? application.whatsapp
  const profileEmail       = d.email       ?? application.email
  const profileCity        = d.city        ?? application.cidade
  const profilePixKey      = d.pixKey      ?? ''
  const profilePixKeyType  = d.pixKeyType  ?? 'CPF'
  const profileContractType = d.contractType ?? 'AUTONOMO'

  // Cria User + TechnicianProfile em transação
  const internalEmail = `${cpf}@tecnico.interno`

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: internalEmail,
          name: profileFullName,
          role: 'TECHNICIAN',
          password: hashedPassword,
        },
      })

      const profile = await tx.technicianProfile.create({
        data: {
          userId:       user.id,
          fullName:     profileFullName,
          cpf,
          phone:        profilePhone,
          email:        profileEmail,
          city:         profileCity,
          pixKey:       profilePixKey,
          pixKeyType:   profilePixKeyType,
          contractType: profileContractType,
          cnpj:         d.cnpj        || undefined,
          razaoSocial:  d.razaoSocial || undefined,
          status: 'APPROVED',
        },
      })

      await tx.technicianApplication.update({
        where: { id: params.id },
        data: { status: 'CONVERTED' },
      })

      return { userId: user.id, profileId: profile.id }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar acesso. CPF pode já estar cadastrado.' }, { status: 500 })
  }
}
