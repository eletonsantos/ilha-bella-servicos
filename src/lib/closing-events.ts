import { prisma } from '@/lib/prisma'
import { sendClosingEmail, type ClosingEmailTemplate } from '@/lib/email'
import { CLOSING_STATUS_LABELS } from '@/lib/constants-tecnico'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type ClosingEventType =
  | 'CLOSING_CREATED'
  | 'STATUS_CHANGED'
  | 'INVOICE_SUBMITTED'
  | 'NOTE_ADDED'

// Eventos que disparam e-mail para o prestador
const EMAIL_EVENTS: Partial<Record<string, ClosingEmailTemplate>> = {
  CLOSING_CREATED:  'closing_created',
  UNDER_REVIEW:     'under_review',
  PAYMENT_RELEASED: 'payment_released',
  PAID:             'paid',
  AWAITING_INVOICE: 'awaiting_invoice',
}

interface CreateEventInput {
  closingId:   string
  eventType:   ClosingEventType
  statusFrom?: string
  statusTo?:   string
  description?: string
  adminNote?:  string
  createdBy?:  string
}

/**
 * Registra um evento no histórico do fechamento.
 * Se o novo status tiver template de e-mail, dispara automaticamente.
 */
export async function createClosingEvent(input: CreateEventInput) {
  const event = await prisma.closingEvent.create({
    data: {
      closingId:   input.closingId,
      eventType:   input.eventType,
      statusFrom:  input.statusFrom ?? null,
      statusTo:    input.statusTo ?? null,
      description: input.description ?? null,
      adminNote:   input.adminNote ?? null,
      createdBy:   input.createdBy ?? 'system',
    },
  })

  // Descobre qual template usar
  const templateKey = input.eventType === 'CLOSING_CREATED'
    ? 'CLOSING_CREATED'
    : input.statusTo

  const template = templateKey ? EMAIL_EVENTS[templateKey] : undefined

  if (template) {
    await dispatchClosingEmail({
      closingId: input.closingId,
      eventId:   event.id,
      template,
    })
  }

  return event
}

// ─── Disparo de e-mail ──────────────────────────────────────────────────────

interface DispatchEmailInput {
  closingId: string
  eventId:   string
  template:  ClosingEmailTemplate
}

async function dispatchClosingEmail({ closingId, eventId, template }: DispatchEmailInput) {
  const closing = await prisma.closing.findUnique({
    where: { id: closingId },
    include: {
      technician: { include: { user: { select: { email: true } } } },
      invoice: true,
    },
  })
  if (!closing) return

  const recipient = closing.technician.email || closing.technician.user.email
  if (!recipient) return

  // Verifica duplicidade: não envia o mesmo template para o mesmo fechamento se já foi enviado com sucesso
  const alreadySent = await prisma.emailLog.findFirst({
    where: { closingId, template, status: 'SENT' },
  })
  if (alreadySent) return

  const fmtCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  const fmtDate = (d: Date | null | undefined) =>
    d ? format(new Date(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : null

  const data = {
    technicianName:      closing.technician.fullName,
    competence:          closing.competence,
    periodStart:         fmtDate(closing.periodStart),
    periodEnd:           fmtDate(closing.periodEnd),
    totalValue:          fmtCurrency(closing.totalValue),
    statusLabel:         CLOSING_STATUS_LABELS[closing.status] ?? closing.status,
    observations:        closing.observations ?? null,
    scheduledPaymentDate: fmtDate(closing.scheduledPaymentDate),
    invoiceNumber:       closing.invoice?.invoiceNumber ?? null,
    invoiceValue:        closing.invoice ? fmtCurrency(closing.invoice.value) : null,
    closingId,
  }

  const subjects: Record<ClosingEmailTemplate, string> = {
    closing_created:  `📋 Fechamento disponível — ${data.competence}`,
    awaiting_invoice: `📄 Aguardando sua Nota Fiscal — ${data.competence}`,
    under_review:     `🔍 Sua NF está em análise — ${data.competence}`,
    payment_released: `💰 Pagamento liberado — ${data.competence}`,
    paid:             `✅ Pagamento realizado — ${data.competence}`,
  }

  // Cria log com status PENDING
  const log = await prisma.emailLog.create({
    data: {
      closingId,
      eventId,
      recipient,
      subject:  subjects[template],
      template,
      status:   'PENDING',
    },
  })

  try {
    await sendClosingEmail({ template, to: recipient, data })
    await prisma.emailLog.update({
      where: { id: log.id },
      data:  { status: 'SENT', sentAt: new Date() },
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    await prisma.emailLog.update({
      where: { id: log.id },
      data:  { status: 'FAILED', error: errorMsg },
    })
    console.error(`[email] Failed to send "${template}" for closing ${closingId}:`, err)
  }
}

