'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'

interface Props { applicationId: string; currentStatus: string }

export default function CandidaturaStatusActions({ applicationId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState('')
  const [notes, setNotes]     = useState('')
  const [error, setError]     = useState('')

  async function changeStatus(status: string) {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/admin/candidaturas/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      router.refresh()
    } catch {
      setError('Erro ao atualizar status.')
    } finally {
      setLoading('')
    }
  }

  const actions = [
    { status: 'EM_ANALISE', label: 'Em análise',  icon: Clock,        color: 'bg-blue-600 hover:bg-blue-700',   show: ['PENDING', 'APPROVED', 'REJECTED'] },
    { status: 'APPROVED',   label: 'Aprovar',      icon: CheckCircle,  color: 'bg-green-600 hover:bg-green-700', show: ['PENDING', 'EM_ANALISE', 'REJECTED'] },
    { status: 'REJECTED',   label: 'Reprovar',     icon: XCircle,      color: 'bg-red-600 hover:bg-red-700',     show: ['PENDING', 'EM_ANALISE', 'APPROVED'] },
  ].filter(a => a.show.includes(currentStatus))

  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-bold text-dark">Ações</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Observações internas <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Notas para registro interno..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {actions.map(({ status, label, icon: Icon, color }) => (
          <button
            key={status}
            onClick={() => changeStatus(status)}
            disabled={!!loading}
            className={`inline-flex items-center gap-2 ${color} text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50`}
          >
            {loading === status ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
            {loading === status ? 'Atualizando...' : label}
          </button>
        ))}
      </div>
    </div>
  )
}
