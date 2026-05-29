import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  cnpj: z.string().min(14).max(18),
})

function extractIP(req: Request): string | undefined {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return undefined
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'CNPJ inválido' }, { status: 400 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const cnpjRaw = parsed.data.cnpj.replace(/\D/g, '')
  if (cnpjRaw.length !== 14) return NextResponse.json({ error: 'CNPJ deve ter 14 dígitos' }, { status: 400 })

  const ip = extractIP(req)

  // Consulta BrasilAPI
  let cnpjData: Record<string, unknown> | null = null
  let situacao = 'ERRO'
  let ativo = false

  try {
    const apiRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjRaw}`, {
      headers: { 'User-Agent': 'IlhaBellaServicos/1.0' },
      signal: AbortSignal.timeout(15000),
    })

    if (apiRes.ok) {
      cnpjData = await apiRes.json() as Record<string, unknown>
      const descricaoSit = String(cnpjData.descricao_situacao_cadastral ?? '').toUpperCase()
      situacao = descricaoSit || 'DESCONHECIDA'
      ativo = situacao === 'ATIVA'
    } else if (apiRes.status === 404) {
      situacao = 'NAO_ENCONTRADO'
    } else {
      situacao = 'ERRO_API'
    }
  } catch {
    situacao = 'ERRO_TIMEOUT'
  }

  // Salva audit log (operação plana, sem transação)
  await prisma.cnpjAuditLog.create({
    data: {
      technicianId: profile.id,
      cnpj:         cnpjRaw,
      situacao,
      ativo,
      rawResponse:  cnpjData ? JSON.stringify(cnpjData) : null,
      ip:           ip ?? null,
    },
  })

  // Determina novo status
  const newStatus = ativo ? 'TECNICO_RESPONSAVEL_PENDENTE' : 'CNPJ_IRREGULAR'

  // Extrai dados relevantes do CNPJ para salvar no perfil
  const razaoSocial   = cnpjData ? String(cnpjData.razao_social ?? '').trim() : undefined
  const nomeFantasia  = cnpjData ? (String(cnpjData.nome_fantasia ?? '').trim() || razaoSocial) : undefined
  const cnpjFormatado = cnpjRaw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')

  // Atualiza perfil (operação plana)
  await prisma.technicianProfile.update({
    where: { id: profile.id },
    data: {
      cnpj:          cnpjFormatado,
      razaoSocial:   razaoSocial || profile.razaoSocial,
      nomeFantasia:  nomeFantasia || profile.nomeFantasia,
      cnpjData:      cnpjData ? JSON.stringify(cnpjData) : null,
      cnpjCheckedAt: new Date(),
      cnpjSituacao:  situacao,
      status:        newStatus,
    },
  })

  return NextResponse.json({
    ok:          true,
    ativo,
    situacao,
    cnpj:        cnpjFormatado,
    razaoSocial: razaoSocial ?? null,
    nomeFantasia: nomeFantasia ?? null,
    newStatus,
    data:        cnpjData,
  })
}
