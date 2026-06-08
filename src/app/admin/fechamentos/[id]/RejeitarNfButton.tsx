'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, Loader2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  closingId:     string
  currentStatus: string
  invoiceNumber?: string | null
}

const ELIGIBLE_STATUSES = ['INVOICE_SENT', 'UNDER_REVIEW']

export default function RejeitarNfButton({ closingId, currentStatus, invoiceNumber }: Props) {
  const router  = useRouter()
  const [open,    setOpen]    = useState(false)
  const [reason,  setReason]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  if (!ELIGIBLE_STATUSES.includes(currentStatus)) return null

  async function handleReject() {
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Informe o motivo com pelo menos 5 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/fechamentos/${closingId}/rejeitar-nf`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ reason: reason.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.formErrors?.[0] ?? data.error ?? 'Erro ao rejeitar NF')
      }
      router.refresh()
      setOpen(false)
      setReason('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 space-y-4 border-red-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className="font-bold text-dark">Rejeitar Nota Fiscal</h2>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setError('') }}
          className="inline-flex items-center gap-1.5 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors"
        >
          {open ? <><ChevronUp size={15} /> Fechar</> : <><XCircle size={15} /> Rejeitar NF</>}
        </button>
      </div>

      {open && (
        <div className="space-y-3 pt-2 border-t border-red-100">
          <p className="text-sm text-slate-600">
            A NF{invoiceNumber ? ` nº <strong>${invoiceNumber}</strong>` : ''} será excluída e o contrato de prestação de serviços assinado será cancelado.
            O técnico receberá um e-mail com o motivo e poderá enviar uma nova NF.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Motivo da rejeição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ex: Valor da NF diverge do fechamento. Por favor, corrija e reenvie."
              rows={3}
              className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{reason.trim().length}/5 caracteres mínimos</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleReject}
              disabled={loading || reason.trim().length < 5}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Rejeitando...</>
                : <><XCircle size={15} /> Confirmar rejeição</>
              }
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setReason(''); setError('') }}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
