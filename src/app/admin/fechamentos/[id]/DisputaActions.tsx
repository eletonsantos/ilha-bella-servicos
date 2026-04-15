'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { DISPUTE_STATUS_LABELS, DISPUTE_STATUS_COLORS } from '@/lib/constants-tecnico'

interface Dispute {
  id: string
  status: string
  reason: string
  claimedValue: number
  adminNotes: string | null
  createdAt: Date
  technician: { fullName: string }
}

interface Props {
  closingId:  string
  totalValue: number
  dispute:    Dispute
}

export default function DisputaActions({ closingId, totalValue, dispute }: Props) {
  const router  = useRouter()
  const [notes, setNotes]   = useState(dispute.adminNotes ?? '')
  const [loading, setLoading] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [error, setError]   = useState('')

  const isPending = dispute.status === 'PENDING'
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  async function handle(status: 'APPROVED' | 'REJECTED') {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/admin/fechamentos/${closingId}/contestacao`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      router.refresh()
    } catch {
      setError('Erro ao processar contestação')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={`card p-6 border-l-4 ${dispute.status === 'PENDING' ? 'border-amber-400' : dispute.status === 'APPROVED' ? 'border-green-400' : 'border-red-400'}`}>
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
        <h2 className="font-bold text-dark">Contestação de valor</h2>
        <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${DISPUTE_STATUS_COLORS[dispute.status]}`}>
          {DISPUTE_STATUS_LABELS[dispute.status]}
        </span>
      </div>

      <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor original</dt>
          <dd className="font-medium text-dark">{fmt(totalValue)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor contestado</dt>
          <dd className="font-semibold text-amber-700">{fmt(dispute.claimedValue)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Motivo</dt>
          <dd className="text-slate-700 whitespace-pre-line">{dispute.reason}</dd>
        </div>
      </dl>

      {isPending && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Resposta ao técnico (opcional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Explique sua decisão..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handle('APPROVED')}
              disabled={!!loading}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading === 'APPROVED' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Aprovar contestação
            </button>
            <button
              onClick={() => handle('REJECTED')}
              disabled={!!loading}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading === 'REJECTED' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Recusar contestação
            </button>
          </div>
        </div>
      )}

      {!isPending && dispute.adminNotes && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Sua resposta</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{dispute.adminNotes}</p>
        </div>
      )}
    </div>
  )
}
