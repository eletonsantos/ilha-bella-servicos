import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ComunicadoClient from './ComunicadoClient'
import { Megaphone } from 'lucide-react'
import PageHeader from '@/components/tecnico/PageHeader'

export default async function ComunicadosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const technicians = await prisma.technicianProfile.findMany({
    select: { fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Comunicados"
        subtitle="Descreva o que quer comunicar — a IA cria o e-mail e você revisa antes de enviar."
        variant="gold"
      />

      {technicians.length === 0 ? (
        <div className="card-elevated p-10 text-center text-slate-400">
          <p className="font-medium">Nenhum técnico cadastrado para receber comunicados.</p>
        </div>
      ) : (
        <ComunicadoClient technicians={technicians} />
      )}
    </div>
  )
}
