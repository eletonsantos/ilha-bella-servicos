'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react'

interface ServiceItem {
  description: string
  serviceDate:  string
  value:        number
}

interface ExtractionResult {
  ok:             boolean
  closingId:      string
  competence:     string
  services:       ServiceItem[]
  totalValue:     number
  technicianName: string | null
  observations:   string | null
  serviceCount:   number
}

interface Props {
  closingId: string
}

export default function ExtrairPdfButton({ closingId }: Props) {
  const router = useRouter()
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<ExtractionResult | null>(null)
  const [error,    setError]    = useState('')
  const [expanded, setExpanded] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied,  setApplied]  = useState(false)

  async function handleExtract() {
    setLoading(true)
    setError('')
    setResult(null)
    setApplied(false)
    try {
      const res = await fetch(`/api/admin/fechamentos/${closingId}/extrair-pdf`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro na extração'); return }
      setResult(data)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!result) return
    if (!confirm(`Aplicar ${result.services.length} serviço(s) extraído(s) ao fechamento? Os serviços existentes serão mantidos e os novos serão adicionados.`)) return

    setApplying(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/fechamentos/${closingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appendServices: result.services.map(s => ({
            description: s.description,
            value:       s.value,
            serviceDate: s.serviceDate,
          })),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erro ao aplicar serviços')
      }
      setApplied(true)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao aplicar serviços')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Botão principal */}
      <button
        onClick={handleExtract}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {loading ? 'Extraindo via IA...' : 'Extrair dados do PDF (IA)'}
      </button>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-purple-700"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} />
              IA encontrou {result.serviceCount} atendimento(s) — valor total: R$ {result.totalValue.toFixed(2).replace('.', ',')}
            </span>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {expanded && (
            <div className="border-t border-purple-200 p-4 space-y-4">
              {result.technicianName && (
                <p className="text-xs text-purple-600">
                  Técnico identificado no PDF: <strong>{result.technicianName}</strong>
                </p>
              )}
              {result.observations && (
                <p className="text-xs text-slate-500 italic">{result.observations}</p>
              )}

              {/* Lista de serviços */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-xs border border-purple-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark truncate">{s.description}</p>
                      <p className="text-slate-400">{s.serviceDate ? new Date(s.serviceDate).toLocaleDateString('pt-BR') : '—'}</p>
                    </div>
                    <span className="font-bold text-dark ml-3">R$ {s.value.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>

              {/* Ação de aplicar */}
              {applied ? (
                <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
                  <CheckCircle2 size={16} />
                  Serviços aplicados ao fechamento!
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {applying ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {applying ? 'Aplicando...' : 'Adicionar ao fechamento'}
                  </button>
                  <p className="text-xs text-slate-500">
                    Os serviços extraídos serão adicionados ao fechamento para revisão.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
