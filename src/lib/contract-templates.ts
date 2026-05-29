import { prisma } from '@/lib/prisma'
import { DEFAULT_CONTRATO_MAE, DEFAULT_TERMO_FECHAMENTO } from '@/lib/contract-templates-default'

type TemplateType = 'CONTRATO_MAE' | 'TERMO_FECHAMENTO'

const DEFAULTS: Record<TemplateType, string> = {
  CONTRATO_MAE:     DEFAULT_CONTRATO_MAE,
  TERMO_FECHAMENTO: DEFAULT_TERMO_FECHAMENTO,
}

/** Retorna o conteúdo do template ativo, ou o padrão embutido se não houver registro no DB */
export async function getActiveTemplate(type: TemplateType): Promise<string> {
  const record = await prisma.contractTemplate.findFirst({
    where:   { type, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
  return record?.content ?? DEFAULTS[type]
}
