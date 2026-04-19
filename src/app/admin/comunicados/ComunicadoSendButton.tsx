'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  total: number
}

export default function ComunicadoSendButton({ total }: Props) {
  const [state, setState] = useState<'idle' | 'confirm' | 'sending' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [errMsg, setErrMsg] = useState('')

  async function handleSend() {
    setState('sending')
    try {
      const res = await fetch('/api/admin/comunicados', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar')
      setResult({ sent: data.sent, failed: data.failed })
      setState('done')
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Erro desconhecido')
      setState('error')
    }
  }

  if (state === 'done' && result) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
        <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-green-800 text-sm">E-mails enviados com sucesso!</p>
          <p className="text-green-700 text-sm mt-0.5">
            {result.sent} entregue(s){result.failed > 0 ? ` · ${result.failed} falhou(ram)` : ''}
          </p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
          <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-800 text-sm">Erro ao enviar</p>
            <p className="text-red-600 text-sm mt-0.5">{errMsg}</p>
          </div>
        </div>
        <button
          onClick={() => setState('idle')}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (state === 'confirm') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          ⚠️ Você está prestes a enviar um e-mail para <strong>{total} técnico(s)</strong>. Confirma?
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleSend}
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            <Send size={14} />
            Sim, enviar agora
          </button>
          <button
            onClick={() => setState('idle')}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  if (state === 'sending') {
    return (
      <div className="flex items-center gap-3 text-slate-500 text-sm py-2">
        <Loader2 size={18} className="animate-spin text-brand-blue" />
        Enviando e-mails... aguarde.
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('confirm')}
      disabled={total === 0}
      className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Send size={15} />
      Enviar para todos os técnicos
    </button>
  )
}
