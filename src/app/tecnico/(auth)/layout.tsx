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

  return (
    <div className="min-h-screen bg-slate-50">
      <TecnicoNav user={session.user} profile={profile} />
      <main className="container-site py-8 pb-24 sm:pb-8">{children}</main>
    </div>
  )
}
