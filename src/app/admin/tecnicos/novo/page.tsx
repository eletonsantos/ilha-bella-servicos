import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NovoTecnicoForm from './NovoTecnicoForm'

export default async function NovoTecnicoPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/tecnicos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para técnicos
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-dark">Cadastrar novo técnico</h1>
        <p className="text-slate-500 text-sm mt-1">
          Preencha os dados e crie o acesso manualmente, sem precisar de candidatura.
        </p>
      </div>

      <NovoTecnicoForm />
    </div>
  )
}
