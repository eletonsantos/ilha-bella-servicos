'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { ADVANCE_STATUS_LABELS, ADVANCE_STATUS_COLORS } from '@/lib/constants-tecnico'

interface Advance {
  id: string
  status: string
  originalValue: number
  feePercent: number
  feeValue: number
  netValue: number
  signedName: string
  signedCnpj: string | null
  signedAt: Date
  adminNotes: string | null
}

interface Props {
  closingId: string
  advance:   Advance
}

export default function AntecipacaoActions({ closingId, advance }: Props) {
  const router  = useRouter()
  const [notes, setNotes]   = useState(advance.adminNotes ?? '')
  const [loading, setLoading] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [error, setError]   = useState('')

  const isPending = advance.status === 'PENDING'
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`
  const fmtDate = (d: Date) => new Date(d).toLocaleString('pt-BR')

  async function handle(status: 'APPROVED' | 'REJECTED') {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/admin/fechamentos/${closingId}/antecipacao`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar')
      router.refresh()
    } catch {
      setError('Erro ao processar antecipação')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={`card p-6 border-l-4 ${advance.status === 'PENDING' ? 'border-emerald-400' : advance.status === 'APPROVED' ? 'border-green-400' : 'border-red-400'}`}>
      <div className="flex items-center gap-3 mb-4">
        <Zap size={18} className="text-emerald-500 flex-shrink-0" />
        <h2 className="font-bold text-dark">Solicitação de antecipação</h2>
        <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${ADVANCE_STATUS_COLORS[advance.status]}`}>
          {ADVANCE_STATUS_LABELS[advance.status]}
        </span>
      </div>

      <dl className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor bruto</dt>
          <dd className="font-medium text-dark">{fmt(advance.originalValue)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Taxa ({advance.feePercent}%)</dt>
          <dd className="font-medium text-red-600">− {fmt(advance.feeValue)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Pagar ao técnico</dt>
          <dd className="text-lg font-extrabold text-emerald-700">{fmt(advance.netValue)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Assinado por</dt>
          <dd className="text-slate-700">{advance.signedName}{advance.signedCnpj ? ` · CNPJ ${advance.signedCnpj}` : ''}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Data da assinatura</dt>
          <dd className="text-slate-700">{fmtDate(advance.signedAt)}</dd>
        </div>
      </dl>

      {isPending && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Observação ao técnico (opcional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Antecipação aprovada, pagamento em 24h..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handle('APPROVED')}
              disabled={!!loading}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading === 'APPROVED' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Aprovar antecipação
            </button>
            <button
              onClick={() => handle('REJECTED')}
              disabled={!!loading}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading === 'REJECTED' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Recusar antecipação
            </button>
          </div>
        </div>
      )}

      {!isPending && advance.adminNotes && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Sua observação</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{advance.adminNotes}</p>
        </div>
      )}
    </div>
  )
}
