import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, CheckCircle, Download, FileText } from 'lucide-react'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS } from '@/lib/constants-tecnico'
import InvoiceUploadForm from '@/components/tecnico/InvoiceUploadForm'

export default async function FechamentoDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) redirect('/tecnico/cadastro')

  const closing = await prisma.closing.findFirst({
    where: { id: params.id, technicianId: profile.id },
    include: { services: true, invoice: true },
  })
  if (!closing) notFound()

  const canSendInvoice = closing.status === 'AWAITING_INVOICE' && !closing.invoice

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tecnico/fechamentos" className="text-slate-400 hover:text-dark transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-dark">Fechamento {closing.competence}</h1>
          <p className="text-slate-500 text-sm">
            {format(closing.periodStart, "dd 'de' MMM", { locale: ptBR })} a {format(closing.periodEnd, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6">
        <div className="grid sm:grid-cols-3 gap-5 mb-5">
          <div>
            <p className="text-xs text-slate-500 mb-1">Valor total</p>
            <p className="text-2xl font-extrabold text-dark">R$ {closing.totalValue.toFixed(2).replace('.', ',')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Atendimentos</p>
            <p className="text-2xl font-extrabold text-dark">{closing.serviceCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mt-1 ${CLOSING_STATUS_COLORS[closing.status]}`}>
              {CLOSING_STATUS_LABELS[closing.status]}
            </span>
          </div>
        </div>
        {closing.observations && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 mb-1">Observações</p>
            <p className="text-sm text-slate-700">{closing.observations}</p>
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
              <p className="text-sm font-medium text-dark truncate">{closing.reportFileName ?? 'Relatório.pdf'}</p>
              <p className="text-xs text-slate-400">Enviado pela Ilha Bella Serviços</p>
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

      {/* Services list */}
      {closing.services.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-dark mb-4">Serviços do período</h2>
          <div className="space-y-2">
            {closing.services.map((service) => (
              <div key={service.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-dark">{service.description}</p>
                  <p className="text-xs text-slate-400">{format(service.serviceDate, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                <p className="font-semibold text-dark text-sm">R$ {service.value.toFixed(2).replace('.', ',')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice section */}
      {closing.invoice ? (
        <div className="card p-6 border-l-4 border-green-400">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={20} className="text-green-500" />
            <h2 className="font-bold text-dark">Nota fiscal enviada</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-500">Número</p><p className="font-semibold">{closing.invoice.invoiceNumber}</p></div>
            <div><p className="text-slate-500">Valor</p><p className="font-semibold">R$ {closing.invoice.value.toFixed(2).replace('.', ',')}</p></div>
            <div><p className="text-slate-500">Arquivo</p><p className="font-semibold">{closing.invoice.fileName}</p></div>
            <div><p className="text-slate-500">Enviado em</p><p className="font-semibold">{format(closing.invoice.sentAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p></div>
          </div>
        </div>
      ) : canSendInvoice ? (
        <InvoiceUploadForm closingId={closing.id} competence={closing.competence} totalValue={closing.totalValue} />
      ) : null}
    </div>
  )
}
