'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2, CheckSquare, Square, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Props {
  closing: {
    id: string
    competence: string
    totalValue: number
  }
  techName: string
  techCnpj: string | null
  advance: {
    status: string
    netValue: number
    feeValue: number
    adminNotes: string | null
  } | null
}

const FEE = 10

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Aguardando aprovação',  color: 'text-amber-600',  icon: <Clock size={16} className="text-amber-500" /> },
  APPROVED: { label: 'Antecipação aprovada',  color: 'text-emerald-700', icon: <CheckCircle size={16} className="text-emerald-500" /> },
  REJECTED: { label: 'Antecipação recusada',  color: 'text-red-600',    icon: <XCircle size={16} className="text-red-500" /> },
}

export default function AntecipacaoCard({ closing, techName, techCnpj, advance }: Props) {
  const router   = useRouter()
  const feeValue = parseFloat((closing.totalValue * FEE / 100).toFixed(2))
  const netValue = parseFloat((closing.totalValue - feeValue).toFixed(2))
  const fmt      = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  const [open, setOpen]             = useState(false)
  const [agreed, setAgreed]         = useState(false)
  const [signedName, setSignedName] = useState(techName)
  const [signedCnpj, setSignedCnpj] = useState(techCnpj ?? '')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Você precisa aceitar os termos para continuar'); return }
    if (!signedName.trim()) { setError('Informe o nome completo'); return }
    if (!signedCnpj.trim()) { setError('Informe o CNPJ'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tecnico/fechamentos/${closing.id}/antecipar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedName: signedName.trim(),
          signedCnpj: signedCnpj.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Erro ao solicitar')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar')
    } finally {
      setLoading(false)
    }
  }

  /* ── Se já tem solicitação, mostra status ── */
  if (advance) {
    const cfg = STATUS_CONFIG[advance.status] ?? STATUS_CONFIG.PENDING
    return (
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Competência</p>
            <p className="font-bold text-dark">{closing.competence}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {cfg.icon}
            <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-center">
          <div>
            <p className="text-xs text-slate-400 mb-1">Valor bruto</p>
            <p className="font-semibold text-dark text-sm">{fmt(closing.totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Taxa ({FEE}%)</p>
            <p className="font-semibold text-red-500 text-sm">− {fmt(advance.feeValue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Você recebe</p>
            <p className="font-extrabold text-emerald-700">{fmt(advance.netValue)}</p>
          </div>
        </div>
        {advance.adminNotes && (
          <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{advance.adminNotes}</p>
        )}
      </div>
    )
  }

  /* ── Disponível para antecipar ── */
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Competência</p>
            <p className="font-bold text-dark text-lg">{closing.competence}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Zap size={20} className="text-emerald-500" />
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 rounded-xl p-4 mb-5">
          <div>
            <p className="text-xs text-slate-400 mb-1">Valor do fechamento</p>
            <p className="font-bold text-dark">{fmt(closing.totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Taxa de antecipação ({FEE}%)</p>
            <p className="font-bold text-red-500">− {fmt(feeValue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Você recebe</p>
            <p className="font-extrabold text-emerald-700 text-lg">{fmt(netValue)}</p>
          </div>
        </div>

        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            <Zap size={16} />
            Deseja antecipar?
          </button>
        )}
      </div>

      {/* Contrato (expande ao clicar) */}
      {open && (
        <form onSubmit={handleSubmit} className="border-t border-slate-100">
          {/* Contrato */}
          <div className="px-6 pt-5 pb-4">
            <h3 className="font-bold text-dark text-sm mb-3">Termo de Antecipação de Pagamento</h3>
            <div className="border border-slate-200 rounded-xl p-4 max-h-52 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-3 bg-slate-50">
              <p>
                Por meio deste instrumento, o(a) técnico(a) credenciado(a) solicita à{' '}
                <strong>Ilha Bella Serviços</strong> a antecipação do pagamento referente ao
                fechamento de competência <strong>{closing.competence}</strong>, no valor bruto
                de <strong>{fmt(closing.totalValue)}</strong>.
              </p>
              <p>
                <strong>1. TAXA DE ANTECIPAÇÃO</strong><br />
                Incidirá uma taxa de <strong>{FEE}% (dez por cento)</strong> sobre o valor bruto,
                correspondente a <strong>{fmt(feeValue)}</strong>. O valor líquido a ser creditado
                será de <strong>{fmt(netValue)}</strong>.
              </p>
              <p>
                <strong>2. FORMA DE PAGAMENTO</strong><br />
                O valor líquido será transferido para a chave Pix cadastrada pelo solicitante,
                após aprovação pelo administrador da Ilha Bella Serviços.
              </p>
              <p>
                <strong>3. PRAZO</strong><br />
                Após a aprovação, o pagamento será realizado em até <strong>48 horas</strong>.
              </p>
              <p>
                <strong>4. IRREVOGABILIDADE</strong><br />
                Uma vez aprovada a antecipação, a taxa é irrevogável e o solicitante não
                poderá reivindicar o valor descontado.
              </p>
              <p>
                <strong>5. SUJEITO À APROVAÇÃO</strong><br />
                A Ilha Bella Serviços poderá recusar a solicitação sem necessidade de
                justificativa.
              </p>
              <p>
                <strong>6. ASSINATURA ELETRÔNICA</strong><br />
                Ao informar o nome completo abaixo e marcar a caixa de confirmação, o
                solicitante declara ter lido e concordado com todos os termos, conferindo
                validade a esta assinatura eletrônica nos termos da Lei nº 14.063/2020.
              </p>
            </div>
          </div>

          {/* Campos de assinatura */}
          <div className="px-6 pb-2 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Nome completo (assinatura) *
              </label>
              <input
                value={signedName}
                onChange={e => setSignedName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                CNPJ *
              </label>
              <input
                value={signedCnpj}
                onChange={e => setSignedCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="px-6 pb-5 space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}

            <button
              type="button"
              onClick={() => setAgreed(v => !v)}
              className="flex items-start gap-3 text-left w-full group"
            >
              {agreed
                ? <CheckSquare size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                : <Square size={18} className="text-slate-300 flex-shrink-0 mt-0.5 group-hover:text-slate-400" />}
              <span className="text-sm text-slate-600">
                Li e concordo com os termos acima. Meu nome completo constitui minha assinatura
                eletrônica e autorizo o desconto de {FEE}% ({fmt(feeValue)}) sobre o valor bruto.
              </span>
            </button>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !agreed}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                Confirmar antecipação
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setAgreed(false); setError('') }}
                className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
