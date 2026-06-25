import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileSignature, ShieldCheck, Clock, ChevronRight,
  AlertCircle, CheckCircle2, Users, Pencil, FileText,
} from 'lucide-react'
import { PROFILE_STATUS_LABELS, PROFILE_STATUS_COLORS } from '@/lib/constants-tecnico'
import PageHeader from '@/components/tecnico/PageHeader'

export default async function AdminContratosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  // Busca todos os técnicos com contagem de contratos de fechamento
  const technicians = await prisma.technicianProfile.findMany({
    orderBy: { fullName: 'asc' },
    select: {
      id:                     true,
      fullName:               true,
      cnpj:                   true,
      razaoSocial:            true,
      contractType:           true,
      status:                 true,
      masterContractSignedAt: true,
      closings: {
        where: {
          invoice: { contractSignedAt: { not: null } },
        },
        select: { id: true },
      },
    },
  })

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('pt-BR')

  const comContrato    = technicians.filter(t => t.masterContractSignedAt || t.closings.length > 0)
  const semContrato    = technicians.filter(t => !t.masterContractSignedAt && t.closings.length === 0)
  const totalContratos = technicians.reduce(
    (sum, t) => sum + (t.masterContractSignedAt ? 1 : 0) + t.closings.length,
    0,
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <PageHeader
        icon={FileSignature}
        title="Contratos"
        subtitle={`${totalContratos} contrato(s) assinado(s) · ${technicians.length} técnico(s)`}
        variant="gold"
        action={
          <Link
            href="/admin/contratos/editor"
            className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-brand-blue/25 hover:shadow-lg transition-all"
          >
            <Pencil size={15} />
            Editar modelos de contrato
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{totalContratos}</p>
            <p className="text-slate-400 text-xs">Contratos assinados</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
            <Users size={20} className="text-brand-blue" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{comContrato.length}</p>
            <p className="text-slate-400 text-xs">Com contratos</p>
          </div>
        </div>
        <div className="card-elevated p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-dark">{semContrato.length}</p>
            <p className="text-slate-400 text-xs">Sem contratos</p>
          </div>
        </div>
      </div>

      {/* ── Técnicos com contratos ── */}
      {comContrato.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-dark mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" />
            Técnicos com contratos assinados
          </h2>
          <div className="space-y-2">
            {comContrato.map(tech => {
              const totalTech = (tech.masterContractSignedAt ? 1 : 0) + tech.closings.length
              return (
                <Link
                  key={tech.id}
                  href={`/admin/contratos/${tech.id}`}
                  className="card-elevated p-4 flex items-center gap-4 hover:shadow-md transition-all group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={18} className="text-green-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 grid sm:grid-cols-4 gap-3 items-center min-w-0">
                    <div className="min-w-0">
                      <p className="font-bold text-dark text-sm truncate">{tech.fullName}</p>
                      <p className="text-slate-400 text-xs truncate">{tech.razaoSocial ?? tech.cnpj ?? '—'}</p>
                    </div>

                    {/* Contrato-Mãe */}
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Contrato-Mãe</p>
                      {tech.masterContractSignedAt ? (
                        <p className="text-xs font-semibold text-green-700">
                          ✓ {fmtDate(tech.masterContractSignedAt)}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">Não assinado</p>
                      )}
                    </div>

                    {/* Termos mensais */}
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Termos mensais</p>
                      <div className="flex items-center gap-1.5">
                        <FileText size={12} className="text-brand-blue" />
                        <span className="text-sm font-bold text-dark">{tech.closings.length}</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                        {totalTech} contrato{totalTech !== 1 ? 's' : ''}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue transition-colors flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Técnicos sem contratos ── */}
      {semContrato.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-dark mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            Técnicos sem contratos
          </h2>
          <div className="space-y-2">
            {semContrato.map(tech => (
              <Link
                key={tech.id}
                href={`/admin/contratos/${tech.id}`}
                className="card-elevated p-4 flex items-center gap-4 hover:shadow-md transition-all group opacity-75"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-slate-400" />
                </div>
                <div className="flex-1 grid sm:grid-cols-3 gap-3 items-center min-w-0">
                  <div className="min-w-0">
                    <p className="font-bold text-dark text-sm truncate">{tech.fullName}</p>
                    <p className="text-slate-400 text-xs truncate">{tech.razaoSocial ?? tech.cnpj ?? '—'}</p>
                  </div>
                  <div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PROFILE_STATUS_COLORS[tech.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {PROFILE_STATUS_LABELS[tech.status] ?? tech.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Nenhum contrato assinado ainda</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {technicians.length === 0 && (
        <div className="card-elevated p-12 text-center">
          <FileSignature size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum técnico cadastrado ainda.</p>
        </div>
      )}
    </div>
  )
}
