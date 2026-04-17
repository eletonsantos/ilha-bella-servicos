import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { REIMBURSEMENT_STATUS_LABELS, REIMBURSEMENT_STATUS_COLORS } from '@/lib/constants-tecnico'
import { ChevronRight, Receipt, Plus } from 'lucide-react'

function fmt(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

export default async function AdminReembolsosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const reimbursements = await prisma.reimbursement.findMany({
    include: {
      technician: { select: { fullName: true } },
      items: true,
      _count: { select: { attachments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Reembolsos</h1>
          <p className="text-slate-500 text-sm mt-1">{reimbursements.length} reembolso(s) no sistema</p>
        </div>
        <Link
          href="/admin/reembolsos/novo"
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Novo Reembolso
        </Link>
      </div>

      <div className="space-y-3">
        {reimbursements.map((r) => (
          <Link key={r.id} href={`/admin/reembolsos/${r.id}`}
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group">
            <div className="flex-1 grid sm:grid-cols-5 gap-3 items-center">
              <div>
                <p className="font-bold text-dark text-sm">{r.technician.fullName}</p>
                <p className="text-slate-400 text-xs truncate max-w-[180px]">{r.description}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Valor total</p>
                <p className="font-bold text-sm">{fmt(r.totalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Itens</p>
                <p className="font-semibold text-sm">{r.items.length}</p>
              </div>
              <div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${REIMBURSEMENT_STATUS_COLORS[r.status]}`}>
                  {REIMBURSEMENT_STATUS_LABELS[r.status]}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  {r._count.attachments > 0
                    ? `${r._count.attachments} comprovante(s)`
                    : 'Sem comprovantes'}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
          </Link>
        ))}

        {reimbursements.length === 0 && (
          <div className="card p-10 text-center">
            <Receipt size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Nenhum reembolso criado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
