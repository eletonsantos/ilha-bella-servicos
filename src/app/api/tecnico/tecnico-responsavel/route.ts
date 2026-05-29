import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  nomeCompleto:    z.string().min(3),
  cpf:             z.string().min(11),
  telefone:        z.string().min(10),
  email:           z.string().email(),
  funcao:          z.string().min(2),
  especialidade:   z.string().min(2),
  cidade:          z.string().min(2),
  uf:              z.string().length(2),
  vinculo:         z.enum(['SOCIO', 'REPRESENTANTE', 'EMPREGADO', 'PARCEIRO', 'PREPOSTO', 'TECNICO_INDICADO']),
  isPrincipal:     z.boolean().default(true),
  isRepLegal:      z.boolean().default(false),
  declaracaoAceita: z.boolean().refine(v => v === true, 'Declaração é obrigatória'),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: { providerTechnicians: { orderBy: { createdAt: 'asc' } } },
  })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  return NextResponse.json(profile.providerTechnicians)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  // Cria o técnico responsável (operação plana, sem transação)
  const tecnico = await prisma.providerTechnician.create({
    data: {
      technicianId: profile.id,
      ...parsed.data,
    },
  })

  // Avança status do perfil para CONTRATO_MAE_PENDENTE (operação plana separada)
  await prisma.technicianProfile.update({
    where: { id: profile.id },
    data:  { status: 'CONTRATO_MAE_PENDENTE' },
  })

  return NextResponse.json({ ok: true, tecnico })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  // Verifica que o técnico pertence a este prestador
  const tecnico = await prisma.providerTechnician.findFirst({
    where: { id, technicianId: profile.id },
  })
  if (!tecnico) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })

  await prisma.providerTechnician.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
