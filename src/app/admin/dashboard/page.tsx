import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CLOSING_STATUS_LABELS, CLOSING_STATUS_COLORS, REIMBURSEMENT_STATUS_LABELS, REIMBURSEMENT_STATUS_COLORS, REIMBURSEMENT_CATEGORY_LABELS } from '@/lib/constants-tecnico'
import { TrendingUp, Percent, FileText, Zap, Receipt } from 'lucide-react'
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

/** Mapeia nome do mês em pt-BR → índice 0–11 */
const MONTH_MAP: Record<string, number> = {
  janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3,
  maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8,
  outubro: 9, novembro: 10, dezembro: 11,
}

/**
 * Converte o campo `competence` (texto livre) para { year, month }.
 * Suporta: "Abril/2026", "Abril 2026", "04/2026", "abril", "ABRIL/2026"
 * Se o ano não for informado, assume o ano corrente.
 */
function parseCompetence(competence: string): { year: number; month: number } | null {
  const lower = competence.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  // Ex: "abril/2026" ou "abril 2026"
  const withYear = lower.match(/^([a-z]+)[\s/](\d{4})$/)
  if (withYear) {
    const m = MONTH_MAP[withYear[1]]
    const y = parseInt(withYear[2])
    if (m !== undefined && !isNaN(y)) return { year: y, month: m }
  }
  // Ex: "04/2026"
  const numeric = lower.match(/^(\d{1,2})\/(\d{4})$/)
  if (numeric) {
    const m = parseInt(numeric[1]) - 1
    const y = parseInt(numeric[2])
    if (m >= 0 && m <= 11 && !isNaN(y)) return { year: y, month: m }
  }
  // Só o nome do mês: "abril" → usa ano corrente
  const monthOnly = MONTH_MAP[lower]
  if (monthOnly !== undefined) return { year: new Date().getFullYear(), month: monthOnly }
  return null
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const [closings, advances, reimbursements] = await Promise.all([
    prisma.closing.findMany({
      include: { invoice: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.paymentAdvance.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    prisma.reimbursement.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }),
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
  const semNF        = closings.filter(c => !c.invoice && c.status !== 'PAID')
  const totalSemNF   = semNF.reduce((s, c) => s + c.totalValue, 0)

  // ── Fechamentos — por status ─────────────────────────────────────────────────
  const byStatus: Record<string, { count: number; total: number }> = {}
  for (const c of closings) {
    byStatus[c.status] ??= { count: 0, total: 0 }
    byStatus[c.status].count++
    byStatus[c.status].total += c.totalValue
  }
  const byStatusList = STATUS_ORDER.filter(s => byStatus[s]).map(s => ({ status: s, ...byStatus[s] }))

  // ── Fechamentos — últimos 6 meses (por mês de competência) ──────────────────
  const fechMonths = monthRange(6)
  const fechMonthly = fechMonths.map(m => {
    const items = closings.filter(c => {
      const comp = parseCompetence(c.competence)
      return comp?.year === m.year && comp?.month === m.month
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

  // ── Reembolsos — totais ──────────────────────────────────────────────────────
  const reimbTotal        = reimbursements.reduce((s, r) => s + r.totalValue, 0)
  const reimbPending      = reimbursements.filter(r => r.status === 'PENDING')
  const reimbApproved     = reimbursements.filter(r => r.status === 'APPROVED')
  const reimbReleased     = reimbursements.filter(r => r.status === 'PAYMENT_RELEASED')
  const reimbPaid         = reimbursements.filter(r => r.status === 'PAID')
  const reimbRejected     = reimbursements.filter(r => r.status === 'REJECTED')

  const reimbAllItems = reimbursements.flatMap(r => r.items)
  const reimbByCategory: Record<string, number> = {}
  for (const item of reimbAllItems) {
    reimbByCategory[item.category] = (reimbByCategory[item.category] ?? 0) + item.value
  }
  const reimbCatList = Object.entries(reimbByCategory).sort((a, b) => b[1] - a[1])
  const maxReimbCat = Math.max(...reimbCatList.map(([, v]) => v), 1)

  // ── Reembolsos — últimos 6 meses (por createdAt — reembolsos não têm competência) ──
  const reimbMonths = monthRange(6)
  const reimbMonthly = reimbMonths.map(m => {
    const items = reimbursements.filter(r => {
      const d = new Date(r.createdAt)
      return d.getFullYear() === m.year && d.getMonth() === m.month
    })
    return { label: m.label, total: items.reduce((s, r) => s + r.totalValue, 0), count: items.length }
  })
  const maxReimbMensal = Math.max(...reimbMonthly.map(m => m.total), 1)

  // ── Antecipações — últimos 6 meses (vinculadas ao mês de competência do fechamento) ──
  // Cada antecipação está ligada a um closing; usa a competência desse closing
  const closingById = Object.fromEntries(closings.map(c => [c.id, c]))
  const advMonths = monthRange(6)
  const advMonthly = advMonths.map(m => {
    const items = advances.filter(a => {
      const closing = closingById[a.closingId]
      if (closing) {
        const comp = parseCompetence(closing.competence)
        return comp?.year === m.year && comp?.month === m.month
      }
      // fallback: usa createdAt da antecipação
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
              <span className="text-[10px] font-normal text-slate-400">(por competência)</span>
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
          REEMBOLSOS
      ══════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-dark flex items-center gap-2">
            <Receipt size={16} className="text-brand-blue" /> Reembolsos
          </h2>
          <Link href="/admin/reembolsos" className="text-xs text-brand-blue hover:underline font-medium">
            Ver todos →
          </Link>
        </div>

        {reimbursements.length === 0 ? (
          <div className="card p-8 text-center">
            <Receipt size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Nenhum reembolso registrado ainda.</p>
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="card p-5">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Total geral</p>
                <p className="text-xl font-extrabold text-dark">{fmt(reimbTotal)}</p>
                <p className="text-xs text-slate-400 mt-1">{reimbursements.length} reembolso(s)</p>
              </div>
              <div className="card p-5 border-l-4 border-amber-400">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Aguardando</p>
                <p className="text-xl font-extrabold text-amber-600">{fmt(reimbPending.reduce((s, r) => s + r.totalValue, 0))}</p>
                <p className="text-xs text-slate-400 mt-1">{reimbPending.length} pendente(s)</p>
              </div>
              <div className="card p-5 border-l-4 border-emerald-400">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Pgto. liberado</p>
                <p className="text-xl font-extrabold text-emerald-600">{fmt(reimbReleased.reduce((s, r) => s + r.totalValue, 0))}</p>
                <p className="text-xs text-slate-400 mt-1">{reimbReleased.length} liberado(s)</p>
              </div>
              <div className="card p-5 border-l-4 border-green-400">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Pagos</p>
                <p className="text-xl font-extrabold text-green-600">{fmt(reimbPaid.reduce((s, r) => s + r.totalValue, 0))}</p>
                <p className="text-xs text-slate-400 mt-1">{reimbPaid.length} pago(s)</p>
              </div>
              <div className="card p-5 border-l-4 border-red-300">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Recusados</p>
                <p className="text-xl font-extrabold text-red-500">{fmt(reimbRejected.reduce((s, r) => s + r.totalValue, 0))}</p>
                <p className="text-xs text-slate-400 mt-1">{reimbRejected.length} recusado(s)</p>
              </div>
            </div>

            {/* Gráficos de reembolsos */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
                  <Percent size={14} className="text-brand-blue" /> Distribuição por categoria
                </h3>
                <div className="space-y-3">
                  {reimbCatList.map(([cat, value]) => (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 font-medium">{REIMBURSEMENT_CATEGORY_LABELS[cat] ?? cat}</span>
                        <span className="text-sm font-bold text-dark">{fmt(value)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(value / maxReimbCat) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {reimbCatList.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">Nenhum item ainda.</p>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
                  <TrendingUp size={14} className="text-brand-blue" /> Últimos 6 meses
                </h3>
                <div className="space-y-3">
                  {reimbMonthly.map(m => (
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
                          <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(m.total / maxReimbMensal) * 100}%` }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
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
