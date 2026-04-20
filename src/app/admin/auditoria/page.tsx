import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ShieldCheck, LogIn, LogOut, AlertTriangle, Monitor, Smartphone } from 'lucide-react'
import Link from 'next/link'

const EVENT_LABELS: Record<string, string> = {
  login_success: 'Login OK',
  login_failure: 'Falha de login',
  logout:        'Logout',
  blocked:       'Bloqueado',
}

const EVENT_COLORS: Record<string, string> = {
  login_success: 'bg-green-100 text-green-700',
  login_failure: 'bg-red-100 text-red-700',
  logout:        'bg-slate-100 text-slate-600',
  blocked:       'bg-amber-100 text-amber-700',
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  login_success: <LogIn size={12} />,
  login_failure: <AlertTriangle size={12} />,
  logout:        <LogOut size={12} />,
  blocked:       <ShieldCheck size={12} />,
}

function fmt(date: Date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

interface PageProps {
  searchParams: Promise<{ page?: string; event?: string; userId?: string; from?: string; to?: string }>
}

export default async function AuditoriaPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const params  = await searchParams
  const page    = Math.max(1, Number(params.page ?? 1))
  const limit   = 50
  const event   = params.event   ?? undefined
  const userId  = params.userId  ?? undefined
  const from    = params.from    ?? undefined
  const to      = params.to      ?? undefined

  const where = {
    ...(event  ? { event }  : {}),
    ...(userId ? { userId } : {}),
    ...((from || to) ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to   ? { lte: new Date(to)   } : {}),
      },
    } : {}),
  }

  const [total, logs, summary] = await Promise.all([
    prisma.loginAudit.count({ where }),
    prisma.loginAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    // Resumo últimas 24h
    prisma.loginAudit.groupBy({
      by: ['event'],
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      _count: { event: true },
    }),
  ])

  const pages = Math.ceil(total / limit)

  const summaryMap: Record<string, number> = {}
  for (const s of summary) summaryMap[s.event] = s._count.event

  const buildUrl = (p: number) => {
    const sp = new URLSearchParams()
    sp.set('page', String(p))
    if (event)  sp.set('event', event)
    if (userId) sp.set('userId', userId)
    if (from)   sp.set('from', from)
    if (to)     sp.set('to', to)
    return `/admin/auditoria?${sp.toString()}`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-dark flex items-center gap-2">
          <ShieldCheck size={22} className="text-brand-blue" /> Auditoria de Logins
        </h1>
        <p className="text-slate-500 text-sm mt-1">Registro de todos os acessos ao sistema.</p>
      </div>

      {/* Cards — resumo 24h */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: 'login_success', label: 'Logins OK',    color: 'border-green-400', text: 'text-green-600' },
          { key: 'login_failure', label: 'Falhas',       color: 'border-red-400',   text: 'text-red-600'   },
          { key: 'logout',        label: 'Logouts',      color: 'border-slate-400', text: 'text-slate-600' },
          { key: 'blocked',       label: 'Bloqueados',   color: 'border-amber-400', text: 'text-amber-600' },
        ].map(({ key, label, color, text }) => (
          <div key={key} className={`card p-4 border-l-4 ${color}`}>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${text}`}>{summaryMap[key] ?? 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">últimas 24h</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <form className="card p-4 flex flex-wrap gap-3 items-end" method="GET">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Evento</label>
          <select name="event" defaultValue={event ?? ''} className="input-field py-1.5 text-sm min-w-[140px]">
            <option value="">Todos</option>
            <option value="login_success">Login OK</option>
            <option value="login_failure">Falha de login</option>
            <option value="logout">Logout</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">De</label>
          <input type="date" name="from" defaultValue={from ?? ''} className="input-field py-1.5 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Até</label>
          <input type="date" name="to" defaultValue={to ?? ''} className="input-field py-1.5 text-sm" />
        </div>
        <button type="submit" className="btn-primary py-1.5 text-sm">Filtrar</button>
        {(event || from || to || userId) && (
          <Link href="/admin/auditoria" className="btn-secondary py-1.5 text-sm">Limpar</Link>
        )}
      </form>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Evento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dispositivo</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
              {logs.map((log, i) => {
                const isMobile = /mobile|android|iphone|ipad/i.test(log.userAgent ?? '')
                return (
                  <tr key={log.id} className={`border-b border-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'} hover:bg-blue-50/30 transition-colors`}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {fmt(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${EVENT_COLORS[log.event] ?? 'bg-slate-100 text-slate-600'}`}>
                        {EVENT_ICONS[log.event]}
                        {EVENT_LABELS[log.event] ?? log.event}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-dark text-xs">{log.techName ?? log.email ?? '—'}</div>
                      {log.techName && log.email && (
                        <div className="text-slate-400 text-xs">{log.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {log.ip ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        {isMobile ? <Smartphone size={12} /> : <Monitor size={12} />}
                        {isMobile ? 'Mobile' : 'Desktop'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {total} registro{total !== 1 ? 's' : ''} • Página {page} de {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={buildUrl(page - 1)} className="btn-secondary py-1 px-3 text-xs">← Anterior</Link>
              )}
              {page < pages && (
                <Link href={buildUrl(page + 1)} className="btn-secondary py-1 px-3 text-xs">Próxima →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
