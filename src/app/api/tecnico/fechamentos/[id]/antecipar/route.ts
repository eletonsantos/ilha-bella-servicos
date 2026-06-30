import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  signedName: z.string().min(3, 'Informe o nome completo'),
  signedCnpj: z.string().min(1, 'Informe o CNPJ'),
})

const FEE_PERCENT = 10

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const closing = await prisma.closing.findFirst({
    where: { id: params.id, technicianId: profile.id },
    include: { advance: true },
  })
  if (!closing) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 })

  if (closing.status !== 'PAYMENT_RELEASED') {
    return NextResponse.json({ error: 'Antecipação disponível apenas quando o pagamento estiver liberado' }, { status: 400 })
  }

  // Bloqueia apenas se já houver solicitação PENDENTE ou APROVADA.
  // Se foi RECUSADA, o técnico pode solicitar novamente (reabre a mesma).
  if (closing.advance && closing.advance.status !== 'REJECTED') {
    return NextResponse.json({ error: 'Já existe uma solicitação de antecipação para este fechamento' }, { status: 409 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const feeValue      = parseFloat((closing.totalValue * FEE_PERCENT / 100).toFixed(2))
  const netValue      = parseFloat((closing.totalValue - feeValue).toFixed(2))

  const data = {
    originalValue: closing.totalValue,
    feePercent:    FEE_PERCENT,
    feeValue,
    netValue,
    status:        'PENDING',
    signedAt:      new Date(),
    signedName:    parsed.data.signedName,
    signedCnpj:    parsed.data.signedCnpj,
    adminNotes:    null, // limpa o motivo da recusa anterior
  }

  // Re-solicitação: atualiza a antecipação recusada de volta para PENDENTE.
  // Caso contrário, cria uma nova.
  const advance = closing.advance
    ? await prisma.paymentAdvance.update({
        where: { closingId: closing.id },
        data,
      })
    : await prisma.paymentAdvance.create({
        data: { closingId: closing.id, technicianId: profile.id, ...data },
      })

  return NextResponse.json(advance, { status: 201 })
}
