import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS } from '@/lib/constants-tecnico'
import ClosingStatusActions from './ClosingStatusActions'

interface Props { params: { id: string } }

export default async function AdminFechamentoDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const closing = await prisma.closing.findUnique({
    where: { id: params.id },
    include: {
      technician: { include: { user: { select: { email: true } } } },
      invoice: true,
    },
  })

  if (!closing) notFound()

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`
  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('pt-BR')

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
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${CLOSING_STATUS_COLORS[closing.status]}`}>
          {CLOSING_STATUS_LABELS[closing.status]}
        </span>
      </div>

      {/* Dados do fechamento */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-4">Dados do fechamento</h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Período</dt>
            <dd className="text-sm font-medium text-dark">{fmtDate(closing.periodStart)} a {fmtDate(closing.periodEnd)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor total</dt>
            <dd className="text-lg font-extrabold text-dark">{fmt(closing.totalValue)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Qtd. serviços</dt>
            <dd className="text-sm font-medium text-dark">{closing.serviceCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Criado em</dt>
            <dd className="text-sm font-medium text-dark">{fmtDate(closing.createdAt)}</dd>
          </div>
        </dl>
        {closing.observations && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Observações</p>
            <p className="text-sm text-slate-700 whitespace-pre-line">{closing.observations}</p>
          </div>
        )}
      </div>

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
            <a
              href={`/api/tecnico/fechamentos/${closing.id}/invoice/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={13} /> Baixar NF
            </a>
          </div>
        ) : (
          <p className="text-sm text-slate-400">O técnico ainda não enviou a nota fiscal.</p>
        )}
      </div>

      {/* Ações de status */}
      <ClosingStatusActions closingId={closing.id} currentStatus={closing.status} />
    </div>
  )
}
