'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function CandidaturaError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CandidaturaDetail] client error:', error)
  }, [error])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/candidaturas"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} /> Voltar para candidaturas
      </Link>

      <div className="card p-8 text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle size={40} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-dark">Erro ao carregar candidatura</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          {error.message || 'Ocorreu um erro inesperado ao exibir esta candidatura.'}
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono">ID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            Tentar novamente
          </button>
          <Link
            href="/admin/candidaturas"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            Voltar à lista
          </Link>
        </div>
      </div>
    </div>
  )
}
