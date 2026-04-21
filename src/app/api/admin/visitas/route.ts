import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const days  = Math.min(90, Math.max(1, Number(searchParams.get('days') ?? 30)))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [totalEvents, byEventRaw, recentEvents, byCityRaw] = await Promise.all([
    prisma.siteEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.siteEvent.groupBy({
      by: ['event'],
      where: { createdAt: { gte: since } },
      _count: { event: true },
    }),
    prisma.siteEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { event: true, page: true, isDesktop: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    }),
    // Agrega page_views por cidade
    prisma.siteEvent.groupBy({
      by: ['city'],
      where: { createdAt: { gte: since }, event: 'page_view', city: { not: null } },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 20,
    }),
  ])

  // Agrupa page_views por página
  const byPage: Record<string, number> = {}
  let desktopCount = 0
  let mobileCount  = 0

  // Agrupa por dia (últimos N dias)
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

  const byEvent = byEventRaw.map(r => ({ event: r.event, count: r._count.event }))
    .sort((a, b) => b.count - a.count)

  const byPageSorted = Object.entries(byPage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([page, count]) => ({ page, count }))

  // Preenche todos os dias do período (sem gaps)
  const byDayFilled: { day: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    byDayFilled.push({ day: key, count: byDay[key] ?? 0 })
  }

  const byCity = byCityRaw
    .filter(r => r.city)
    .map(r => ({ city: r.city as string, count: r._count.city }))

  return NextResponse.json({
    total: totalEvents,
    since: since.toISOString(),
    days,
    byEvent,
    byPage: byPageSorted,
    byDay: byDayFilled,
    byCity,
    devices: { desktop: desktopCount, mobile: mobileCount },
  })
}
