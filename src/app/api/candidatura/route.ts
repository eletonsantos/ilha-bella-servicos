import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  fullName:               z.string().min(3),
  cpfCnpj:                z.string().min(11),
  whatsapp:               z.string().min(10),
  email:                  z.string().email(),
  cidade:                 z.string().min(2),
  bairro:                 z.string().optional(),
  especialidadePrincipal: z.string().min(2),
  outrasEspecialidades:   z.string().optional(),
  atende24h:              z.boolean(),
  possuiVeiculo:          z.boolean(),
  emiteNotaFiscal:        z.boolean(),
  trabalhoTipo:           z.string().optional(),
  disponibilidade:        z.string().optional(),
  tempoExperiencia:       z.string().optional(),
  observacoes:            z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }
    const application = await prisma.technicianApplication.create({ data: parsed.data })
    return NextResponse.json({ success: true, id: application.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
