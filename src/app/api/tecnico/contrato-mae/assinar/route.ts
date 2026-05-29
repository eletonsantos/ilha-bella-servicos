import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createHash, randomUUID } from 'crypto'
import {
  generateContratoMae,
  CURRENT_CONTRACT_VERSION,
  CONTRATANTE,
} from '@/lib/contrato-mae'

const schema = z.object({
  signerName:     z.string().min(3),
  signerDocument: z.string().min(11),
  declaracaoAceita: z.boolean().refine(v => v === true, 'Declaração de aceite é obrigatória'),
})

function extractIP(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return 'unknown'
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      providerTechnicians: {
        where: { isPrincipal: true },
        take: 1,
      },
    },
  })

  if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  // Garante que o contrato ainda não foi assinado (ou está pendente)
  if (
    profile.status !== 'CONTRATO_MAE_PENDENTE' &&
    profile.status !== 'CADASTRO_INICIADO' &&
    profile.status !== 'TECNICO_RESPONSAVEL_PENDENTE'
  ) {
    // Permite re-assinatura se já existia mas quer re-assinar após nova versão
    if (profile.masterContractVersion === CURRENT_CONTRACT_VERSION && profile.masterContractSignedAt) {
      return NextResponse.json({ error: 'Contrato já assinado nesta versão' }, { status: 409 })
    }
  }

  const ip         = extractIP(req)
  const ua         = req.headers.get('user-agent') ?? 'unknown'
  const signedAt   = new Date()
  const documentId = randomUUID()

  // Extrai dados do CNPJ armazenado
  let cnpjDataParsed: Record<string, unknown> = {}
  if (profile.cnpjData) {
    try { cnpjDataParsed = JSON.parse(profile.cnpjData) } catch { /* ignore */ }
  }

  const tecnicoResp = profile.providerTechnicians[0]

  // Gera hash do evento de assinatura
  const hashInput = [
    profile.razaoSocial ?? profile.fullName,
    profile.cnpj ?? '',
    parsed.data.signerName,
    parsed.data.signerDocument,
    signedAt.toISOString(),
    ip,
    CURRENT_CONTRACT_VERSION,
  ].join('|')
  const documentHash = createHash('sha256').update(hashInput).digest('hex')

  // Monta parâmetros do contrato
  const params = {
    razaoSocialContratado:    profile.razaoSocial     ?? profile.fullName,
    nomeFantasiaContratado:   profile.nomeFantasia     ?? profile.razaoSocial ?? profile.fullName,
    cnpjContratado:           profile.cnpj             ?? '',
    situacaoCadastral:        profile.cnpjSituacao     ?? 'ATIVA',
    cnaePrincipal:            cnpjDataParsed.cnae_fiscal_descricao
                                ? String(cnpjDataParsed.cnae_fiscal_descricao)
                                : String(cnpjDataParsed.cnae_fiscal ?? 'Serviços técnicos especializados'),
    enderecoContratado: [
      cnpjDataParsed.logradouro,
      cnpjDataParsed.numero,
      cnpjDataParsed.municipio,
      cnpjDataParsed.uf,
    ].filter(Boolean).join(', ') || profile.city,
    representanteLegalNome:   parsed.data.signerName,
    representanteLegalCpf:    parsed.data.signerDocument,
    tecnicoNome:         tecnicoResp?.nomeCompleto  ?? parsed.data.signerName,
    tecnicoCpf:          tecnicoResp?.cpf            ?? parsed.data.signerDocument,
    tecnicoTelefone:     tecnicoResp?.telefone       ?? profile.phone,
    tecnicoEmail:        tecnicoResp?.email          ?? profile.email,
    tecnicoEspecialidade: tecnicoResp?.especialidade ?? 'Serviços técnicos especializados',
    signedAt:     signedAt.toISOString(),
    ip,
    documentId,
    documentHash,
    contractVersion: CURRENT_CONTRACT_VERSION,
  }

  const contratoSnapshot = generateContratoMae(params)

  // Adiciona auditoria completa ao snapshot
  const contratoData = {
    ...contratoSnapshot,
    auditExtra: {
      userAgent: ua,
      userId:    session.user.id,
      profileId: profile.id,
      aceitante: {
        nome:      parsed.data.signerName,
        documento: parsed.data.signerDocument,
        ip,
        ua,
      },
      contratante: CONTRATANTE,
    },
  }

  // Atualiza o perfil com dados do contrato assinado (operação plana)
  await prisma.technicianProfile.update({
    where: { id: profile.id },
    data: {
      masterContractVersion:    CURRENT_CONTRACT_VERSION,
      masterContractSignedAt:   signedAt,
      masterContractSignedName: parsed.data.signerName,
      masterContractSignedDocument: parsed.data.signerDocument,
      masterContractData:       JSON.stringify(contratoData),
      status:                   'CONTRATO_MAE_ASSINADO',
    },
  })

  return NextResponse.json({
    ok:          true,
    documentId,
    signedAt:    signedAt.toISOString(),
    hash:        documentHash,
    version:     CURRENT_CONTRACT_VERSION,
    newStatus:   'CONTRATO_MAE_ASSINADO',
  })
}
