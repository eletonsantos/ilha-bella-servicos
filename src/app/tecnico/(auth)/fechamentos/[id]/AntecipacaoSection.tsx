'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react'
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
  closingId:     string
  totalValue:    number
  techName:      string
  techCnpj:      string | null
  advance:       Advance | null
  canRequest:    boolean   // status === PAYMENT_RELEASED && scheduledPaymentDate
}

const FEE = 10

export default function AntecipacaoSection({ closingId, totalValue, techName, techCnpj, advance, canRequest }: Props) {
  const router = useRouter()
  const [open, setOpen]         = useState(false)
  const [agreed, setAgreed]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [signedName, setSignedName] = useState(techName)
  const [signedCnpj, setSignedCnpj] = useState(techCnpj ?? '')

  const feeValue = parseFloat((totalValue * FEE / 100).toFixed(2))
  const netValue = parseFloat((totalValue - feeValue).toFixed(2))
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  // Already requested — show status
  if (advance) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={18} className="text-emerald-500 flex-shrink-0" />
          <h2 className="font-bold text-dark">Antecipação de pagamento</h2>
          <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${ADVANCE_STATUS_COLORS[advance.status]}`}>
            {ADVANCE_STATUS_LABELS[advance.status]}
          </span>
        </div>
        <dl className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor bruto</dt>
            <dd className="font-medium text-dark">{fmt(advance.originalValue)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Taxa ({advance.feePercent}%)</dt>
            <dd className="font-medium text-red-600">− {fmt(advance.feeValue)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Valor a receber</dt>
            <dd className="text-lg font-extrabold text-emerald-700">{fmt(advance.netValue)}</dd>
          </div>
          <div className="sm:col-span-3">
            <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Assinado por</dt>
            <dd className="text-slate-700">{advance.signedName}{advance.signedCnpj ? ` · CNPJ ${advance.signedCnpj}` : ''}</dd>
          </div>
          {advance.adminNotes && (
            <div className="sm:col-span-3">
              <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Observação</dt>
              <dd className="text-slate-700 whitespace-pre-line">{advance.adminNotes}</dd>
            </div>
          )}
        </dl>
      </div>
    )
  }

  if (!canRequest) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Você precisa aceitar os termos para solicitar a antecipação'); return }
    if (!signedName.trim()) { setError('Informe o nome completo'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tecnico/fechamentos/${closingId}/antecipar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedName: signedName.trim(),
          signedCnpj: signedCnpj.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao solicitar')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar')
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
        <Zap size={17} className="text-emerald-500 flex-shrink-0" />
        <div className="flex-1">
          <span className="font-semibold text-dark text-sm">Solicitar antecipação de pagamento</span>
          <p className="text-xs text-slate-400 mt-0.5">Receba agora com desconto de {FEE}% · {fmt(netValue)} líquido</p>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-slate-100">
          {/* Resumo financeiro */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50">
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Valor bruto</p>
              <p className="font-bold text-dark text-sm">{fmt(totalValue)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Taxa ({FEE}%)</p>
              <p className="font-bold text-red-500 text-sm">− {fmt(feeValue)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Você recebe</p>
              <p className="font-extrabold text-emerald-700">{fmt(netValue)}</p>
            </div>
          </div>

          {/* Contrato */}
          <div className="p-5 space-y-4">
            <div className="border border-slate-200 rounded-xl p-4 max-h-56 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-3">
              <p className="font-bold text-dark text-sm">TERMO DE ANTECIPAÇÃO DE PAGAMENTO</p>
              <p>
                Por meio deste instrumento, o(a) técnico(a) credenciado(a) ("Solicitante") solicita à <strong>Ilha Bella Serviços</strong> ("Empresa") a antecipação do valor referente ao fechamento identificado acima, nos termos e condições a seguir estabelecidos.
              </p>
              <p>
                <strong>1. DA ANTECIPAÇÃO</strong><br />
                A Empresa concorda em antecipar o pagamento do valor líquido indicado neste termo, descontada a taxa de serviço de <strong>{FEE}% (dez por cento)</strong> sobre o valor bruto do fechamento.
              </p>
              <p>
                <strong>2. DA TAXA</strong><br />
                O Solicitante declara ciência de que a taxa de {FEE}% será integralmente deduzida do valor a receber, sendo o valor líquido ({fmt(netValue)}) o montante final a ser creditado na chave Pix cadastrada.
              </p>
              <p>
                <strong>3. DA IRREVOGABILIDADE</strong><br />
                Uma vez aprovada pela Empresa, a antecipação é irrevogável e o Solicitante não poderá reivindicar o valor da taxa.
              </p>
              <p>
                <strong>4. DA APROVAÇÃO</strong><br />
                A solicitação de antecipação está sujeita à análise e aprovação da Empresa, que poderá recusá-la sem necessidade de justificativa.
              </p>
              <p>
                <strong>5. DA ASSINATURA ELETRÔNICA</strong><br />
                Ao informar o nome completo e confirmar a leitura deste termo, o Solicitante declara ter lido, compreendido e concordado com todas as cláusulas acima, conferindo validade jurídica a esta assinatura eletrônica nos termos da Lei nº 14.063/2020.
              </p>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Nome completo (assinatura) *
                </label>
                <input
                  value={signedName}
                  onChange={e => setSignedName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  CNPJ <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  value={signedCnpj}
                  onChange={e => setSignedCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAgreed(v => !v)}
              className="flex items-start gap-3 text-left w-full group"
            >
              {agreed
                ? <CheckSquare size={18} className="text-brand-blue flex-shrink-0 mt-0.5" />
                : <Square size={18} className="text-slate-300 flex-shrink-0 mt-0.5 group-hover:text-slate-400" />}
              <span className="text-sm text-slate-600">
                Li e concordo com os termos acima. Declaro que meu nome completo constitui minha assinatura eletrônica vinculante.
              </span>
            </button>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              Confirmar solicitação de antecipação
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
