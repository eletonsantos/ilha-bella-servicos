import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight, FileText, Plus, Users, DollarSign, TrendingUp,
} from 'lucide-react'
import { CLOSING_STATUS_COLORS, CLOSING_STATUS_LABELS } from '@/lib/constants-tecnico'

export default async function AdminFechamentosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  // Busca todos os técnicos que têm fechamentos, agrupados com stats
  const technicians = await prisma.technicianProfile.findMany({
    where: { closings: { some: {} } },
    orderBy: { fullName: 'asc' },
    include: {
      closings: {
        orderBy: { createdAt: 'desc' },
        include: { invoice: true },
        take: 1, // só o mais recente para preview
      },
      _count: { select: { closings: true } },
    },
  })

  // Totais gerais
  const [totals] = await prisma.$queryRaw<{ total_value: number; total_count: bigint }[]>`
    SELECT COALESCE(SUM("totalValue"), 0) as total_value, COUNT(*) as total_count FROM "Closing"
  `

  // Técnicos sem fechamento nenhum
  const withoutClosings = await prisma.technicianProfile.count({
    where: { closings: { none: {} } },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Fechamentos</h1>
          <p className="text-slate-500 text-sm mt-1">
            {technicians.length} técnico(s) com fechamentos
          </p>
        </div>
        <Link
          href="/admin/fechamentos/novo"
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
        >
          <Plus size={16} /> Novo Fechamento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
            <FileText size={20} className="text-brand-blue" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{String(totals?.total_count ?? 0)}</p>
            <p className="text-slate-400 text-xs">Total fechamentos</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">
              R$ {Number(totals?.total_value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-slate-400 text-xs">Valor total</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <Users size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{withoutClosings}</p>
            <p className="text-slate-400 text-xs">Sem fechamentos</p>
          </div>
        </div>
      </div>

      {/* Lista de técnicos */}
      {technicians.length > 0 ? (
        <div className="space-y-3">
          {technicians.map(tech => {
            const lastClosing = tech.closings[0]
            return (
              <Link
                key={tech.id}
                href={`/admin/fechamentos/tecnico/${tech.id}`}
                className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0 font-bold text-brand-blue text-base">
                  {tech.fullName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 grid sm:grid-cols-4 gap-3 items-center min-w-0">
                  <div className="min-w-0">
                    <p className="font-bold text-dark text-sm truncate">{tech.fullName}</p>
                    <p className="text-slate-400 text-xs">{tech.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Fechamentos</p>
                    <p className="font-bold text-dark text-lg">{tech._count.closings}</p>
                  </div>
                  {lastClosing && (
                    <>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Último</p>
                        <p className="font-semibold text-sm text-dark">{lastClosing.competence}</p>
                        <p className="text-xs text-slate-400">
                          R$ {lastClosing.totalValue.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CLOSING_STATUS_COLORS[lastClosing.status]}`}>
                          {CLOSING_STATUS_LABELS[lastClosing.status]}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-300 group-hover:text-brand-blue transition-colors flex-shrink-0">
                  <TrendingUp size={14} />
                  <ChevronRight size={16} />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum fechamento criado ainda.</p>
          <Link
            href="/admin/fechamentos/novo"
            className="mt-4 inline-flex items-center gap-2 bg-brand-blue text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-blue-dark transition"
          >
            <Plus size={15} /> Criar primeiro fechamento
          </Link>
        </div>
      )}
    </div>
  )
}
