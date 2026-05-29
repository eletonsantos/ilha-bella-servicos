import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, ShieldOff, AlertCircle, FileText, User } from 'lucide-react'
import {
  PROFILE_STATUS_LABELS,
  PROFILE_STATUS_COLORS,
  PIX_KEY_TYPE_LABELS,
} from '@/lib/constants-tecnico'
import { CONTRACT_VERSION_LABELS } from '@/lib/contrato-mae'
import TecnicoStatusActions from './TecnicoStatusActions'
import EditarCadastroWrapper from './EditarCadastroWrapper'
import TabelaValoresUpload from './TabelaValoresUpload'
import DeleteTecnicoButton from './DeleteTecnicoButton'
import CredenciaisCard from './CredenciaisCard'

interface Props {
  params: { id: string }
}

const VINCULO_LABELS: Record<string, string> = {
  SOCIO:            'Sócio',
  REPRESENTANTE:    'Representante Legal',
  EMPREGADO:        'Empregado',
  PARCEIRO:         'Parceiro',
  PREPOSTO:         'Preposto',
  TECNICO_INDICADO: 'Técnico indicado',
}

export default async function AdminTecnicoDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: params.id },
    include: {
      user:               { select: { email: true, name: true } },
      closings:           { orderBy: { createdAt: 'desc' }, take: 5 },
      providerTechnicians: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!tech) notFound()

  // Tenta parsear cnpjData para exibição
  let cnpjDataParsed: Record<string, unknown> | null = null
  if (tech.cnpjData) {
    try { cnpjDataParsed = JSON.parse(tech.cnpjData) } catch { /* ignore */ }
  }

  const fields = [
    { label: 'Nome completo',  value: tech.fullName },
    { label: 'CPF',            value: tech.cpf },
    { label: 'Telefone',       value: tech.phone },
    { label: 'E-mail',         value: tech.email },
    { label: 'Cidade',         value: tech.city },
    { label: 'Chave Pix',      value: `${tech.pixKey} (${PIX_KEY_TYPE_LABELS[tech.pixKeyType] ?? tech.pixKeyType})` },
    { label: 'CNPJ',           value: tech.cnpj ?? '—' },
    { label: 'Razão Social',   value: tech.razaoSocial ?? '—' },
    { label: 'Nome Fantasia',  value: tech.nomeFantasia ?? '—' },
    { label: 'Login IA Assist',value: tech.iaAssistLogin ?? '—' },
    { label: 'Tipo de contratação', value: { PJ_TERCEIRIZADO: 'Terceirizado PJ', AUTONOMO: 'Autônomo', CLT: 'CLT' }[tech.contractType ?? 'AUTONOMO'] ?? '—' },
    { label: 'Cadastrado em',  value: new Date(tech.createdAt).toLocaleDateString('pt-BR') },
  ]

  const isHomologado = tech.status === 'HOMOLOGADO_ATIVO'
  const isBloqueado  = ['BLOQUEADO', 'BLOQUEADO_PAGAMENTO', 'INATIVO'].includes(tech.status)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Voltar */}
      <Link
        href="/admin/tecnicos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para técnicos
      </Link>

      {/* Header com status */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-dark">{tech.fullName}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{tech.user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {isHomologado && <ShieldCheck size={18} className="text-green-500" />}
          {isBloqueado  && <ShieldOff   size={18} className="text-red-500" />}
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
          </span>
        </div>
      </div>

      {/* Observações do admin */}
      {tech.adminNotes && (
        <div className="card p-5 border-l-4 border-amber-400">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Observações do admin</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{tech.adminNotes}</p>
        </div>
      )}

      {/* Dados do cadastro */}
      <div className="card p-6">
        <EditarCadastroWrapper
          fields={fields}
          tech={{
            id:           tech.id,
            fullName:     tech.fullName,
            cpf:          tech.cpf,
            phone:        tech.phone,
            email:        tech.email,
            city:         tech.city,
            pixKey:       tech.pixKey,
            pixKeyType:   tech.pixKeyType,
            iaAssistLogin:tech.iaAssistLogin,
            cnpj:         tech.cnpj,
            razaoSocial:  tech.razaoSocial,
            contractType: tech.contractType,
          }}
        />
      </div>

      {/* ── Seção de Homologação ─────────────────────────────────────────── */}
      {(tech.cnpj || tech.providerTechnicians.length > 0 || tech.masterContractSignedAt) && (
        <div className="card p-6 space-y-5">
          <h2 className="text-base font-bold text-dark flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-blue" />
            Homologação PJ
          </h2>

          {/* CNPJ status */}
          {tech.cnpj && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">CNPJ</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="font-mono font-bold text-dark">{tech.cnpj}</span>
                {tech.cnpjSituacao && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    tech.cnpjSituacao === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tech.cnpjSituacao}
                  </span>
                )}
                {tech.cnpjCheckedAt && (
                  <span className="text-slate-400 text-xs">
                    Consultado em {new Date(tech.cnpjCheckedAt).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              {cnpjDataParsed && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                  {!!cnpjDataParsed.razao_social  && <span><b>Razão Social:</b> {String(cnpjDataParsed.razao_social)}</span>}
                  {!!cnpjDataParsed.nome_fantasia && <span><b>Fantasia:</b> {String(cnpjDataParsed.nome_fantasia)}</span>}
                  {!!cnpjDataParsed.municipio     && <span><b>Município:</b> {String(cnpjDataParsed.municipio)}/{String(cnpjDataParsed.uf ?? '')}</span>}
                  {!!cnpjDataParsed.cnae_fiscal_descricao && (
                    <span className="col-span-2"><b>CNAE:</b> {String(cnpjDataParsed.cnae_fiscal_descricao)}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Técnico responsável */}
          {tech.providerTechnicians.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <User size={12} /> Técnico(s) responsável(is)
              </p>
              {tech.providerTechnicians.map((t) => (
                <div key={t.id} className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark">{t.nomeCompleto}</span>
                    {t.isPrincipal && (
                      <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-medium">
                        Principal
                      </span>
                    )}
                    {t.isRepLegal && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        Rep. Legal
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500 mt-1">
                    <span>CPF: {t.cpf}</span>
                    <span>Telefone: {t.telefone}</span>
                    <span>E-mail: {t.email}</span>
                    <span>Cidade: {t.cidade}/{t.uf}</span>
                    <span>Função: {t.funcao}</span>
                    <span>Especialidade: {t.especialidade}</span>
                    <span>Vínculo: {VINCULO_LABELS[t.vinculo] ?? t.vinculo}</span>
                    <span>Declaração aceita: {t.declaracaoAceita ? '✓ Sim' : '✗ Não'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contrato-Mãe */}
          {tech.masterContractSignedAt ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide flex items-center gap-1">
                <FileText size={12} /> Contrato-Mãe assinado
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-600 mt-1">
                <span><b>Versão:</b> {CONTRACT_VERSION_LABELS[tech.masterContractVersion ?? ''] ?? tech.masterContractVersion}</span>
                <span><b>Data:</b> {new Date(tech.masterContractSignedAt).toLocaleString('pt-BR')}</span>
                <span><b>Assinado por:</b> {tech.masterContractSignedName}</span>
                <span><b>Documento:</b> {tech.masterContractSignedDocument}</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle size={16} />
              Contrato-Mãe ainda não assinado
            </div>
          )}
        </div>
      )}

      {/* Credenciais de Acesso */}
      <CredenciaisCard techId={tech.id} cpf={tech.cpf} />

      {/* Tabela de Valores */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-dark mb-1">Tabela de Valores</h2>
        <p className="text-sm text-slate-400 mb-4">
          Suba o PDF com a tabela de preços deste técnico. Ele poderá visualizar diretamente no painel.
        </p>
        <TabelaValoresUpload
          techId={tech.id}
          tabelaName={tech.tabelaValoresName ?? null}
          tabelaSize={tech.tabelaValoresSize ?? null}
        />
      </div>

      {/* Ações de status */}
      <TecnicoStatusActions techId={tech.id} currentStatus={tech.status} />

      {/* Excluir técnico */}
      <DeleteTecnicoButton techId={tech.id} techName={tech.fullName} />
    </div>
  )
}
