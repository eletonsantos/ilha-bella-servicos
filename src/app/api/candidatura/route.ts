import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getIP } from '@/lib/rate-limit'

const schema = z.object({
  fullName:               z.string().min(3).max(150),
  cpfCnpj:                z.string().min(11).max(18),
  whatsapp:               z.string().min(10).max(20),
  email:                  z.string().email().max(150),
  cidade:                 z.string().min(2).max(100),
  bairro:                 z.string().max(100).optional(),
  especialidadePrincipal: z.string().min(2).max(100),
  outrasEspecialidades:   z.string().max(500).optional(),
  atende24h:              z.boolean(),
  possuiVeiculo:          z.boolean(),
  emiteNotaFiscal:        z.boolean(),
  trabalhoTipo:           z.string().max(100).optional(),
  disponibilidade:        z.string().max(200).optional(),
  tempoExperiencia:       z.string().max(100).optional(),
  observacoes:            z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  // Rate limit: 3 candidaturas por IP a cada 10 minutos
  const ip = getIP(req)
  const rl = rateLimit(`candidatura:${ip}`, 3, 10 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde alguns minutos antes de enviar novamente.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos. Verifique o formulário.' }, { status: 400 })
    }

    // Sanitiza CPF/CNPJ: permite apenas dígitos, pontos, traços e barras
    const cpfCnpj = parsed.data.cpfCnpj.replace(/[^\d.\-\/]/g, '')

    // Anti-spam: bloqueia e-mail ou CPF/CNPJ duplicado nas últimas 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existing = await prisma.technicianApplication.findFirst({
      where: {
        OR: [
          { email: parsed.data.email, createdAt: { gte: oneDayAgo } },
          { cpfCnpj, createdAt: { gte: oneDayAgo } },
        ],
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Já recebemos uma candidatura com esses dados recentemente. Entraremos em contato!' },
        { status: 409 }
      )
    }

    const application = await prisma.technicianApplication.create({
      data: { ...parsed.data, cpfCnpj },
    })

    return NextResponse.json({ success: true, id: application.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao enviar candidatura. Tente novamente.' }, { status: 500 })
  }
}
