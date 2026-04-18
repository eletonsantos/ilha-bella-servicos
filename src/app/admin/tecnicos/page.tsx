import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PROFILE_STATUS_LABELS, PROFILE_STATUS_COLORS } from '@/lib/constants-tecnico'
import { Users, ChevronRight, UserPlus } from 'lucide-react'

export default async function AdminTecnicosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const technicians = await prisma.technicianProfile.findMany({
    include: { user: { select: { email: true } }, _count: { select: { closings: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Técnicos cadastrados</h1>
          <p className="text-slate-500 text-sm mt-1">{technicians.length} técnico(s) no sistema</p>
        </div>
        <Link
          href="/admin/tecnicos/novo"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <UserPlus size={15} />
          Novo técnico
        </Link>
      </div>

      {technicians.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum técnico cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {technicians.map((tech) => (
            <div key={tech.id} className="card p-5 flex items-center gap-4">
              <div className="flex-1 grid sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="font-bold text-dark text-sm">{tech.fullName}</p>
                  <p className="text-slate-400 text-xs">{tech.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">CPF</p>
                  <p className="text-sm text-slate-700">{tech.cpf}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Fechamentos</p>
                  <p className="font-semibold text-sm">{tech._count.closings}</p>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PROFILE_STATUS_COLORS[tech.status]}`}>
                    {PROFILE_STATUS_LABELS[tech.status]}
                  </span>
                </div>
              </div>
              <Link href={`/admin/tecnicos/${tech.id}`} className="text-slate-300 hover:text-brand-blue transition-colors">
                <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
