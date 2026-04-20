import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BarChart2, Monitor, Smartphone, MousePointerClick, Eye, MessageSquare, Send, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const EVENT_LABELS: Record<string, string> = {
  page_view:      'Visualizações de página',
  whatsapp_click: 'Cliques no WhatsApp',
  form_start:     'Formulários iniciados',
  form_submit:    'Formulários enviados',
  login_start:    'Tentativas de login',
  login_success:  'Logins bem-sucedidos',
  login_failure:  'Falhas de login',
  install_view:   'Prompts de instalação (PWA)',
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  page_view:      <Eye size={14} />,
  whatsapp_click: <MessageSquare size={14} />,
  form_start:     <MousePointerClick size={14} />,
  form_submit:    <Send size={14} />,
  login_start:    <TrendingUp size={14} />,
}

const PAGE_LABELS: Record<string, string> = {
  '/':                 'Home',
  '/tecnico/login':    'Login técnico',
  '/tecnico/painel':   'Painel técnico',
  '/admin':            'Admin',
  '/candidatura':      'Candidatura',
}

function fmtDay(day: string) {
  const [y, m, d] = day.split('-')
  return `${d}/${m}`
}

interface PageProps {
  searchParams: Promise<{ days?: string }>
}

export default async function VisitasPage({ searchParams }: PageProps) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const params = await searchParams
  const days   = Math.min(90, Math.max(1, Number(params.days ?? 30)))
  const since  = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [totalEvents, byEventRaw, recentEvents] = await Promise.all([
    prisma.siteEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.siteEvent.groupBy({
      by: ['event'],
      where: { createdAt: { gte: since } },
      _count: { event: true },
    }),
    prisma.siteEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { event: true, page: true, isDesktop: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 5000,
    }),
  ])

  // Agrupamentos
  const byPage: Record<string, number> = {}
  let desktopCount = 0
  let mobileCount  = 0
  const byDay: Record<string, number> = {}

  for (const ev of recentEvents) {
    if (ev.isDesktop) desktopCount++
    else              mobileCount++

    if (ev.event === 'page_view') {
      const page = ev.page ?? '/'
      byPage[page] = (byPage[page] ?? 0) + 1
    }

    const day = ev.createdAt.toISOString().slice(0, 10)
    byDay[day] = (byDay[day] ?? 0) + 1
  }

  const byEvent = byEventRaw
    .map(r => ({ event: r.event, count: r._count.event }))
    .sort((a, b) => b.count - a.count)

  const byPageSorted = Object.entries(byPage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  // Preenche todos os dias do período
  const byDayFilled: { day: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    byDayFilled.push({ day: key, count: byDay[key] ?? 0 })
  }

  const maxDay   = Math.max(...byDayFilled.map(d => d.count), 1)
  const maxPage  = Math.max(...byPageSorted.map(([, c]) => c), 1)
  const maxEvent = Math.max(...byEvent.map(e => e.count), 1)

  const totalViews = byEvent.find(e => e.event === 'page_view')?.count ?? 0
  const totalWA    = byEvent.find(e => e.event === 'whatsapp_click')?.count ?? 0
  const totalForms = byEvent.find(e => e.event === 'form_submit')?.count ?? 0
  const totalDevices = desktopCount + mobileCount

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark flex items-center gap-2">
            <BarChart2 size={22} className="text-brand-blue" /> Visitas do Site
          </h1>
          <p className="text-slate-500 text-sm mt-1">Analytics de tráfego e interações.</p>
        </div>
        {/* Seletor de período */}
        <div className="flex gap-1">
          {[7, 14, 30, 60, 90].map(d => (
            <Link
              key={d}
              href={`/admin/visitas?days=${d}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                days === d ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {/* Cards — métricas principais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-brand-blue">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Visualizações</p>
          <p className="text-2xl font-extrabold text-brand-blue">{totalViews.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-400 mt-1">últimos {days} dias</p>
        </div>
        <div className="card p-5 border-l-4 border-green-400">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">WhatsApp</p>
          <p className="text-2xl font-extrabold text-green-600">{totalWA.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-400 mt-1">cliques</p>
        </div>
        <div className="card p-5 border-l-4 border-purple-400">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Formulários</p>
          <p className="text-2xl font-extrabold text-purple-600">{totalForms.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-400 mt-1">enviados</p>
        </div>
        <div className="card p-5 border-l-4 border-amber-400">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Total eventos</p>
          <p className="text-2xl font-extrabold text-amber-600">{totalEvents.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-400 mt-1">todos os tipos</p>
        </div>
      </div>

      {/* Gráfico por dia */}
      <div className="card p-5">
        <h2 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-brand-blue" /> Eventos por dia
        </h2>
        <div className="flex items-end gap-0.5 h-28 overflow-x-auto pb-2">
          {byDayFilled.map(({ day, count }) => (
            <div key={day} className="flex flex-col items-center flex-1 min-w-[8px] group relative">
              <div
                className="w-full bg-brand-blue/70 rounded-t hover:bg-brand-blue transition-colors cursor-default"
                style={{ height: `${maxDay > 0 ? (count / maxDay) * 96 : 0}px`, minHeight: count > 0 ? '2px' : '0' }}
                title={`${fmtDay(day)}: ${count}`}
              />
              {/* Tooltip ao hover */}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {fmtDay(day)}: {count}
              </span>
            </div>
          ))}
        </div>
        {/* Eixo X — mostra só alguns rótulos para não poluir */}
        <div className="flex justify-between mt-1 px-0.5">
          {days <= 14
            ? byDayFilled.map(({ day }) => (
                <span key={day} className="text-[9px] text-slate-400 flex-1 text-center">{fmtDay(day)}</span>
              ))
            : (
              <>
                <span className="text-[9px] text-slate-400">{fmtDay(byDayFilled[0]?.day ?? '')}</span>
                <span className="text-[9px] text-slate-400">{fmtDay(byDayFilled[Math.floor(byDayFilled.length / 2)]?.day ?? '')}</span>
                <span className="text-[9px] text-slate-400">{fmtDay(byDayFilled[byDayFilled.length - 1]?.day ?? '')}</span>
              </>
            )
          }
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Dispositivos */}
        <div className="card p-5">
          <h2 className="font-bold text-dark text-sm mb-4">Dispositivos</h2>
          {totalDevices === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Sem dados ainda.</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Desktop', icon: <Monitor size={16} />, count: desktopCount, color: 'bg-brand-blue', text: 'text-brand-blue' },
                { label: 'Mobile',  icon: <Smartphone size={16} />, count: mobileCount,  color: 'bg-emerald-500', text: 'text-emerald-600' },
              ].map(({ label, icon, count, color, text }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`flex items-center gap-1.5 text-sm font-medium ${text}`}>{icon} {label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-dark">{count.toLocaleString('pt-BR')}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{totalDevices > 0 ? `${Math.round((count / totalDevices) * 100)}%` : '0%'}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${totalDevices > 0 ? (count / totalDevices) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Eventos por tipo */}
        <div className="card p-5">
          <h2 className="font-bold text-dark text-sm mb-4">Eventos por tipo</h2>
          {byEvent.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Sem dados ainda.</p>
          ) : (
            <div className="space-y-3">
              {byEvent.map(({ event, count }) => (
                <div key={event}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      {EVENT_ICONS[event] ?? <Eye size={14} />}
                      {EVENT_LABELS[event] ?? event}
                    </span>
                    <span className="text-sm font-bold text-dark">{count.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-brand-blue/60 rounded-full" style={{ width: `${(count / maxEvent) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Páginas mais visitadas */}
      <div className="card p-5">
        <h2 className="font-bold text-dark text-sm mb-4 flex items-center gap-2">
          <Eye size={14} className="text-brand-blue" /> Páginas mais visitadas
        </h2>
        {byPageSorted.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Sem dados de page_view ainda.</p>
        ) : (
          <div className="space-y-3">
            {byPageSorted.map(([page, count]) => (
              <div key={page}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600 font-medium font-mono truncate max-w-[60%]">
                    {PAGE_LABELS[page] ?? page}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{Math.round((count / (totalViews || 1)) * 100)}%</span>
                    <span className="text-sm font-bold text-dark">{count.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(count / maxPage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
