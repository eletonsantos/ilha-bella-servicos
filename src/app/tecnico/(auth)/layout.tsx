import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TecnicoNav from '@/components/tecnico/TecnicoNav'
import { OPERATIONAL_STATUSES } from '@/lib/constants-tecnico'

export default async function TecnicoAuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })

  // Redirect to complete profile if not done yet
  if (!profile) redirect('/tecnico/cadastro')

  // Bloqueia prestadores não-homologados: redireciona para regularização cadastral
  if (!OPERATIONAL_STATUSES.includes(profile.status as (typeof OPERATIONAL_STATUSES)[number])) {
    redirect('/tecnico/regularizacao-cadastral')
  }

  // Mesmo com status legado (APPROVED/LINKED), PJ que não assinou o Contrato-Mãe
  // deve ser redirecionado para regularização para assinar antes de acessar o portal
  if (profile.contractType === 'PJ_TERCEIRIZADO' && !profile.masterContractSignedAt) {
    redirect('/tecnico/regularizacao-cadastral')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TecnicoNav user={session.user} profile={profile} />
      <main className="container-site py-8 pb-24 sm:pb-8">{children}</main>
    </div>
  )
}
