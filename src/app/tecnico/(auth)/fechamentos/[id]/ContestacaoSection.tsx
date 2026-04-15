'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, Send } from 'lucide-react'
import { DISPUTE_STATUS_LABELS, DISPUTE_STATUS_COLORS } from '@/lib/constants-tecnico'

interface Dispute {
  id: string
  status: string
  reason: string
  claimedValue: number
  adminNotes: string | null
  createdAt: Date
}

interface Props {
  closingId: string
  totalValue: number
  canContest: boolean    // status is CLOSING_AVAILABLE or AWAITING_INVOICE
  dispute: Dispute | null
}

export default function ContestacaoSection({ closingId, totalValue, canContest, dispute }: Props) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [reason, setReason]   = useState('')
  const [claimed, setClaimed] = useState('')

  // If dispute already exists, show its status
  if (dispute) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <h2 className="font-bold text-dark">Contestação de valor</h2>
          <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${DISPUTE_STATUS_COLORS[dispute.status]}`}>
            {DISPUTE_STATUS_LABELS[dispute.status]}
          </span>
        </div>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor original</dt>
            <dd className="font-medium text-dark">R$ {totalValue.toFixed(2).replace('.', ',')}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor contestado</dt>
            <dd className="font-semibold text-amber-700">R$ {dispute.claimedValue.toFixed(2).replace('.', ',')}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Motivo informado</dt>
            <dd className="text-slate-700 whitespace-pre-line">{dispute.reason}</dd>
          </div>
          {dispute.adminNotes && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Resposta do admin</dt>
              <dd className="text-slate-700 whitespace-pre-line">{dispute.adminNotes}</dd>
            </div>
          )}
        </dl>
      </div>
    )
  }

  if (!canContest) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const claimedNum = parseFloat(claimed.replace(',', '.'))
    if (isNaN(claimedNum) || claimedNum <= 0) {
      setError('Informe um valor válido')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tecnico/fechamentos/${closingId}/contestar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, claimedValue: claimedNum }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar')
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <AlertTriangle size={17} className="text-amber-500 flex-shrink-0" />
        <span className="font-semibold text-dark text-sm flex-1">Não concordo com este valor</span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Informe o valor correto e o motivo da contestação. O admin irá analisar e responder.
          </p>

          {error   && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl">✓ Contestação enviada! Aguarde a análise.</p>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Valor correto (R$) *
              </label>
              <input
                value={claimed}
                onChange={e => setClaimed(e.target.value)}
                placeholder={totalValue.toFixed(2).replace('.', ',')}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Motivo da contestação *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Descreva por que o valor está incorreto..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
              required
              minLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Enviar contestação
          </button>
        </form>
      )}
    </div>
  )
}
