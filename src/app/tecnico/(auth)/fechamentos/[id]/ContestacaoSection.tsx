'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, Send, CheckCircle, XCircle, Clock } from 'lucide-react'
import { DISPUTE_STATUS_COLORS } from '@/lib/constants-tecnico'

interface Dispute {
  id: string
  status: string
  reason: string
  claimedValue: number
  adminNotes: string | null
  createdAt: Date
}

interface Props {
  closingId:  string
  totalValue: number
  canContest: boolean
  dispute:    Dispute | null
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING:  <Clock size={15} className="text-amber-500" />,
  APPROVED: <CheckCircle size={15} className="text-green-600" />,
  REJECTED: <XCircle size={15} className="text-red-500" />,
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:  'Aguardando análise do admin',
  APPROVED: 'Contestação aprovada',
  REJECTED: 'Contestação recusada',
}

export default function ContestacaoSection({ closingId, totalValue, canContest, dispute }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [reason, setReason]   = useState('')
  const [claimed, setClaimed] = useState('')

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  /* ── Contestação já enviada ── */
  if (dispute) {
    return (
      <div className={`card p-5 border-l-4 ${
        dispute.status === 'APPROVED' ? 'border-green-400'
        : dispute.status === 'REJECTED' ? 'border-red-400'
        : 'border-amber-400'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          {STATUS_ICON[dispute.status]}
          <h3 className="font-bold text-dark text-sm">Contestação de valor</h3>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${DISPUTE_STATUS_COLORS[dispute.status]}`}>
            {STATUS_LABEL[dispute.status]}
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Valor original</p>
            <p className="font-medium text-slate-600 line-through">{fmt(totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Valor contestado</p>
            <p className="font-bold text-amber-700">{fmt(dispute.claimedValue)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-400 mb-0.5">Motivo</p>
            <p className="text-slate-700 text-sm">{dispute.reason}</p>
          </div>
          {dispute.adminNotes && (
            <div className="sm:col-span-2 bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">Resposta do admin</p>
              <p className="text-slate-700 text-sm">{dispute.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Sem permissão para contestar ── */
  if (!canContest) return null

  /* ── Formulário de contestação ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const claimedNum = parseFloat(claimed.replace(',', '.'))
    if (isNaN(claimedNum) || claimedNum <= 0) {
      setError('Informe um valor válido')
      return
    }
    if (reason.trim().length < 10) {
      setError('Descreva o motivo com pelo menos 10 caracteres')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tecnico/fechamentos/${closingId}/contestar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim(), claimedValue: claimedNum }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Erro ao enviar')
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent'

  return (
    <div className="card p-5 border-l-4 border-amber-300">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
        <h3 className="font-bold text-dark text-sm">Discordou do valor?</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4 ml-6">
        Se o valor {fmt(totalValue)} estiver incorreto, informe o valor certo e o motivo abaixo.
      </p>

      {error   && <p className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl mb-3">{error}</p>}
      {success && <p className="text-green-700 text-sm bg-green-50 px-4 py-2.5 rounded-xl mb-3">✓ Contestação enviada! Aguarde a análise.</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Valor correto (R$) *
            </label>
            <input
              value={claimed}
              onChange={e => setClaimed(e.target.value)}
              placeholder={totalValue.toFixed(2).replace('.', ',')}
              className={inputClass}
              disabled={success}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Motivo *
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="Explique por que o valor está incorreto..."
            className={`${inputClass} resize-none`}
            disabled={success}
          />
        </div>
        <button
          type="submit"
          disabled={loading || success}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar contestação
        </button>
      </form>
    </div>
  )
}
