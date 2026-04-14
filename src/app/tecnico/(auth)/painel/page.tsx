import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, DollarSign, ChevronRight, Clock } from 'lucide-react'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS, PROFILE_STATUS_LABELS, PROFILE_STATUS_COLORS } from '@/lib/constants-tecnico'

export default async function PainelPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      closings: {
        include: { invoice: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!profile) redirect('/tecnico/cadastro')

  const lastClosing = profile.closings[0]
  const firstName = profile.fullName.split(' ')[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-slate-500 text-sm">Bem-vindo de volta,</p>
        <h1 className="text-2xl font-extrabold text-dark">{firstName}</h1>
      </div>

      {/* Status do cadastro */}
      <div className="card p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status do cadastro</p>
          <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${PROFILE_STATUS_COLORS[profile.status]}`}>
            {PROFILE_STATUS_LABELS[profile.status]}
          </span>
        </div>
        {profile.status === 'AWAITING_APPROVAL' && (
          <p className="text-slate-500 text-sm max-w-xs text-right">
            Seu cadastro está em análise. Em breve você será liberado para receber fechamentos.
          </p>
        )}
      </div>

      {/* Último fechamento */}
      {lastClosing ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark">Último fechamento</h2>
            <Link href="/tecnico/fechamentos" className="text-brand-blue text-sm font-medium hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-slate-400" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Competência</p>
              </div>
              <p className="font-bold text-dark">{lastClosing.competence}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-slate-400" />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Valor previsto</p>
              </div>
              <p className="font-bold text-dark text-lg">
                R$ {lastClosing.totalValue.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">Status</p>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${CLOSING_STATUS_COLORS[lastClosing.status]}`}>
                {CLOSING_STATUS_LABELS[lastClosing.status]}
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/tecnico/fechamentos/${lastClosing.id}`}
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white
                         font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              <FileText size={15} />
              Ver detalhe
            </Link>
            {lastClosing.status === 'AWAITING_INVOICE' && !lastClosing.invoice && (
              <Link
                href={`/tecnico/fechamentos/${lastClosing.id}`}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white
                           font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                Enviar NF
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center">
          <FileText size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum fechamento disponível ainda.</p>
          <p className="text-slate-400 text-sm mt-1">Seus fechamentos aparecerão aqui quando disponibilizados.</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/tecnico/fechamentos" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue/20 transition-colors">
            <FileText size={20} className="text-brand-blue" />
          </div>
          <div>
            <p className="font-bold text-dark text-sm">Meus fechamentos</p>
            <p className="text-slate-500 text-xs">Histórico completo</p>
          </div>
          <ChevronRight size={16} className="text-slate-300 ml-auto" />
        </Link>
        <Link href="/tecnico/fechamentos" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
            <DollarSign size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-dark text-sm">Enviar nota fiscal</p>
            <p className="text-slate-500 text-xs">Upload rápido e seguro</p>
          </div>
          <ChevronRight size={16} className="text-slate-300 ml-auto" />
        </Link>
      </div>
    </div>
  )
}
