import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ChevronRight, Wrench } from 'lucide-react'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS } from '@/lib/constants-tecnico'
import PageHeader from '@/components/tecnico/PageHeader'
import EmptyState from '@/components/tecnico/EmptyState'

export default async function FechamentosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) redirect('/tecnico/cadastro')

  const closings = await prisma.closing.findMany({
    where: { technicianId: profile.id },
    include: { invoice: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        icon={FileText}
        title="Meus fechamentos"
        subtitle="Histórico completo de competências e pagamentos"
      />

      {closings.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nenhum fechamento disponível ainda."
          description="Seus fechamentos mensais aparecerão aqui assim que forem disponibilizados pela equipe."
        />
      ) : (
        <div className="space-y-3">
          {closings.map((closing, i) => (
            <Link
              key={closing.id}
              href={`/tecnico/fechamentos/${closing.id}`}
              className={`card-elevated p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform group animate-rise delay-${i === 0 ? 75 : i === 1 ? 150 : 200}`}
            >
              <div className="flex-1 grid sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Competência</p>
                  <p className="font-bold text-dark text-sm">{closing.competence}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Valor total</p>
                  <p className="font-bold text-dark">R$ {closing.totalValue.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Atendimentos</p>
                  <p className="font-semibold text-dark text-sm">{closing.serviceCount}</p>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CLOSING_STATUS_COLORS[closing.status]}`}>
                    {CLOSING_STATUS_LABELS[closing.status]}
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
