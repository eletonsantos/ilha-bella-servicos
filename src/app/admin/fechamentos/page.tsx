import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS } from '@/lib/constants-tecnico'
import { ChevronRight, FileText, Plus, Eye, EyeOff } from 'lucide-react'

export default async function AdminFechamentosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const closings = await prisma.closing.findMany({
    include: { technician: { select: { fullName: true } }, invoice: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Fechamentos</h1>
          <p className="text-slate-500 text-sm mt-1">{closings.length} fechamento(s) no sistema</p>
        </div>
        <Link
          href="/admin/fechamentos/novo"
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Novo Fechamento
        </Link>
      </div>

      <div className="space-y-3">
        {closings.map((closing) => (
          <Link key={closing.id} href={`/admin/fechamentos/${closing.id}`}
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <div className="flex-1 grid sm:grid-cols-6 gap-3 items-center">
              <div>
                <p className="font-bold text-dark text-sm">{closing.technician.fullName}</p>
                <p className="text-slate-400 text-xs">{closing.competence}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Valor</p>
                <p className="font-bold">R$ {closing.totalValue.toFixed(2).replace('.', ',')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Serviços</p>
                <p className="font-semibold text-sm">{closing.serviceCount}</p>
              </div>
              <div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CLOSING_STATUS_COLORS[closing.status]}`}>
                  {CLOSING_STATUS_LABELS[closing.status]}
                </span>
              </div>
              <div>
                {closing.invoice ? (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <FileText size={12} /> NF enviada
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Sem NF</span>
                )}
              </div>
              <div>
                {closing.viewedAt ? (
                  <span className="text-xs text-blue-600 flex items-center gap-1">
                    <Eye size={12} /> Visualizado
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <EyeOff size={12} /> Não aberto
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
          </Link>
        ))}

        {closings.length === 0 && (
          <div className="card p-10 text-center">
            <FileText size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Nenhum fechamento criado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
