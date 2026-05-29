import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileSignature, ShieldCheck, Clock, ChevronRight, Building2,
  AlertCircle, CheckCircle2, Users,
} from 'lucide-react'
import { PROFILE_STATUS_LABELS, PROFILE_STATUS_COLORS } from '@/lib/constants-tecnico'
import { CONTRACT_VERSION_LABELS } from '@/lib/contrato-mae'

export default async function AdminContratosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const technicians = await prisma.technicianProfile.findMany({
    orderBy: { fullName: 'asc' },
    select: {
      id:                       true,
      fullName:                 true,
      cpf:                      true,
      cnpj:                     true,
      razaoSocial:              true,
      nomeFantasia:             true,
      contractType:             true,
      status:                   true,
      cnpjSituacao:             true,
      masterContractVersion:    true,
      masterContractSignedAt:   true,
      masterContractSignedName: true,
      masterContractSignedDocument: true,
      createdAt:                true,
      providerTechnicians: {
        select: {
          nomeCompleto:  true,
          especialidade: true,
          vinculo:       true,
          isPrincipal:   true,
        },
      },
    },
  })

  const signed   = technicians.filter(t => t.masterContractSignedAt)
  const pending  = technicians.filter(t => !t.masterContractSignedAt && t.contractType === 'PJ_TERCEIRIZADO')
  const autonomo = technicians.filter(t => !t.masterContractSignedAt && t.contractType !== 'PJ_TERCEIRIZADO')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark flex items-center gap-2">
            <FileSignature size={22} className="text-brand-blue" />
            Contratos-Mãe
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {signed.length} contrato(s) assinado(s) · {pending.length} pendente(s)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{signed.length}</p>
            <p className="text-slate-400 text-xs">Assinados</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{pending.length}</p>
            <p className="text-slate-400 text-xs">PJ pendentes</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
            <Users size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{technicians.length}</p>
            <p className="text-slate-400 text-xs">Total técnicos</p>
          </div>
        </div>
      </div>

      {/* ── Contratos assinados ── */}
      {signed.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-dark mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" />
            Contratos assinados
          </h2>
          <div className="space-y-3">
            {signed.map(tech => (
              <Link
                key={tech.id}
                href={`/admin/contratos/${tech.id}`}
                className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={18} className="text-green-600" />
                </div>

                {/* Info */}
                <div className="flex-1 grid sm:grid-cols-4 gap-3 items-center min-w-0">
                  <div className="min-w-0">
                    <p className="font-bold text-dark text-sm truncate">{tech.fullName}</p>
                    <p className="text-slate-400 text-xs truncate">{tech.razaoSocial ?? tech.cnpj ?? 'Sem CNPJ'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Versão</p>
                    <span className="text-xs font-semibold bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full">
                      {CONTRACT_VERSION_LABELS[tech.masterContractVersion ?? ''] ?? tech.masterContractVersion ?? '—'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Assinado em</p>
                    <p className="text-sm font-semibold text-dark">
                      {new Date(tech.masterContractSignedAt!).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tech.masterContractSignedAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── PJ pendentes ── */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-dark mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            PJ — contrato pendente
          </h2>
          <div className="space-y-3">
            {pending.map(tech => (
              <Link
                key={tech.id}
                href={`/admin/tecnicos/${tech.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-all group opacity-80"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-amber-500" />
                </div>
                <div className="flex-1 grid sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <p className="font-bold text-dark text-sm">{tech.fullName}</p>
                    <p className="text-slate-400 text-xs">{tech.cnpj ?? 'CNPJ não informado'}</p>
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Cadastrado em {new Date(tech.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {signed.length === 0 && pending.length === 0 && (
        <div className="card p-12 text-center">
          <FileSignature size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum contrato registrado ainda.</p>
        </div>
      )}
    </div>
  )
}
