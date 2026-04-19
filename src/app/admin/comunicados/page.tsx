import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ComunicadoClient from './ComunicadoClient'
import { Megaphone } from 'lucide-react'

export default async function ComunicadosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const technicians = await prisma.technicianProfile.findMany({
    select: { fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Megaphone size={18} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Comunicados</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Descreva o que quer comunicar — a IA cria o e-mail e você revisa antes de enviar.
          </p>
        </div>
      </div>

      {technicians.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <p className="font-medium">Nenhum técnico cadastrado para receber comunicados.</p>
        </div>
      ) : (
        <ComunicadoClient technicians={technicians} />
      )}
    </div>
  )
}
