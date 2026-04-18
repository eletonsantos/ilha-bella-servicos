import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, CalendarClock, Eye, EyeOff, Shield } from 'lucide-react'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS } from '@/lib/constants-tecnico'
import ClosingStatusActions from './ClosingStatusActions'
import EditarFechamentoWrapper from './EditarFechamentoWrapper'
import DisputaActions from './DisputaActions'
import AntecipacaoActions from './AntecipacaoActions'
import DeleteFechamentoButton from './DeleteFechamentoButton'

interface Props { params: { id: string } }

export default async function AdminFechamentoDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const closing = await prisma.closing.findUnique({
    where: { id: params.id },
    include: {
      technician: { include: { user: { select: { email: true } } } },
      invoice:    true,
      dispute:    { include: { technician: { select: { fullName: true } } } },
      advance:    true,
    },
  })

  if (!closing) notFound()

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`
  const fmtDate = (d: Date | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  const fields = [
    { label: 'Período',        value: `${fmtDate(closing.periodStart)} a ${fmtDate(closing.periodEnd)}` },
    { label: 'Valor total',    value: fmt(closing.totalValue) },
    { label: 'Qtd. serviços',  value: String(closing.serviceCount) },
    { label: 'Criado em',      value: fmtDate(closing.createdAt) },
    ...(closing.observations
      ? [{ label: 'Observações', value: closing.observations }]
      : []),
    ...(closing.scheduledPaymentDate
      ? [{ label: 'Pagamento programado', value: fmtDate(closing.scheduledPaymentDate) }]
      : []),
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/fechamentos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors">
        <ArrowLeft size={16} /> Voltar para fechamentos
      </Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-dark">{closing.technician.fullName}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{closing.technician.user.email}</p>
          <p className="text-slate-500 text-sm mt-1">Competência: <span className="font-semibold text-dark">{closing.competence}</span></p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${CLOSING_STATUS_COLORS[closing.status]}`}>
            {CLOSING_STATUS_LABELS[closing.status]}
          </span>
          {closing.scheduledPaymentDate && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
              <CalendarClock size={12} />
              Pagamento: {fmtDate(closing.scheduledPaymentDate)}
            </span>
          )}
          {closing.viewedAt ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full font-medium">
              <Eye size={12} />
              Visualizado em {fmtDate(closing.viewedAt)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
              <EyeOff size={12} />
              Não visualizado
            </span>
          )}
        </div>
      </div>

      {/* Dados do fechamento — editável */}
      <div className="card p-6">
        <EditarFechamentoWrapper
          closing={{
            id:                   closing.id,
            competence:           closing.competence,
            periodStart:          closing.periodStart,
            periodEnd:            closing.periodEnd,
            totalValue:           closing.totalValue,
            serviceCount:         closing.serviceCount,
            observations:         closing.observations,
            scheduledPaymentDate: closing.scheduledPaymentDate,
          }}
          fields={fields}
        />
      </div>

      {/* Contestação (se existir) */}
      {closing.dispute && (
        <DisputaActions
          closingId={closing.id}
          totalValue={closing.totalValue}
          dispute={{
            id:           closing.dispute.id,
            status:       closing.dispute.status,
            reason:       closing.dispute.reason,
            claimedValue: closing.dispute.claimedValue,
            adminNotes:   closing.dispute.adminNotes,
            createdAt:    closing.dispute.createdAt,
            technician:   { fullName: closing.dispute.technician.fullName },
          }}
        />
      )}

      {/* Antecipação (se existir) */}
      {closing.advance && (
        <AntecipacaoActions
          closingId={closing.id}
          advance={{
            id:            closing.advance.id,
            status:        closing.advance.status,
            originalValue: closing.advance.originalValue,
            feePercent:    closing.advance.feePercent,
            feeValue:      closing.advance.feeValue,
            netValue:      closing.advance.netValue,
            signedName:    closing.advance.signedName,
            signedCnpj:    closing.advance.signedCnpj,
            signedAt:      closing.advance.signedAt,
            adminNotes:    closing.advance.adminNotes,
          }}
        />
      )}

      {/* Relatório PDF */}
      {closing.reportFilePath && (
        <div className="card p-6">
          <h2 className="font-bold text-dark mb-3">Relatório de Serviços</h2>
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <FileText size={20} className="text-brand-blue flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark truncate">{closing.reportFileName}</p>
              {closing.reportFileSize && (
                <p className="text-xs text-slate-400">{(closing.reportFileSize / 1024).toFixed(0)} KB</p>
              )}
            </div>
            <a
              href={closing.reportFilePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={13} /> Baixar PDF
            </a>
          </div>
        </div>
      )}

      {/* Nota Fiscal do Técnico */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-3">Nota Fiscal do Técnico</h2>
        {closing.invoice ? (
          <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
            <FileText size={20} className="text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark truncate">{closing.invoice.fileName}</p>
              <p className="text-xs text-slate-500">NF {closing.invoice.invoiceNumber} · Enviada em {fmtDate(closing.invoice.sentAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              {closing.invoice?.contractSignedAt && (
                <Link
                  href={`/admin/fechamentos/${closing.id}/contrato`}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Shield size={13} /> Ver contrato
                </Link>
              )}
              <a
                href={`/api/tecnico/fechamentos/${closing.id}/invoice/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download size={13} /> Baixar NF
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">O técnico ainda não enviou a nota fiscal.</p>
        )}
      </div>

      {/* Ações de status */}
      <ClosingStatusActions closingId={closing.id} currentStatus={closing.status} />

      {/* Excluir fechamento */}
      <DeleteFechamentoButton
        closingId={closing.id}
        competence={closing.competence}
        techName={closing.technician.fullName}
      />
    </div>
  )
}
