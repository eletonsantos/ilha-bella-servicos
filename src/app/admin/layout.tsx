import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/tecnico/login')

  // Badges de pendentes para as abas Antecipação, Candidaturas e Reembolsos
  const [pendingAdvances, pendingApplications, pendingReimbursements] = await Promise.all([
    prisma.paymentAdvance.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.technicianApplication.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.reimbursement.count({ where: { status: 'PENDING' } }).catch(() => 0),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav user={session.user} pendingAdvances={pendingAdvances} pendingApplications={pendingApplications} pendingReimbursements={pendingReimbursements} />
      <main className="container-site py-8">{children}</main>
    </div>
  )
}
