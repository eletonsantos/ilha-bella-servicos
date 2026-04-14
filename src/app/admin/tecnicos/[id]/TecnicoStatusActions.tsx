'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Link2, Loader2 } from 'lucide-react'

interface Props {
  techId: string
  currentStatus: string
}

const actions = [
  {
    label: 'Aprovar cadastro',
    status: 'APPROVED',
    color: 'bg-green-600 hover:bg-green-700 text-white',
    icon: CheckCircle,
    show: ['INITIATED', 'AWAITING_APPROVAL'],
  },
  {
    label: 'Vincular ao sistema',
    status: 'LINKED',
    color: 'bg-brand-blue hover:bg-blue-700 text-white',
    icon: Link2,
    show: ['APPROVED'],
  },
  {
    label: 'Suspender cadastro',
    status: 'INITIATED',
    color: 'bg-red-600 hover:bg-red-700 text-white',
    icon: XCircle,
    show: ['APPROVED', 'LINKED', 'AWAITING_APPROVAL'],
  },
]

export default function TecnicoStatusActions({ techId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const available = actions.filter((a) => a.show.includes(currentStatus))

  async function handleAction(status: string) {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/admin/tecnicos/${techId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao atualizar status')
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(null)
    }
  }

  if (available.length === 0) return null

  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-base font-bold text-dark">Ações</h2>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
          Observação (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações internas sobre este técnico..."
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {available.map((action) => {
          const Icon = action.icon
          const isLoading = loading === action.status
          return (
            <button
              key={action.status}
              onClick={() => handleAction(action.status)}
              disabled={!!loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${action.color}`}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Icon size={16} />
              )}
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
