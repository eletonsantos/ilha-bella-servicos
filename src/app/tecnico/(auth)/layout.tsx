import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TecnicoNav from '@/components/tecnico/TecnicoNav'

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

  // Status intermediários do fluxo de cadastro/homologação — técnico ainda precisa
  // completar etapas antes de acessar o portal (mesmo que masterContractSignedAt esteja
  // preenchido de uma assinatura anterior que foi revertida pelo admin)
  const PENDING_ONBOARDING = [
    'CADASTRO_INICIADO',
    'CNPJ_PENDENTE',
    'CNPJ_IRREGULAR',
    'DADOS_INCOMPLETOS',
    'TECNICO_RESPONSAVEL_PENDENTE',
    'CONTRATO_MAE_PENDENTE',
  ]
  if (PENDING_ONBOARDING.includes(profile.status)) {
    redirect('/tecnico/regularizacao-cadastral')
  }

  // Não assinou o contrato/termo → obriga passar pelo fluxo de assinatura
  // Após assinar, acesso é liberado imediatamente sem precisar de homologação
  if (!profile.masterContractSignedAt) {
    redirect('/tecnico/regularizacao-cadastral')
  }

  return (
    <div className="min-h-screen bg-portal">
      <TecnicoNav user={session.user} profile={profile} />
      <main className="container-site py-8 pb-28 sm:pb-10">{children}</main>
    </div>
  )
}
