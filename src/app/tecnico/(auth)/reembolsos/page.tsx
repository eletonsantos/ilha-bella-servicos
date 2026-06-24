import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Receipt, ChevronRight, Plus } from 'lucide-react'
import { REIMBURSEMENT_STATUS_LABELS, REIMBURSEMENT_STATUS_COLORS } from '@/lib/constants-tecnico'
import PageHeader from '@/components/tecnico/PageHeader'
import EmptyState from '@/components/tecnico/EmptyState'

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
      <PageHeader
        icon={Receipt}
        title="Meus reembolsos"
        subtitle="Solicitações de ressarcimento de despesas"
        action={
          <Link
            href="/tecnico/reembolsos/novo"
            className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-brand-blue/25 hover:shadow-lg transition-all"
          >
            <Plus size={16} /> Nova solicitação
          </Link>
        }
      />

      {reimbursements.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma solicitação de reembolso ainda."
          description="Teve despesas com materiais, combustível ou outros? Solicite o reembolso aqui."
        >
          <Link
            href="/tecnico/reembolsos/novo"
            className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-brand-blue/25 transition-all"
          >
            <Plus size={16} /> Nova solicitação
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {reimbursements.map((r, i) => (
            <Link key={r.id} href={`/tecnico/reembolsos/${r.id}`}
              className={`card-elevated p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform group animate-rise delay-${i === 0 ? 75 : i === 1 ? 150 : 200}`}>
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
