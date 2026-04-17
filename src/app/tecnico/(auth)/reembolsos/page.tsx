import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Receipt, ChevronRight, Plus } from 'lucide-react'
import { REIMBURSEMENT_STATUS_LABELS, REIMBURSEMENT_STATUS_COLORS } from '@/lib/constants-tecnico'

export default async function TecnicoReembolsosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect('/tecnico/cadastro')

  const reimbursements = await prisma.reimbursement.findMany({
    where: { technicianId: profile.id },
    include: { items: true, _count: { select: { attachments: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Meus reembolsos</h1>
          <p className="text-slate-500 text-sm mt-1">Solicitações de ressarcimento de despesas</p>
        </div>
        <Link
          href="/tecnico/reembolsos/novo"
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Nova solicitação
        </Link>
      </div>

      {reimbursements.length === 0 ? (
        <div className="card p-12 text-center">
          <Receipt size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 mb-2">Nenhuma solicitação de reembolso ainda.</p>
          <p className="text-slate-400 text-sm">Teve despesas com materiais, combustível ou outros? Solicite o reembolso aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reimbursements.map((r) => (
            <Link key={r.id} href={`/tecnico/reembolsos/${r.id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group">
              <div className="flex-1 grid sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Motivo</p>
                  <p className="font-bold text-dark text-sm truncate max-w-[200px]">{r.description}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Valor total</p>
                  <p className="font-bold text-dark">{fmt(r.totalValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Itens</p>
                  <p className="font-semibold text-dark text-sm">{r.items.length} {r.items.length === 1 ? 'item' : 'itens'}</p>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${REIMBURSEMENT_STATUS_COLORS[r.status]}`}>
                    {REIMBURSEMENT_STATUS_LABELS[r.status]}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 flex-shrink-0 group-hover:text-brand-blue transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
