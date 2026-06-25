import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { CONTRATANTE, CONTRACT_VERSION_LABELS } from '@/lib/contrato-mae'
import PrintButton from './PrintButton'

interface Props { params: { techId: string } }

export default async function ContratoMaeImprimirPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: params.techId },
    include: { providerTechnicians: { orderBy: { createdAt: 'asc' } } },
  })
  if (!tech) notFound()
  if (!tech.masterContractSignedAt) notFound()

  // Snapshot do contrato assinado
  let snap: Record<string, unknown> | null = null
  if (tech.masterContractData) {
    try { snap = JSON.parse(tech.masterContractData) } catch { /* ignore */ }
  }

  const contratante = (snap?.contratante as Record<string, unknown> | undefined) ?? CONTRATANTE
  const clausulas: string[] = Array.isArray(snap?.clausulas) ? (snap!.clausulas as string[]) : []
  const audit = snap?.audit as Record<string, unknown> | undefined
  const auditExtra = snap?.auditExtra as Record<string, unknown> | undefined
  const aceitanteIp = (auditExtra?.aceitante as Record<string, string> | undefined)?.ip
    ?? (audit?.ip as string | undefined)

  const isPJ = tech.contractType === 'PJ_TERCEIRIZADO' || !!tech.cnpj
  const signedAt = new Date(tech.masterContractSignedAt).toLocaleString('pt-BR')
  const versionLabel = CONTRACT_VERSION_LABELS[tech.masterContractVersion ?? ''] ?? tech.masterContractVersion
  const hash = audit?.hash as string | undefined

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/admin/contratos/${tech.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8 print:shadow-none print:border-0">

        {/* Cabeçalho */}
        <div className="text-center border-b border-slate-200 pb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield size={24} className="text-brand-blue" />
            <h1 className="text-xl font-extrabold text-dark uppercase tracking-wide">
              {isPJ
                ? 'Contrato de Prestação de Serviços (Contrato-Mãe)'
                : 'Termo de Prestação de Serviços Autônomos'}
            </h1>
          </div>
          <p className="text-slate-500 text-sm">{tech.fullName}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
            ✓ Assinado eletronicamente em {signedAt}
          </div>
          {versionLabel && (
            <p className="text-xs text-slate-400 mt-2">Versão: {versionLabel}</p>
          )}
        </div>

        {/* CONTRATANTE */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-3">CONTRATANTE</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p><span className="font-semibold text-slate-500">Razão Social:</span> {String(contratante.razaoSocial)}</p>
            <p><span className="font-semibold text-slate-500">Nome Fantasia:</span> {String(contratante.nomeFantasia)}</p>
            <p><span className="font-semibold text-slate-500">CNPJ:</span> {String(contratante.cnpj)}</p>
            <p><span className="font-semibold text-slate-500">Representante Legal:</span> {String(contratante.representanteLegal)}</p>
            <p className="sm:col-span-2"><span className="font-semibold text-slate-500">Endereço:</span> {String(contratante.endereco)}</p>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* CONTRATADO */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-3">
            CONTRATADO {isPJ ? '(Pessoa Jurídica)' : '(Pessoa Física Autônoma)'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {isPJ ? (
              <>
                <p><span className="font-semibold text-slate-500">Razão Social:</span> {tech.razaoSocial ?? tech.fullName}</p>
                {tech.nomeFantasia && (
                  <p><span className="font-semibold text-slate-500">Nome Fantasia:</span> {tech.nomeFantasia}</p>
                )}
                <p><span className="font-semibold text-slate-500">CNPJ:</span> {tech.cnpj ?? '—'}</p>
                <p><span className="font-semibold text-slate-500">Representante Legal:</span> {tech.masterContractSignedName ?? tech.fullName}</p>
                {tech.cnpjSituacao && (
                  <p><span className="font-semibold text-slate-500">Situação Receita:</span> {tech.cnpjSituacao}</p>
                )}
              </>
            ) : (
              <>
                <p><span className="font-semibold text-slate-500">Nome Completo:</span> {tech.masterContractSignedName ?? tech.fullName}</p>
                <p><span className="font-semibold text-slate-500">CPF:</span> {tech.masterContractSignedDocument ?? tech.cpf}</p>
              </>
            )}
          </div>

          {/* Técnicos responsáveis */}
          {tech.providerTechnicians.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">Técnico(s) responsável(is):</p>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {tech.providerTechnicians.map(t => (
                  <li key={t.id}>{t.nomeCompleto} — {t.especialidade}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <hr className="border-slate-100" />

        {/* CLÁUSULAS */}
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-3">CLÁUSULAS E CONDIÇÕES</h2>
          {clausulas.length > 0 ? (
            <div className="space-y-4">
              {clausulas.map((c, i) => (
                <pre key={i} className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">{c}</pre>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              O texto integral das cláusulas não foi armazenado no snapshot deste contrato.
            </p>
          )}
        </section>

        {/* ASSINATURA */}
        <hr className="border-slate-100" />
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-blue mb-4">ASSINATURA ELETRÔNICA</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">CONTRATANTE</p>
              <p className="font-bold text-dark">{String(contratante.nomeFantasia)}</p>
              <p className="text-sm text-slate-600">CNPJ: {String(contratante.cnpj)}</p>
              <p className="text-sm text-slate-600">Rep.: {String(contratante.representanteLegal)}</p>
            </div>
            <div className="border border-green-200 bg-green-50/50 rounded-xl p-5 space-y-2">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">CONTRATADO — ASSINADO ELETRONICAMENTE</p>
              <p className="font-bold text-dark">{tech.masterContractSignedName ?? tech.fullName}</p>
              <p className="text-sm text-slate-600">{isPJ ? 'CNPJ' : 'CPF'}: {tech.masterContractSignedDocument ?? (isPJ ? tech.cnpj : tech.cpf)}</p>
              <p className="text-xs text-green-700 font-semibold">✓ Assinado em {signedAt}</p>
              {aceitanteIp && (
                <p className="text-xs text-slate-500">IP: {aceitanteIp}</p>
              )}
              {hash && (
                <p className="text-xs text-slate-500 font-mono break-all">Hash: {hash.slice(0, 48)}…</p>
              )}
            </div>
          </div>
        </section>

        {/* Rodapé legal */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
          <p>Este documento foi gerado e assinado eletronicamente pela plataforma Ilha Bella Serviços.</p>
          <p>Validade jurídica nos termos da Lei nº 14.063/2020 e MP nº 2.200-2/2001.</p>
        </div>
      </div>
    </div>
  )
}
