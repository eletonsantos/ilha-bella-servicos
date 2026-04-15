import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS } from '@/lib/constants-tecnico'
import { TrendingUp, Percent, FileText, Zap } from 'lucide-react'
import Link from 'next/link'

const STATUS_ORDER = [
  'AWAITING_CLOSING',
  'CLOSING_AVAILABLE',
  'AWAITING_INVOICE',
  'INVOICE_SENT',
  'UNDER_REVIEW',
  'PAYMENT_RELEASED',
  'PAID',
]

const STATUS_BAR_COLORS: Record<string, string> = {
  AWAITING_CLOSING:  'bg-slate-400',
  CLOSING_AVAILABLE: 'bg-blue-500',
  AWAITING_INVOICE:  'bg-amber-400',
  INVOICE_SENT:      'bg-purple-500',
  UNDER_REVIEW:      'bg-orange-400',
  PAYMENT_RELEASED:  'bg-emerald-500',
  PAID:              'bg-green-500',
}

function fmt(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function monthRange(offsetFromNow: number) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (offsetFromNow - 1 - i), 1)
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) }
  })
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const [closings, advances] = await Promise.all([
    prisma.closing.findMany({
      include: { invoice: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.paymentAdvance.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // ── Fechamentos — totais ─────────────────────────────────────────────────────
  const totalGeral    = closings.reduce((s, c) => s + c.totalValue, 0)
  const totalPago     = closings.filter(c => c.status === 'PAID').reduce((s, c) => s + c.totalValue, 0)
  const totalLiberado = closings.filter(c => c.status === 'PAYMENT_RELEASED').reduce((s, c) => s + c.totalValue, 0)
  const totalAndamento = closings
    .filter(c => !['PAID', 'PAYMENT_RELEASED'].includes(c.status))
    .reduce((s, c) => s + c.totalValue, 0)

  const qtdPago      = closings.filter(c => c.status === 'PAID').length
  const qtdLiberado  = closings.filter(c => c.status === 'PAYMENT_RELEASED').length
  const qtdAndamento = closings.filter(c => !['PAID', 'PAYMENT_RELEASED'].includes(c.status)).length
  const semNF        = closings.filter(c => !c.invoice)
  const totalSemNF   = semNF.reduce((s, c) => s + c.totalValue, 0)

  // ── Fechamentos — por status ─────────────────────────────────────────────────
  const byStatus: Record<string, { count: number; total: number }> = {}
  for (const c of closings) {
    byStatus[c.status] ??= { count: 0, total: 0 }
    byStatus[c.status].count++
    byStatus[c.status].total += c.totalValue
  }
  const byStatusList = STATUS_ORDER.filter(s => byStatus[s]).map(s => ({ status: s, ...byStatus[s] }))

  // ── Fechamentos — últimos 6 meses ────────────────────────────────────────────
  const fechMonths = monthRange(6)
  const fechMonthly = fechMonths.map(m => {
    const items = closings.filter(c => {
      const d = new Date(c.createdAt)
      return d.getFullYear() === m.year && d.getMonth() === m.month
    })
    return { label: m.label, total: items.reduce((s, c) => s + c.totalValue, 0), count: items.length }
  })
  const maxFechMensal = Math.max(...fechMonthly.map(m => m.total), 1)

  // ── Antecipações — totais ────────────────────────────────────────────────────
  const advPending  = advances.filter(a => a.status === 'PENDING')
  const advApproved = advances.filter(a => a.status === 'APPROVED')
  const advRejected = advances.filter(a => a.status === 'REJECTED')

  const totalAdvPendente  = advPending.reduce((s, a)  => s + a.originalValue, 0)
  const totalAdvBruto     = advApproved.reduce((s, a) => s + a.originalValue, 0)
  const totalAdvLiq       = advApproved.reduce((s, a) => s + a.netValue, 0)
  const totalTaxas        = advApproved.reduce((s, a) => s + a.feeValue, 0)

  // ── Antecipações — últimos 6 meses ──────────────────────────────────────────
  const advMonths = monthRange(6)
  const advMonthly = advMonths.map(m => {
    const items = advances.filter(a => {
      const d = new Date(a.createdAt)
      return d.getFullYear() === m.year && d.getMonth() === m.month
    })
    return {
      label:    m.label,
      total:    items.reduce((s, a) => s + a.originalValue, 0),
      taxas:    items.filter(a => a.status === 'APPROVED').reduce((s, a) => s + a.feeValue, 0),
      count:    items.length,
    }
  })
  const maxAdvMensal = Math.max(...advMonthly.map(m => m.total), 1)

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-dark">Dashboard financeiro</h1>
        <p className="text-slate-500 text-sm mt-1">Visão consolidada de fechamentos e antecipações.</p>
      </div>

      {/* ══════════════════════════════════════════════════
          FECHAMENTOS
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-dark flex items-center gap-2">
            <FileText size={16} className="text-brand-blue" /> Fechamentos
          </h2>
          <Link href="/admin/fechamentos" className="text-xs text-brand-blue hover:underline font-medium">
            Ver todos →
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="card p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Total geral</p>
            <p className="text-xl font-extrabold text-dark">{fmt(totalGeral)}</p>
            <p className="text-xs text-slate-400 mt-1">{closings.length} fechamentos</p>
          </div>
          <div className="card p-5 border-l-4 border-green-400">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Pagos</p>
            <p className="text-xl font-extrabold text-green-600">{fmt(totalPago)}</p>
            <p className="text-xs text-slate-400 mt-1">{qtdPago} fechamentos</p>
          </div>
          <div className="card p-5 border-l-4 border-emerald-400">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Pgto. liberado</p>
            <p className="text-xl font-extrabold text-emerald-600">{fmt(totalLiberado)}</p>
            <p className="text-xs text-slate-400 mt-1">{qtdLiberado} fechamentos</p>
          </div>
          <div className="card p-5 border-l-4 border-amber-400">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Em andamento</p>
            <p className="text-xl font-extrabold text-amber-600">{fmt(totalAndamento)}</p>
            <p className="text-xs text-slate-400 mt-1">{qtdAndamento} fechamentos</p>
          </div>
          <div className="card p-5 border-l-4 border-red-300">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Sem NF</p>
            <p className="text-xl font-extrabold text-red-500">{fmt(totalSemNF)}</p>
            <p className="text-xs text-slate-400 mt-1">{semNF.length} fechamentos</p>
          </div>
        </div>

        {/* Gráficos de fechamentos */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-dark text-sm mb-4">Valores por status</h3>
            <div className="space-y-3">
              {byStatusList.map(({ status, count, total }) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CLOSING_STATUS_COLORS[status]}`}>
                      {CLOSING_STATUS_LABELS[status]}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-dark">{fmt(total)}</span>
                      <span className="text-xs text-slate-400 ml-2">{count}×</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLORS[status]}`}
                      style={{ width: `${totalGeral > 0 ? (total / totalGeral) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              {byStatusList.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum fechamento ainda.</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-blue" /> Últimos 6 meses
            </h3>
            <div className="space-y-3">
              {fechMonthly.map(m => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 capitalize font-medium">{m.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-dark">{m.total > 0 ? fmt(m.total) : '—'}</span>
                      {m.count > 0 && <span className="text-xs text-slate-400 ml-2">{m.count}×</span>}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    {m.total > 0 && (
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(m.total / maxFechMensal) * 100}%` }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          ANTECIPAÇÕES
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-dark flex items-center gap-2">
            <Zap size={16} className="text-amber-500" /> Antecipações
          </h2>
          <Link href="/admin/antecipacao" className="text-xs text-brand-blue hover:underline font-medium">
            Ver todas →
          </Link>
        </div>

        {advances.length === 0 ? (
          <div className="card p-8 text-center">
            <Zap size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Nenhuma antecipação solicitada ainda.</p>
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-amber-400">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Pendente</p>
                <p className="text-xl font-extrabold text-amber-600">{fmt(totalAdvPendente)}</p>
                <p className="text-xs text-slate-400 mt-1">{advPending.length} solicitaç{advPending.length === 1 ? 'ão' : 'ões'}</p>
              </div>
              <div className="card p-5 border-l-4 border-emerald-400">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Aprovadas (bruto)</p>
                <p className="text-xl font-extrabold text-emerald-600">{fmt(totalAdvBruto)}</p>
                <p className="text-xs text-slate-400 mt-1">{advApproved.length} aprovad{advApproved.length === 1 ? 'a' : 'as'}</p>
              </div>
              <div className="card p-5 border-l-4 border-blue-400">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Líquido pago</p>
                <p className="text-xl font-extrabold text-blue-600">{fmt(totalAdvLiq)}</p>
                <p className="text-xs text-slate-400 mt-1">após taxa de 10%</p>
              </div>
              <div className="card p-5 border-l-4 border-green-400">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Taxas arrecadadas</p>
                <p className="text-xl font-extrabold text-green-600">{fmt(totalTaxas)}</p>
                <p className="text-xs text-slate-400 mt-1">{advApproved.length > 0 ? '10% por antecip.' : '—'}</p>
              </div>
            </div>

            {/* Gráficos de antecipações */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
                  <Percent size={14} className="text-brand-blue" /> Distribuição por status
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Pendentes',  count: advPending.length,  value: totalAdvPendente, color: 'bg-amber-400',  text: 'text-amber-600' },
                    { label: 'Aprovadas',  count: advApproved.length, value: totalAdvBruto,    color: 'bg-emerald-500', text: 'text-emerald-600' },
                    { label: 'Recusadas', count: advRejected.length, value: advRejected.reduce((s, a) => s + a.originalValue, 0), color: 'bg-red-400', text: 'text-red-500' },
                  ].map(row => {
                    const totalAdv = advances.reduce((s, a) => s + a.originalValue, 0)
                    const pct = totalAdv > 0 ? (row.value / totalAdv) * 100 : 0
                    return (
                      <div key={row.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600 font-medium">{row.label}</span>
                          <div className="text-right">
                            <span className={`text-sm font-bold ${row.text}`}>{fmt(row.value)}</span>
                            <span className="text-xs text-slate-400 ml-2">{row.count}×</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
                  <TrendingUp size={14} className="text-brand-blue" /> Últimos 6 meses
                </h3>
                <div className="space-y-3">
                  {advMonthly.map(m => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500 capitalize font-medium">{m.label}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-dark">{m.total > 0 ? fmt(m.total) : '—'}</span>
                          {m.taxas > 0 && <span className="text-xs text-green-600 ml-2">+{fmt(m.taxas)}</span>}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        {m.total > 0 && (
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(m.total / maxAdvMensal) * 100}%` }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  <span className="text-green-600 font-semibold">+valor</span> = taxas de 10% arrecadadas no mês
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
