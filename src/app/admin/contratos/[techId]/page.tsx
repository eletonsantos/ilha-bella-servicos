import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, FileSignature, ShieldCheck, Building2,
  Calendar, Hash, Globe, CheckCircle2, AlertCircle,
  FileText, Pencil, type LucideIcon,
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
      closings: {
        orderBy: { createdAt: 'desc' },
        include: { invoice: true },
      },
    },
  })
  if (!tech) notFound()

  // Parseia snapshot do Contrato-Mãe
  let contratoSnapshot: Record<string, unknown> | null = null
  if (tech.masterContractData) {
    try { contratoSnapshot = JSON.parse(tech.masterContractData) } catch { /* ignore */ }
  }

  const clausulas: string[] = Array.isArray((contratoSnapshot as Record<string, unknown> | null)?.clausulas)
    ? (contratoSnapshot as { clausulas: string[] }).clausulas
    : []

  const auditExtra = (contratoSnapshot as Record<string, unknown> | null)?.auditExtra as Record<string, unknown> | undefined

  // Termos de fechamento assinados (invoice.contractData existe e tem contractSignedAt)
  const termosFechamento = tech.closings
    .filter(c => c.invoice?.contractSignedAt)
    .map(c => {
      let contractData: Record<string, unknown> | null = null
      if (c.invoice?.contractData) {
        try { contractData = JSON.parse(c.invoice.contractData) } catch { /* ignore */ }
      }
      return {
        closingId:    c.id,
        competence:   c.competence,
        totalValue:   c.totalValue,
        signedAt:     c.invoice!.contractSignedAt,
        signedName:   c.invoice!.contractSignedName,
        signedDoc:    c.invoice!.contractSignedDocument,
        invoiceNumber: c.invoice!.invoiceNumber,
        contractData,
      }
    })

  // Contagem total de contratos
  const totalContratos = (tech.masterContractSignedAt ? 1 : 0) + termosFechamento.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/contratos"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para contratos
        </Link>
        <Link
          href="/admin/contratos/editor"
          className="inline-flex items-center gap-2 text-sm text-brand-blue hover:underline"
        >
          <Pencil size={14} />
          Editar templates de contrato
        </Link>
      </div>

      {/* Header */}
      <div className="card-elevated p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
            {tech.masterContractSignedAt
              ? <ShieldCheck size={22} className="text-green-600" />
              : <AlertCircle size={22} className="text-amber-500" />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-dark">{tech.fullName}</h1>
            <p className="text-slate-400 text-sm">{tech.razaoSocial ?? tech.cnpj ?? 'Sem empresa'}</p>
            <p className="text-slate-400 text-xs mt-0.5">{totalContratos} contrato(s) registrado(s)</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
          </span>
          <Link href={`/admin/tecnicos/${tech.id}`} className="text-xs text-brand-blue hover:underline">
            Ver perfil completo →
          </Link>
        </div>
      </div>

      {/* ── CONTRATO-MÃE ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-dark flex items-center gap-2">
          <ShieldCheck size={16} className="text-green-600" />
          Contrato-Mãe
        </h2>

        {tech.masterContractSignedAt ? (
          <div className="card-elevated p-6 space-y-5 border-l-4 border-green-400">
            {/* Dados de assinatura */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                <CheckCircle2 size={12} /> Assinado
              </div>
              <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-1 rounded-full font-semibold">
                {CONTRACT_VERSION_LABELS[tech.masterContractVersion ?? ''] ?? tech.masterContractVersion}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Data de assinatura">
                {new Date(tech.masterContractSignedAt).toLocaleString('pt-BR')}
              </InfoRow>
              <InfoRow icon={FileSignature} label="Assinado por">
                {tech.masterContractSignedName ?? '—'}
              </InfoRow>
              <InfoRow icon={Hash} label="Documento">
                {tech.masterContractSignedDocument ?? '—'}
              </InfoRow>
              {!!auditExtra?.aceitante && (
                <InfoRow icon={Globe} label="IP de assinatura">
                  {String((auditExtra.aceitante as Record<string, string>).ip ?? '—')}
                </InfoRow>
              )}
              {!!contratoSnapshot?.audit && (
                <InfoRow icon={Hash} label="Hash SHA-256">
                  <span className="font-mono text-xs break-all">
                    {String((contratoSnapshot.audit as Record<string, string>).hash ?? '—').slice(0, 40)}...
                  </span>
                </InfoRow>
              )}
            </div>

            {/* Partes */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contratante</p>
                <p className="font-bold text-dark text-sm">{CONTRATANTE.razaoSocial}</p>
                <p className="text-xs text-slate-400">{CONTRATANTE.cnpj}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contratada</p>
                <p className="font-bold text-dark text-sm">{tech.razaoSocial ?? tech.fullName}</p>
                {tech.cnpj && <p className="text-xs text-slate-400">{tech.cnpj}</p>}
                {tech.cnpjSituacao && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                    tech.cnpjSituacao === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tech.cnpjSituacao}
                  </span>
                )}
              </div>
            </div>

            {/* Técnicos responsáveis */}
            {tech.providerTechnicians.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Técnico(s) responsável(is)</p>
                <div className="space-y-2">
                  {tech.providerTechnicians.map(t => (
                    <div key={t.id} className="flex items-start gap-2 bg-slate-50 rounded-lg p-3">
                      <Building2 size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-semibold text-dark">{t.nomeCompleto}</span>
                        <span className="text-slate-400 text-xs ml-2">{VINCULO_LABELS[t.vinculo] ?? t.vinculo} · {t.especialidade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cláusulas */}
            {clausulas.length > 0 && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-brand-blue hover:underline list-none flex items-center gap-1">
                  <FileText size={14} />
                  Ver {clausulas.length} cláusulas do contrato
                  <span className="text-xs text-slate-400 ml-1 group-open:hidden">▼</span>
                  <span className="text-xs text-slate-400 ml-1 hidden group-open:inline">▲</span>
                </summary>
                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto border-l-2 border-slate-100 pl-4">
                  {clausulas.map((c, i) => (
                    <pre key={i} className="whitespace-pre-wrap font-sans text-xs text-slate-600 leading-relaxed">{c}</pre>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="card-elevated p-5 flex items-center gap-3 text-sm text-amber-700 bg-amber-50 border border-amber-200">
            <AlertCircle size={16} />
            Contrato-Mãe ainda não assinado por este prestador.
          </div>
        )}
      </section>

      {/* ── TERMOS DE FECHAMENTO ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-dark flex items-center gap-2">
          <FileText size={16} className="text-brand-blue" />
          Termos Mensais de Fechamento
          <span className="text-xs font-normal text-slate-400">({termosFechamento.length})</span>
        </h2>

        {termosFechamento.length > 0 ? (
          <div className="space-y-3">
            {termosFechamento.map(t => {
              const assinatura = (t.contractData as Record<string, unknown> | null)?.assinatura as Record<string, unknown> | undefined
              const auditoria  = (t.contractData as Record<string, unknown> | null)?.auditoria as Record<string, unknown> | undefined
              return (
                <div key={t.closingId} className="card-elevated p-5 border-l-4 border-brand-blue/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="font-bold text-dark text-sm">Termo — {t.competence}</span>
                      {t.invoiceNumber && (
                        <span className="text-xs text-slate-400">NF nº {t.invoiceNumber}</span>
                      )}
                    </div>
                    <Link
                      href={`/admin/fechamentos/${t.closingId}`}
                      className="text-xs text-brand-blue hover:underline"
                    >
                      Ver fechamento →
                    </Link>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <InfoRow icon={Calendar} label="Assinado em">
                      {t.signedAt ? new Date(t.signedAt).toLocaleString('pt-BR') : '—'}
                    </InfoRow>
                    <InfoRow icon={FileSignature} label="Assinado por">
                      {t.signedName ?? '—'}
                    </InfoRow>
                    <InfoRow icon={Hash} label="Valor">
                      R$ {t.totalValue.toFixed(2).replace('.', ',')}
                    </InfoRow>
                    {!!assinatura?.nome && (
                      <InfoRow icon={FileSignature} label="Nome declarado">
                        {String(assinatura.nome)}
                      </InfoRow>
                    )}
                    {!!auditoria?.ip && (
                      <InfoRow icon={Globe} label="IP de assinatura">
                        {String(auditoria.ip)}
                      </InfoRow>
                    )}
                    {!!auditoria?.hash && (
                      <InfoRow icon={Hash} label="Hash SHA-256">
                        <span className="font-mono text-xs">
                          {String(auditoria.hash).slice(0, 32)}...
                        </span>
                      </InfoRow>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card-elevated p-5 text-sm text-slate-400 text-center">
            Nenhum Termo de Fechamento assinado ainda.
          </div>
        )}
      </section>
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
