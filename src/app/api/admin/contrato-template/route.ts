import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  DEFAULT_CONTRATO_MAE,
  DEFAULT_TERMO_FECHAMENTO,
  VARS_CONTRATO_MAE,
  VARS_TERMO_FECHAMENTO,
} from '@/lib/contract-templates-default'

const VALID_TYPES = ['CONTRATO_MAE', 'TERMO_FECHAMENTO'] as const
type TemplateType = typeof VALID_TYPES[number]

const DEFAULTS: Record<TemplateType, string> = {
  CONTRATO_MAE:    DEFAULT_CONTRATO_MAE,
  TERMO_FECHAMENTO: DEFAULT_TERMO_FECHAMENTO,
}
const TITLES: Record<TemplateType, string> = {
  CONTRATO_MAE:     'Contrato-Mãe de Prestação de Serviços',
  TERMO_FECHAMENTO: 'Termo Mensal de Prestação de Serviços',
}
const VARS: Record<TemplateType, { tag: string; desc: string }[]> = {
  CONTRATO_MAE:    VARS_CONTRATO_MAE,
  TERMO_FECHAMENTO: VARS_TERMO_FECHAMENTO,
}

/** Busca template ativo, ou retorna o padrão embutido se não existir */
async function getTemplate(type: TemplateType) {
  const record = await prisma.contractTemplate.findFirst({
    where:   { type, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  return {
    id:        record?.id ?? null,
    type,
    title:     record?.title ?? TITLES[type],
    content:   record?.content ?? DEFAULTS[type],
    version:   record?.version ?? 'v1',
    variables: VARS[type],
    isDefault: !record,
    updatedAt: record?.updatedAt ?? null,
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as TemplateType | null

  if (type && VALID_TYPES.includes(type)) {
    return NextResponse.json(await getTemplate(type))
  }

  // Retorna todos
  const templates = await Promise.all(VALID_TYPES.map(t => getTemplate(t)))
  return NextResponse.json(templates)
}

const saveSchema = z.object({
  type:    z.enum(VALID_TYPES),
  content: z.string().min(100, 'Conteúdo muito curto'),
  title:   z.string().min(3).optional(),
  version: z.string().optional(),
})

export async function PUT(req: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { type, content, title, version } = parsed.data

  // Desativa templates anteriores do mesmo tipo (operação plana)
  const existing = await prisma.contractTemplate.findMany({
    where: { type, isActive: true },
  })
  for (const t of existing) {
    await prisma.contractTemplate.update({
      where: { id: t.id },
      data:  { isActive: false },
    })
  }

  // Cria nova versão ativa
  const newVersion = version ?? `v${existing.length + 1}`
  const template = await prisma.contractTemplate.create({
    data: {
      type,
      version:   newVersion,
      title:     title ?? TITLES[type],
      content,
      variables: JSON.stringify(VARS[type]),
      isActive:  true,
    },
  })

  return NextResponse.json({ ok: true, template })
}

/** Utilitário exportado para uso interno (geração de contratos) */
export async function getActiveTemplate(type: TemplateType): Promise<string> {
  const record = await prisma.contractTemplate.findFirst({
    where:   { type, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  return record?.content ?? DEFAULTS[type]
}
