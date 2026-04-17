import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Receipt } from 'lucide-react'
import {
  REIMBURSEMENT_STATUS_LABELS,
  REIMBURSEMENT_STATUS_COLORS,
  REIMBURSEMENT_CATEGORY_LABELS,
  REIMBURSEMENT_CATEGORY_COLORS,
  PIX_KEY_TYPE_LABELS,
} from '@/lib/constants-tecnico'
import ReembolsoStatusActions from './ReembolsoStatusActions'
import ReembolsoUpload from './ReembolsoUpload'

interface Props { params: { id: string } }

function fmt(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

export default async function AdminReembolsoDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const r = await prisma.reimbursement.findUnique({
    where: { id: params.id },
    include: {
      technician: { include: { user: { select: { email: true } } } },
      items: { orderBy: { createdAt: 'asc' } },
      attachments: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!r) notFound()

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/reembolsos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors">
        <ArrowLeft size={16} /> Voltar para reembolsos
      </Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-dark flex items-center gap-2">
            <Receipt size={18} className="text-brand-blue" /> {r.technician.fullName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{r.description}</p>
          <p className="text-slate-400 text-xs mt-0.5">Criado em {fmtDate(r.createdAt)}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${REIMBURSEMENT_STATUS_COLORS[r.status]}`}>
          {REIMBURSEMENT_STATUS_LABELS[r.status]}
        </span>
      </div>

      {/* Itens */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-4">Itens de reembolso</h2>
        <div className="space-y-2">
          {r.items.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${REIMBURSEMENT_CATEGORY_COLORS[item.category]}`}>
                  {REIMBURSEMENT_CATEGORY_LABELS[item.category]}
                </span>
                <span className="text-sm text-dark">{item.description}</span>
              </div>
              <span className="font-bold text-sm text-dark">{fmt(item.value)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-3 mt-1 border-t border-slate-200">
          <p className="text-sm font-extrabold text-dark">
            Total: <span className="text-brand-blue">{fmt(r.totalValue)}</span>
          </p>
        </div>
      </div>

      {/* PIX */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-3">PIX para pagamento</h2>
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-0.5">Tipo</p>
            <p className="text-sm font-semibold text-dark">{PIX_KEY_TYPE_LABELS[r.pixKeyType] ?? r.pixKeyType}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-0.5">Chave</p>
            <p className="text-sm font-semibold text-dark">{r.pixKey}</p>
          </div>
        </div>
      </div>

      {/* Comprovantes */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-dark">Comprovantes</h2>
        {r.attachments.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum comprovante anexado ainda.</p>
        ) : (
          <div className="space-y-2">
            {r.attachments.map(att => (
              <div key={att.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <FileText size={18} className="text-brand-blue flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">{att.fileName}</p>
                  <p className="text-xs text-slate-400">{(att.fileSize / 1024).toFixed(0)} KB</p>
                </div>
                <a
                  href={att.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download size={13} /> Ver
                </a>
              </div>
            ))}
          </div>
        )}
        <ReembolsoUpload reimbursementId={r.id} />
      </div>

      {/* Notas admin */}
      {r.adminNotes && (
        <div className="card p-6 border-l-4 border-brand-blue">
          <h2 className="font-bold text-dark mb-2">Notas internas</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{r.adminNotes}</p>
        </div>
      )}

      {/* Ações */}
      <ReembolsoStatusActions reimbursementId={r.id} currentStatus={r.status} />
    </div>
  )
}
