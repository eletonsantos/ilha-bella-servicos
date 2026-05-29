import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  status: z.enum([
    'EM_ANALISE_ADMINISTRATIVA',
    'HOMOLOGADO_ATIVO',
    'SUSPENSO',
    'BLOQUEADO',
    'BLOQUEADO_PAGAMENTO',
    'INATIVO',
    'CNPJ_IRREGULAR',
    'DADOS_INCOMPLETOS',
    'CONTRATO_MAE_PENDENTE',
  ]),
  adminNotes: z.string().optional(),
})

interface Params { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { id: params.id },
  })
  if (!profile) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })

  const updated = await prisma.technicianProfile.update({
    where: { id: params.id },
    data: {
      status:     parsed.data.status,
      adminNotes: parsed.data.adminNotes ?? profile.adminNotes,
    },
  })

  return NextResponse.json({ ok: true, status: updated.status })
}
