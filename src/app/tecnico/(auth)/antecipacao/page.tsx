import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Zap } from 'lucide-react'
import AntecipacaoCard from './AntecipacaoCard'

export default async function AntecipacaoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) redirect('/tecnico/cadastro')

  // Todos os fechamentos com pagamento liberado
  const closings = await prisma.closing.findMany({
    where: {
      technicianId: profile.id,
      status: 'PAYMENT_RELEASED',
    },
    include: {
      advance: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Também busca antecipações já enviadas de fechamentos que foram pagos
  const advancesHistory = await prisma.paymentAdvance.findMany({
    where: { technicianId: profile.id },
    include: {
      closing: { select: { id: true, competence: true, totalValue: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  // Antecipações de fechamentos que não estão mais em PAYMENT_RELEASED (já pagos, etc.)
  const historico = advancesHistory.filter(
    a => a.closing.status !== 'PAYMENT_RELEASED'
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-dark">Antecipação de pagamento</h1>
        <p className="text-slate-500 text-sm mt-1">
          Receba agora com desconto de 10% — pagamento em até 48h após aprovação.
        </p>
      </div>

      {/* Como funciona */}
      <div className="card p-5 bg-emerald-50 border border-emerald-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={16} className="text-emerald-600" />
          </div>
          <div className="text-sm text-emerald-800 space-y-1">
            <p className="font-semibold">Como funciona?</p>
            <p>Quando seu pagamento está <strong>liberado</strong>, você pode solicitar a antecipação.
              Aplicamos uma taxa de <strong>10%</strong> sobre o valor total e transferimos o restante
              para sua chave Pix cadastrada em até <strong>48 horas</strong> após aprovação.</p>
          </div>
        </div>
      </div>

      {/* Fechamentos disponíveis para antecipação */}
      {closings.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-bold text-dark text-sm uppercase tracking-wide text-slate-400">
            Disponíveis para antecipar
          </h2>
          {closings.map(closing => (
            <AntecipacaoCard
              key={closing.id}
              closing={{
                id:         closing.id,
                competence: closing.competence,
                totalValue: closing.totalValue,
              }}
              techName={profile.fullName}
              techCnpj={profile.cnpj}
              advance={closing.advance ? {
                status:     closing.advance.status,
                netValue:   closing.advance.netValue,
                feeValue:   closing.advance.feeValue,
                adminNotes: closing.advance.adminNotes,
              } : null}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Zap size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhum fechamento disponível para antecipação.</p>
          <p className="text-slate-400 text-sm mt-1">
            A antecipação fica disponível quando o admin liberar o pagamento do seu fechamento.
          </p>
        </div>
      )}

      {/* Histórico de antecipações anteriores */}
      {historico.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold text-dark text-sm uppercase tracking-wide text-slate-400">
            Histórico
          </h2>
          {historico.map(adv => {
            const cfg = adv.status === 'APPROVED'
              ? 'text-emerald-700 bg-emerald-50'
              : adv.status === 'REJECTED'
                ? 'text-red-600 bg-red-50'
                : 'text-amber-600 bg-amber-50'
            const label = adv.status === 'APPROVED' ? 'Aprovada'
              : adv.status === 'REJECTED' ? 'Recusada' : 'Aguardando'
            return (
              <div key={adv.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-dark text-sm">{adv.closing.competence}</p>
                  <p className="text-xs text-slate-400">
                    Bruto {`R$ ${adv.originalValue.toFixed(2).replace('.', ',')}`}
                    {' · '}
                    Líquido{' '}
                    <span className="font-semibold text-emerald-700">
                      {`R$ ${adv.netValue.toFixed(2).replace('.', ',')}`}
                    </span>
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
