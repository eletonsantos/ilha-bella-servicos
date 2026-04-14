import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/tecnico/login')

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav user={session.user} />
      <main className="container-site py-8">{children}</main>
    </div>
  )
}
