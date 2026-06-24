import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, DollarSign, ChevronRight, Clock, TableProperties, Receipt, Wallet, CheckCircle2, ArrowUpRight, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  CLOSING_STATUS_LABELS,
  CLOSING_STATUS_COLORS,
  PROFILE_STATUS_LABELS,
} from '@/lib/constants-tecnico'

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export default async function PainelPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      closings: {
        include: { invoice: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (session.user.role === 'ADMIN') redirect('/admin')
  if (!profile) redirect('/tecnico/cadastro')

  const closings    = profile.closings
  const lastClosing = closings[0]
  const firstName   = profile.fullName.split(' ')[0]
  const hasTabela   = !!profile.tabelaValoresPath

  // Estatísticas rápidas
  const totalRecebido   = closings.filter(c => c.status === 'PAID').reduce((s, c) => s + c.totalValue, 0)
  const totalFechamentos = closings.length
  const aguardandoNf    = closings.filter(c => ['CLOSING_AVAILABLE', 'AWAITING_INVOICE'].includes(c.status) && !c.invoice).length

  const stats = [
    { label: 'Total recebido', value: fmt(totalRecebido), icon: Wallet,       accent: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Fechamentos',    value: String(totalFechamentos), icon: FileText, accent: 'text-brand-blue',  bg: 'bg-brand-blue/10' },
    { label: 'Aguardando NF',  value: String(aguardandoNf), icon: Clock,        accent: 'text-amber-600',   bg: 'bg-amber-50' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Hero ── */}
      <div className="hero-portal rounded-3xl p-6 sm:p-8 animate-rise">
        <div className="relative z-10 flex items-center gap-4">
          <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur text-white text-lg sm:text-xl font-extrabold flex items-center justify-center flex-shrink-0">
            {initials(profile.fullName)}
          </span>
          <div className="min-w-0">
            <p className="text-white/70 text-sm">Bem-vindo de volta,</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">{firstName}</h1>
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white">
              <CheckCircle2 size={12} />
              {PROFILE_STATUS_LABELS[profile.status] ?? profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`card-elevated p-4 sm:p-5 animate-rise delay-${(i + 1) * 75 <= 200 ? (i + 1) * 75 : 200}`}>
              <div className={`icon-pill w-9 h-9 ${s.bg} ${s.accent} mb-3`}>
                <Icon size={17} />
              </div>
              <p className="text-lg sm:text-2xl font-extrabold text-dark tracking-tight leading-none">{s.value}</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* ── Último fechamento ── */}
      {lastClosing ? (
        <div className="card-elevated p-6 animate-rise delay-150">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full gradient-brand" />
              Último fechamento
            </h2>
            <Link
              href="/tecnico/fechamentos"
              className="text-brand-blue text-sm font-semibold hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={13} className="text-slate-400" />
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Competência</p>
              </div>
              <p className="font-bold text-dark">{lastClosing.competence}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={13} className="text-slate-400" />
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Valor previsto</p>
              </div>
              <p className="font-bold text-dark text-lg">{fmt(lastClosing.totalValue)}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Status</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CLOSING_STATUS_COLORS[lastClosing.status]}`}>
                {CLOSING_STATUS_LABELS[lastClosing.status]}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/tecnico/fechamentos/${lastClosing.id}`}
              className="inline-flex items-center gap-2 gradient-brand text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-brand-blue/25 hover:shadow-lg hover:shadow-brand-blue/30 transition-all"
            >
              <FileText size={15} />
              Ver detalhe
            </Link>
            {['CLOSING_AVAILABLE', 'AWAITING_INVOICE'].includes(lastClosing.status) && !lastClosing.invoice && (
              <Link
                href={`/tecnico/fechamentos/${lastClosing.id}`}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
              >
                <ArrowUpRight size={15} /> Enviar NF
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card-elevated p-10 text-center animate-rise delay-150">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-slate-300" />
          </div>
          <p className="text-dark font-semibold">Nenhum fechamento disponível ainda.</p>
          <p className="text-slate-400 text-sm mt-1">Seus fechamentos aparecerão aqui quando disponibilizados.</p>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="grid sm:grid-cols-2 gap-4 animate-rise delay-200">
        <QuickAction
          href="/tecnico/fechamentos"
          icon={FileText}
          accent="text-brand-blue"
          bg="bg-brand-blue/10"
          title="Meus fechamentos"
          desc="Histórico completo"
        />

        {hasTabela ? (
          <a
            href={`/api/admin/tecnicos/${profile.id}/tabela`}
            target="_blank"
            rel="noopener noreferrer"
            className="card-elevated p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform group"
          >
            <div className="icon-pill w-11 h-11 bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
              <TableProperties size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-dark text-sm">Tabela de valores</p>
              <p className="text-slate-500 text-xs">Clique para abrir o PDF</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 ml-auto group-hover:text-brand-blue transition-colors" />
          </a>
        ) : (
          <div className="card-elevated p-5 flex items-center gap-4 opacity-50">
            <div className="icon-pill w-11 h-11 bg-slate-100 text-slate-400">
              <TableProperties size={20} />
            </div>
            <div>
              <p className="font-bold text-dark text-sm">Tabela de valores</p>
              <p className="text-slate-500 text-xs">Ainda não disponível</p>
            </div>
          </div>
        )}

        <QuickAction
          href="/tecnico/reembolsos/novo"
          icon={Receipt}
          accent="text-purple-600"
          bg="bg-purple-50"
          title="Solicitar reembolso"
          desc="Materiais, combustível e mais"
        />

        <QuickAction
          href="/tecnico/antecipacao"
          icon={Zap}
          accent="text-amber-600"
          bg="bg-amber-50"
          title="Antecipar pagamento"
          desc="Receba antes com 48h"
        />
      </div>
    </div>
  )
}

function QuickAction({ href, icon: Icon, accent, bg, title, desc }: {
  href: string; icon: LucideIcon; accent: string; bg: string; title: string; desc: string
}) {
  return (
    <Link href={href} className="card-elevated p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-transform group">
      <div className={`icon-pill w-11 h-11 ${bg} ${accent} group-hover:scale-105 transition-transform`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-dark text-sm">{title}</p>
        <p className="text-slate-500 text-xs">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-slate-300 ml-auto group-hover:text-brand-blue transition-colors" />
    </Link>
  )
}
