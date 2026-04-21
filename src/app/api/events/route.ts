import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  event:    z.enum(['page_view','whatsapp_click','form_start','form_submit','login_start','login_success','login_failure','install_view']),
  page:     z.string().max(200).optional(),
  referrer: z.string().max(300).optional(),
})

// POST — recebe evento do cliente
export async function POST(req: NextRequest) {
  const ip = getIP(req)
  // Rate limit: 120 eventos/minuto por IP (generoso para rastreamento real)
  const rl = rateLimit(`events:${ip}`, 120, 60_000)
  if (!rl.allowed) return new NextResponse(null, { status: 429 })

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return new NextResponse(null, { status: 400 })

    const ua = req.headers.get('user-agent') ?? ''
    const isDesktop = !/mobile|android|iphone|ipad/i.test(ua)

    // Vercel injeta automaticamente a cidade do visitante via geolocalização de IP
    const rawCity = req.headers.get('x-vercel-ip-city')
    const city = rawCity ? decodeURIComponent(rawCity).slice(0, 100) : null

    await prisma.siteEvent.create({
      data: {
        event:     parsed.data.event,
        page:      parsed.data.page,
        referrer:  parsed.data.referrer,
        userAgent: ua.slice(0, 300),
        ip:        ip === 'unknown' ? null : ip,
        city,
        isDesktop,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}

// GET — dashboard de visitas (apenas admin via rota separada)
export async function GET(req: NextRequest) {
  // Busca pública bloqueada — apenas via /api/admin/visitas
  return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
}
