import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileSignature, ShieldCheck, Building2, User,
  Calendar, Hash, Globe, CheckCircle2, AlertCircle,
  type LucideIcon,
} from 'lucide-react'
import { CONTRACT_VERSION_LABELS, CONTRATANTE } from '@/lib/contrato-mae'
import { PROFILE_STATUS_LABELS, PROFILE_STATUS_COLORS } from '@/lib/constants-tecnico'

interface Props { params: { techId: string } }

const VINCULO_LABELS: Record<string, string> = {
  SOCIO:            'Sócio',
  REPRESENTANTE:    'Representante Legal',
  EMPREGADO:        'Empregado CLT',
  PARCEIRO:         'Parceiro técnico',
  PREPOSTO:         'Preposto',
  TECNICO_INDICADO: 'Técnico indicado',
}

export default async function AdminContratoDetalhe({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: params.techId },
    include: {
      providerTechnicians: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!tech) notFound()

  // Parseia snapshot do contrato
  let contratoSnapshot: Record<string, unknown> | null = null
  if (tech.masterContractData) {
    try { contratoSnapshot = JSON.parse(tech.masterContractData) } catch { /* ignore */ }
  }

  // Clausulas do contrato (se disponíveis no snapshot)
  const clausulas: string[] = Array.isArray((contratoSnapshot as Record<string, unknown> | null)?.clausulas)
    ? (contratoSnapshot as { clausulas: string[] }).clausulas
    : []

  const auditExtra = (contratoSnapshot as Record<string, unknown> | null)?.auditExtra as Record<string, unknown> | undefined

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/contratos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para contratos
      </Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
            {tech.masterContractSignedAt
              ? <ShieldCheck size={22} className="text-green-600" />
              : <AlertCircle size={22} className="text-amber-500" />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-dark">{tech.fullName}</h1>
            <p className="text-slate-400 text-sm">{tech.razaoSocial ?? tech.cnpj ?? 'Sem empresa'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
          </span>
          <Link
            href={`/admin/tecnicos/${tech.id}`}
            className="text-xs text-brand-blue hover:underline"
          >
            Ver perfil completo →
          </Link>
        </div>
      </div>

      {/* ── Histórico de contratos ── */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
          <FileSignature size={16} className="text-brand-blue" />
          Histórico de contratos
        </h2>

        {tech.masterContractSignedAt ? (
          <div className="space-y-4">
            {/* Contrato atual */}
            <div className="border border-green-200 bg-green-50/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="font-bold text-dark text-sm">Contrato-Mãe assinado</span>
                  <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-semibold">
                    {CONTRACT_VERSION_LABELS[tech.masterContractVersion ?? ''] ?? tech.masterContractVersion ?? '—'}
                  </span>
                </div>
              </div>

              {/* Dados de assinatura */}
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoRow icon={Calendar} label="Data de assinatura">
                  {new Date(tech.masterContractSignedAt).toLocaleString('pt-BR')}
                </InfoRow>
                <InfoRow icon={User} label="Assinado por">
                  {tech.masterContractSignedName ?? '—'}
                </InfoRow>
                <InfoRow icon={Hash} label="Documento do assinante">
                  {tech.masterContractSignedDocument ?? '—'}
                </InfoRow>
                <InfoRow icon={Globe} label="Versão do contrato">
                  {tech.masterContractVersion ?? '—'}
                </InfoRow>
                {!!auditExtra?.aceitante && (
                  <InfoRow icon={Globe} label="IP de assinatura">
                    {String((auditExtra.aceitante as Record<string, string>).ip ?? '—')}
                  </InfoRow>
                )}
                {!!contratoSnapshot?.audit && (
                  <InfoRow icon={Hash} label="Hash SHA-256">
                    <span className="font-mono text-xs break-all">
                      {String((contratoSnapshot.audit as Record<string, string>).hash ?? '—').slice(0, 32)}...
                    </span>
                  </InfoRow>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <AlertCircle size={16} />
            Contrato-Mãe ainda não assinado por este prestador.
          </div>
        )}
      </div>

      {/* ── Partes do contrato ── */}
      {tech.masterContractSignedAt && (
        <div className="card p-6 space-y-5">
          <h2 className="text-base font-bold text-dark">Partes do contrato</h2>

          {/* Contratante */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contratante</p>
            <p className="font-bold text-dark">{CONTRATANTE.razaoSocial}</p>
            <p className="text-sm text-slate-600">{CONTRATANTE.nomeFantasia}</p>
            <p className="text-xs text-slate-400 mt-1">CNPJ {CONTRATANTE.cnpj}</p>
            <p className="text-xs text-slate-400">{CONTRATANTE.endereco}</p>
            <p className="text-xs text-slate-400">Rep. Legal: {CONTRATANTE.representanteLegal}</p>
          </div>

          {/* Contratada */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contratada</p>
            <p className="font-bold text-dark">{tech.razaoSocial ?? tech.fullName}</p>
            {tech.nomeFantasia && <p className="text-sm text-slate-600">{tech.nomeFantasia}</p>}
            {tech.cnpj && <p className="text-xs text-slate-400 mt-1">CNPJ {tech.cnpj}</p>}
            {tech.cnpjSituacao && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                tech.cnpjSituacao === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {tech.cnpjSituacao}
              </span>
            )}
          </div>

          {/* Técnico responsável */}
          {tech.providerTechnicians.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Técnico(s) responsável(is)
              </p>
              {tech.providerTechnicians.map(t => (
                <div key={t.id} className="flex items-start gap-3">
                  <Building2 size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-dark text-sm">{t.nomeCompleto}</p>
                    <p className="text-xs text-slate-500">
                      {VINCULO_LABELS[t.vinculo] ?? t.vinculo} · {t.especialidade}
                    </p>
                    <div className="flex gap-2 mt-0.5">
                      {t.isPrincipal && (
                        <span className="text-xs bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded font-medium">Principal</span>
                      )}
                      {t.isRepLegal && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Rep. Legal</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Cláusulas do contrato ── */}
      {clausulas.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
            <FileSignature size={16} className="text-brand-blue" />
            Texto completo do contrato ({clausulas.length} cláusulas)
          </h2>
          <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
            {clausulas.map((clausula, i) => (
              <div key={i} className="border-l-2 border-brand-blue/20 pl-4">
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-600 leading-relaxed">
                  {clausula}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-dark">{children}</p>
      </div>
    </div>
  )
}
