'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, User, Zap } from 'lucide-react'

interface Props {
  advance: {
    id: string
    closingId: string
    status: string
    originalValue: number
    feePercent: number
    feeValue: number
    netValue: number
    signedName: string
    signedCnpj: string | null
    signedAt: Date
    adminNotes: string | null
    closing: { competence: string }
    technician: { fullName: string; pixKey: string; pixKeyType: string }
  }
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
}
const STATUS_LABELS: Record<string, string> = {
  PENDING:  'Aguardando aprovação',
  APPROVED: 'Aprovada',
  REJECTED: 'Recusada',
}

export default function AntecipacaoAdminCard({ advance }: Props) {
  const router = useRouter()
  const [notes, setNotes]     = useState(advance.adminNotes ?? '')
  const [loading, setLoading] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [error, setError]     = useState('')

  const fmt     = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`
  const fmtDate = (d: Date)   => new Date(d).toLocaleString('pt-BR')
  const isPending = advance.status === 'PENDING'

  async function handle(status: 'APPROVED' | 'REJECTED') {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/admin/fechamentos/${advance.closingId}/antecipacao`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      })
      if (!res.ok) throw new Error('Erro ao processar')
      router.refresh()
    } catch {
      setError('Erro ao processar a solicitação')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={`card overflow-hidden ${isPending ? 'ring-2 ring-amber-300' : ''}`}>
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPending ? 'bg-amber-50' : 'bg-slate-100'}`}>
            <Zap size={18} className={isPending ? 'text-amber-500' : 'text-slate-400'} />
          </div>
          <div>
            <p className="font-extrabold text-dark">{advance.technician.fullName}</p>
            <p className="text-sm text-slate-400">Competência: <span className="font-medium text-slate-600">{advance.closing.competence}</span></p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[advance.status]}`}>
          {STATUS_LABELS[advance.status]}
        </span>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50">
        <div className="p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Valor bruto</p>
          <p className="font-bold text-dark">{fmt(advance.originalValue)}</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Taxa ({advance.feePercent}%)</p>
          <p className="font-bold text-red-500">− {fmt(advance.feeValue)}</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">A pagar ao técnico</p>
          <p className="font-extrabold text-emerald-700 text-lg">{fmt(advance.netValue)}</p>
        </div>
      </div>

      {/* Dados de assinatura + Pix */}
      <div className="px-5 py-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <User size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Assinado por</p>
            <p className="font-medium text-dark">{advance.signedName}</p>
            {advance.signedCnpj && <p className="text-xs text-slate-500">CNPJ {advance.signedCnpj}</p>}
            <p className="text-xs text-slate-400 mt-0.5">{fmtDate(advance.signedAt)}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400">Chave Pix para pagamento</p>
          <p className="font-semibold text-dark mt-0.5">{advance.technician.pixKey}</p>
          <p className="text-xs text-slate-400">{advance.technician.pixKeyType}</p>
        </div>
      </div>

      {/* Ações (só para pendentes) */}
      {isPending && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Observação para o técnico (opcional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Antecipação aprovada, pagamento em 24h via Pix..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handle('APPROVED')}
              disabled={!!loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading === 'APPROVED' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              Aprovar e pagar {fmt(advance.netValue)}
            </button>
            <button
              onClick={() => handle('REJECTED')}
              disabled={!!loading}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading === 'REJECTED' ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
              Recusar
            </button>
          </div>
        </div>
      )}

      {/* Notas do admin (aprovadas/recusadas) */}
      {!isPending && advance.adminNotes && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-400 mb-0.5">Sua observação</p>
          <p className="text-sm text-slate-700">{advance.adminNotes}</p>
        </div>
      )}
    </div>
  )
}
