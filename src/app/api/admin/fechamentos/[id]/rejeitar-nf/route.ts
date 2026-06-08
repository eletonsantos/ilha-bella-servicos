import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClosingEvent } from '@/lib/closing-events'

const schema = z.object({
  reason: z.string().min(5, 'Informe o motivo da rejeição (mínimo 5 caracteres)'),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const closing = await prisma.closing.findUnique({
    where:   { id: params.id },
    include: { invoice: true },
  })

  if (!closing) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 })

  if (!closing.invoice) {
    return NextResponse.json({ error: 'Este fechamento não possui Nota Fiscal para rejeitar' }, { status: 400 })
  }

  if (!['INVOICE_SENT', 'UNDER_REVIEW'].includes(closing.status)) {
    return NextResponse.json({ error: 'Só é possível rejeitar NF nos status "NF enviada" ou "Em conferência"' }, { status: 400 })
  }

  const prevStatus = closing.status
  const invoiceNumber = closing.invoice.invoiceNumber

  // 1. Deleta a Invoice (e o contrato assinado junto — tudo na mesma linha)
  await prisma.invoice.delete({ where: { id: closing.invoice.id } })

  // 2. Volta o status para AWAITING_INVOICE
  await prisma.closing.update({
    where: { id: params.id },
    data:  { status: 'AWAITING_INVOICE' },
  })

  // 3. Registra evento no histórico (dispara e-mail invoice_rejected automaticamente)
  await createClosingEvent({
    closingId:        params.id,
    eventType:        'INVOICE_REJECTED',
    statusFrom:       prevStatus,
    statusTo:         'AWAITING_INVOICE',
    description:      `NF nº ${invoiceNumber} rejeitada. Contrato de prestação de serviços cancelado. Motivo: ${parsed.data.reason}`,
    adminNote:        parsed.data.reason,
    rejectionReason:  parsed.data.reason,
    createdBy:        'admin',
  }).catch(err => console.error('[event] Failed to create INVOICE_REJECTED event:', err))

  return NextResponse.json({ success: true })
}
