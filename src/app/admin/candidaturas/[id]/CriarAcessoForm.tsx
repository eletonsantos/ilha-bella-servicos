'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface Props {
  applicationId: string
  cpfCnpj: string
  fullName: string
}

export default function CriarAcessoForm({ applicationId, cpfCnpj, fullName }: Props) {
  const router = useRouter()
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState(false)

  const cpf = cpfCnpj.replace(/\D/g, '')
  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não conferem.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/candidaturas/${applicationId}/criar-acesso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao criar acesso')
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/tecnicos')
        router.refresh()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar acesso')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-6 border-l-4 border-green-400">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500" />
          <div>
            <p className="font-bold text-dark text-sm">Acesso criado com sucesso!</p>
            <p className="text-slate-500 text-sm mt-0.5">
              {fullName} pode entrar com o CPF <strong>{cpf}</strong> e a senha definida.
              Redirecionando para Técnicos...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 border-l-4 border-indigo-400">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck size={18} className="text-indigo-600" />
        <h2 className="font-bold text-dark">Criar acesso para o técnico</h2>
      </div>

      <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 text-sm">
        <p className="text-slate-500 mb-1">O técnico vai entrar com:</p>
        <p className="font-mono font-bold text-dark">CPF: {cpf}</p>
        <p className="text-slate-500 text-xs mt-1">Defina abaixo a senha inicial e comunique ao técnico.</p>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha inicial *</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={inputClass + ' pr-10'}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar senha *</label>
          <input
            type={showPass ? 'text' : 'password'}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Criando acesso...</> : <><UserCheck size={15} /> Criar acesso</>}
        </button>
      </form>
    </div>
  )
}
