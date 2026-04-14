import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS } from '@/lib/constants-tecnico'

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
      <div>
        <h1 className="text-2xl font-extrabold text-dark">Meus fechamentos</h1>
        <p className="text-slate-500 text-sm mt-1">Histórico completo de competências e pagamentos</p>
      </div>

      {closings.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum fechamento disponível ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {closings.map((closing) => (
            <Link
              key={closing.id}
              href={`/tecnico/fechamentos/${closing.id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="flex-1 grid sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Competência</p>
                  <p className="font-bold text-dark text-sm">{closing.competence}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Valor total</p>
                  <p className="font-bold text-dark">R$ {closing.totalValue.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Atendimentos</p>
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
