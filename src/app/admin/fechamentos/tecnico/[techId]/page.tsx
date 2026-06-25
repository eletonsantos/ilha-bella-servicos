import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileText, ChevronRight, Eye, EyeOff, Plus,
  DollarSign, CheckCircle2, Clock,
} from 'lucide-react'
import {
  CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS,
  PROFILE_STATUS_LABELS, PROFILE_STATUS_COLORS,
} from '@/lib/constants-tecnico'

interface Props { params: { techId: string } }

export default async function AdminFechamentosTecnicoPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: params.techId },
    include: {
      closings: {
        include: { invoice: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!tech) notFound()

  const closings = tech.closings
  const totalValue = closings.reduce((sum, c) => sum + c.totalValue, 0)
  const paidCount = closings.filter(c => c.status === 'PAID').length
  const pendingNf  = closings.filter(c => c.status === 'AWAITING_INVOICE').length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/fechamentos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para fechamentos
      </Link>

      {/* Header */}
      <div className="card-elevated p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0 font-bold text-brand-blue text-xl">
            {tech.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-dark">{tech.fullName}</h1>
            <p className="text-slate-400 text-sm">{tech.city}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
          </span>
          <Link
            href={`/admin/tecnicos/${tech.id}`}
            className="text-xs text-brand-blue hover:underline"
          >
            Ver perfil →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-elevated p-4 text-center">
          <p className="text-2xl font-extrabold text-dark">{closings.length}</p>
          <p className="text-slate-400 text-xs mt-0.5">Total fechamentos</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-xl font-extrabold text-dark">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">Valor acumulado</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-green-600">
            <CheckCircle2 size={16} />
            <p className="text-2xl font-extrabold">{paidCount}</p>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">Pagos</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500">
            <Clock size={16} />
            <p className="text-2xl font-extrabold">{pendingNf}</p>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">Aguardando NF</p>
        </div>
      </div>

      {/* Ação novo fechamento para este técnico */}
      <div className="flex justify-end">
        <Link
          href={`/admin/fechamentos/novo?techId=${tech.id}`}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus size={15} /> Novo Fechamento
        </Link>
      </div>

      {/* Lista de fechamentos */}
      {closings.length > 0 ? (
        <div className="space-y-3">
          {closings.map(closing => (
            <Link
              key={closing.id}
              href={`/admin/fechamentos/${closing.id}`}
              className="card-elevated p-5 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className="flex-1 grid sm:grid-cols-5 gap-3 items-center">
                <div>
                  <p className="font-bold text-dark text-sm">{closing.competence}</p>
                  <p className="text-slate-400 text-xs">
                    {new Date(closing.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Valor</p>
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-slate-400" />
                    <p className="font-bold text-sm">
                      {closing.totalValue.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Serviços</p>
                  <p className="font-semibold text-sm">{closing.serviceCount}</p>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CLOSING_STATUS_COLORS[closing.status]}`}>
                    {CLOSING_STATUS_LABELS[closing.status]}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {closing.invoice ? (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <FileText size={11} /> NF enviada
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Sem NF</span>
                  )}
                  {closing.viewedAt ? (
                    <span className="text-xs text-blue-500 flex items-center gap-1">
                      <Eye size={11} /> Visualizado
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <EyeOff size={11} /> Não aberto
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-elevated p-10 text-center">
          <FileText size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Nenhum fechamento para este técnico.</p>
        </div>
      )}
    </div>
  )
}
