import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AlterarSenhaForm from './AlterarSenhaForm'
import { KeyRound, User } from 'lucide-react'

export const metadata = { title: 'Configurações' }

export default async function ConfiguracoesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/tecnico/login')

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { fullName: true, cpf: true, email: true, phone: true },
  })

  if (!profile) redirect('/tecnico/cadastro')

  const cpfSoDigitos = profile.cpf.replace(/\D/g, '')

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-extrabold text-dark">Configurações</h1>

      {/* Dados de acesso (somente leitura) */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-brand-blue" />
          <h2 className="text-base font-bold text-dark">Seus dados de acesso</h2>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Nome</p>
            <p className="text-sm font-medium text-dark">{profile.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Login (CPF — use somente os números)</p>
            <code className="block bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-dark select-all">
              {cpfSoDigitos}
            </code>
            <p className="text-xs text-slate-400 mt-1">
              Este é o seu usuário para entrar no sistema. Use somente os números, sem pontos ou traço.
            </p>
          </div>
        </div>
      </div>

      {/* Alterar senha */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-brand-blue" />
          <h2 className="text-base font-bold text-dark">Alterar Senha</h2>
        </div>
        <AlterarSenhaForm />
      </div>
    </div>
  )
}
