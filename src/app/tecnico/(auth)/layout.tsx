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

  // Suspenso / bloqueado / inativo → mostra mensagem de bloqueio
  const BLOCKED = ['SUSPENSO', 'BLOQUEADO', 'BLOQUEADO_PAGAMENTO', 'INATIVO']
  if (BLOCKED.includes(profile.status)) {
    redirect('/tecnico/regularizacao-cadastral')
  }

  // Não assinou o contrato/termo → obriga passar pelo fluxo de assinatura
  // Após assinar, acesso é liberado imediatamente sem precisar de homologação
  if (!profile.masterContractSignedAt) {
    redirect('/tecnico/regularizacao-cadastral')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TecnicoNav user={session.user} profile={profile} />
      <main className="container-site py-8 pb-24 sm:pb-8">{children}</main>
    </div>
  )
}
