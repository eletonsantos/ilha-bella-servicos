'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, DollarSign, XCircle, ThumbsUp, Clock, CalendarClock } from 'lucide-react'

interface Props {
  reimbursementId: string
  currentStatus: string
  scheduledPaymentDate?: Date | null
}

export default function ReembolsoStatusActions({ reimbursementId, currentStatus, scheduledPaymentDate }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [scheduleDate, setScheduleDate] = useState(
    scheduledPaymentDate ? new Date(scheduledPaymentDate).toISOString().split('T')[0] : ''
  )

  async function handleAction(status: string, extra?: Record<string, unknown>) {
    setLoading(status)
    setError('')
    try {
      const body: Record<string, unknown> = { status, ...extra }
      const res = await fetch(`/api/admin/reembolsos/${reimbursementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

        {/* PENDING → UNDER_REVIEW */}
        {currentStatus === 'PENDING' && (
          <button onClick={() => handleAction('UNDER_REVIEW')} disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50">
            {loading === 'UNDER_REVIEW' ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
            Colocar em análise
          </button>
        )}

        {/* UNDER_REVIEW → APPROVED */}
        {currentStatus === 'UNDER_REVIEW' && (
          <button onClick={() => handleAction('APPROVED')} disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
            {loading === 'APPROVED' ? <Loader2 size={15} className="animate-spin" /> : <ThumbsUp size={15} />}
            Aprovar
          </button>
        )}

        {/* APPROVED → PAYMENT_RELEASED (com data) */}
        {currentStatus === 'APPROVED' && (
          <div className="flex items-end gap-3 w-full sm:w-auto">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Data de pagamento</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => handleAction('PAYMENT_RELEASED', scheduleDate ? { scheduledPaymentDate: new Date(scheduleDate + 'T12:00:00').toISOString() } : {})}
              disabled={!!loading || !scheduleDate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
            >
              {loading === 'PAYMENT_RELEASED' ? <Loader2 size={15} className="animate-spin" /> : <CalendarClock size={15} />}
              Agendar pagamento
            </button>
          </div>
        )}

        {/* PAYMENT_RELEASED → PAID */}
        {currentStatus === 'PAYMENT_RELEASED' && (
          <button onClick={() => handleAction('PAID')} disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50">
            {loading === 'PAID' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Marcar como Pago
          </button>
        )}

        {/* Pago direto (atalho para qualquer status antes de PAID) */}
        {['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(currentStatus) && (
          <button onClick={() => handleAction('PAID')} disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50">
            {loading === 'PAID' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            Marcar como Pago
          </button>
        )}

        {/* Recusar */}
        {['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(currentStatus) && (
          <button onClick={() => handleAction('REJECTED')} disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50">
            {loading === 'REJECTED' ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            Recusar
          </button>
        )}

        {/* Reabrir */}
        {currentStatus === 'REJECTED' && (
          <button onClick={() => handleAction('PENDING')} disabled={!!loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50">
            {loading === 'PENDING' ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />}
            Reabrir solicitação
          </button>
        )}

      </div>
    </div>
  )
}
