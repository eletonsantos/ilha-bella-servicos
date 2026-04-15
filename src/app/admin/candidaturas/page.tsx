import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, UserCheck, MapPin, Wrench } from 'lucide-react'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants-tecnico'

export default async function AdminCandidaturasPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const applications = await prisma.technicianApplication.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  }).catch(() => [])

  const pending = applications.filter(a => a.status === 'PENDING')

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('pt-BR')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Candidaturas</h1>
          <p className="text-slate-500 text-sm mt-1">{applications.length} candidatura(s) recebida(s)</p>
        </div>
        {pending.length > 0 && (
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 font-bold text-sm px-4 py-2 rounded-full">
            <UserCheck size={14} />
            {pending.length} aguardando análise
          </span>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="card p-12 text-center">
          <UserCheck size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhuma candidatura recebida ainda.</p>
          <p className="text-slate-400 text-sm mt-1">Quando um técnico se cadastrar em /tecnico-parceiro, aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/admin/candidaturas/${app.id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-all group">
              <div className="flex-1 grid sm:grid-cols-5 gap-3 items-center">
                <div>
                  <p className="font-bold text-dark text-sm">{app.fullName}</p>
                  <p className="text-slate-400 text-xs">{fmtDate(app.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  <p className="text-sm text-slate-600">{app.cidade}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench size={12} className="text-slate-400" />
                  <p className="text-sm text-slate-600">{app.especialidadePrincipal}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${app.emiteNotaFiscal ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {app.emiteNotaFiscal ? 'Emite NF' : 'Sem NF'}
                  </span>
                  {app.atende24h && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit bg-blue-100 text-blue-700">24h</span>
                  )}
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${APPLICATION_STATUS_COLORS[app.status]}`}>
                    {APPLICATION_STATUS_LABELS[app.status]}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
