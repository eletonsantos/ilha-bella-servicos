'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react'

interface Props {
  closingId: string
  currentStatus: string
}

const actions = [
  { label: 'NF em conferência', status: 'UNDER_REVIEW', color: 'bg-orange-500 hover:bg-orange-600 text-white', icon: Clock, show: ['INVOICE_SENT'] },
  { label: 'Liberar pagamento', status: 'PAYMENT_RELEASED', color: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: DollarSign, show: ['UNDER_REVIEW'] },
  { label: 'Marcar como Pago', status: 'PAID', color: 'bg-green-600 hover:bg-green-700 text-white', icon: CheckCircle, show: ['PAYMENT_RELEASED'] },
  { label: 'Aguardando NF', status: 'AWAITING_INVOICE', color: 'bg-amber-500 hover:bg-amber-600 text-white', icon: Clock, show: ['CLOSING_AVAILABLE'] },
  { label: 'Reabrir fechamento', status: 'CLOSING_AVAILABLE', color: 'bg-blue-500 hover:bg-blue-600 text-white', icon: Clock, show: ['AWAITING_INVOICE', 'UNDER_REVIEW'] },
  { label: 'Cancelar', status: 'AWAITING_CLOSING', color: 'bg-red-500 hover:bg-red-600 text-white', icon: XCircle, show: ['CLOSING_AVAILABLE', 'AWAITING_INVOICE'] },
]

export default function ClosingStatusActions({ closingId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const available = actions.filter(a => a.show.includes(currentStatus))
  if (available.length === 0) return null

  async function handleAction(status: string) {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/admin/fechamentos/${closingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar status')
      router.refresh()
    } catch {
      setError('Erro ao atualizar status')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-bold text-dark">Ações</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {available.map(action => {
          const Icon = action.icon
          return (
            <button
              key={action.status}
              onClick={() => handleAction(action.status)}
              disabled={!!loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${action.color}`}
            >
              {loading === action.status ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
