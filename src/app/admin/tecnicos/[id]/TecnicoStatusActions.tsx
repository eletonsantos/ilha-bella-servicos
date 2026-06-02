'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Link2, Loader2, ShieldCheck, ShieldOff, AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  techId: string
  currentStatus: string
}

const LEGACY_ACTIONS = [
  {
    label: 'Aprovar cadastro',
    status: 'APPROVED',
    color: 'bg-green-600 hover:bg-green-700 text-white',
    icon: CheckCircle,
    show: ['INITIATED', 'AWAITING_APPROVAL'],
    endpoint: 'patch',
  },
  {
    label: 'Vincular ao sistema',
    status: 'LINKED',
    color: 'bg-brand-blue hover:bg-blue-700 text-white',
    icon: Link2,
    show: ['APPROVED'],
    endpoint: 'patch',
  },
  {
    label: 'Suspender cadastro',
    status: 'INITIATED',
    color: 'bg-red-600 hover:bg-red-700 text-white',
    icon: XCircle,
    show: ['APPROVED', 'LINKED', 'AWAITING_APPROVAL'],
    endpoint: 'patch',
  },
]

const HOMOLOGACAO_ACTIONS = [
  {
    label: 'Colocar em análise',
    status: 'EM_ANALISE_ADMINISTRATIVA',
    color: 'bg-purple-600 hover:bg-purple-700 text-white',
    icon: RefreshCw,
    show: ['CONTRATO_MAE_ASSINADO', 'CONTRATO_MAE_PENDENTE', 'TECNICO_RESPONSAVEL_PENDENTE', 'CNPJ_IRREGULAR', 'DADOS_INCOMPLETOS'],
    endpoint: 'homologar',
  },
  {
    label: 'Homologar / Ativar',
    status: 'HOMOLOGADO_ATIVO',
    color: 'bg-green-600 hover:bg-green-700 text-white',
    icon: ShieldCheck,
    show: [
      'CONTRATO_MAE_ASSINADO', 'EM_ANALISE_ADMINISTRATIVA',
      'SUSPENSO', 'BLOQUEADO', 'BLOQUEADO_PAGAMENTO',
      // Intermediários do fluxo — admin pode ativar manualmente em qualquer etapa
      'TECNICO_RESPONSAVEL_PENDENTE', 'CONTRATO_MAE_PENDENTE',
      'CNPJ_PENDENTE', 'CNPJ_IRREGULAR', 'DADOS_INCOMPLETOS',
      'CADASTRO_INICIADO',
      // Legado
      'APPROVED', 'LINKED', 'INITIATED', 'AWAITING_APPROVAL',
    ],
    endpoint: 'homologar',
  },
  {
    label: 'Suspender',
    status: 'SUSPENSO',
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
    icon: AlertTriangle,
    show: [
      'HOMOLOGADO_ATIVO', 'EM_ANALISE_ADMINISTRATIVA', 'CONTRATO_MAE_ASSINADO',
      'TECNICO_RESPONSAVEL_PENDENTE', 'CONTRATO_MAE_PENDENTE', 'CNPJ_PENDENTE', 'CNPJ_IRREGULAR',
    ],
    endpoint: 'homologar',
  },
  {
    label: 'Bloquear',
    status: 'BLOQUEADO',
    color: 'bg-red-600 hover:bg-red-700 text-white',
    icon: ShieldOff,
    show: [
      'HOMOLOGADO_ATIVO', 'SUSPENSO', 'EM_ANALISE_ADMINISTRATIVA', 'CONTRATO_MAE_ASSINADO',
      'TECNICO_RESPONSAVEL_PENDENTE', 'CONTRATO_MAE_PENDENTE', 'CNPJ_PENDENTE', 'CNPJ_IRREGULAR',
    ],
    endpoint: 'homologar',
  },
  {
    label: 'Bloquear pagamento',
    status: 'BLOQUEADO_PAGAMENTO',
    color: 'bg-red-700 hover:bg-red-800 text-white',
    icon: XCircle,
    show: ['HOMOLOGADO_ATIVO'],
    endpoint: 'homologar',
  },
  {
    label: 'Inativar',
    status: 'INATIVO',
    color: 'bg-slate-600 hover:bg-slate-700 text-white',
    icon: XCircle,
    show: ['SUSPENSO', 'BLOQUEADO', 'BLOQUEADO_PAGAMENTO'],
    endpoint: 'homologar',
  },
  {
    label: 'Devolver p/ Contrato',
    status: 'CONTRATO_MAE_PENDENTE',
    color: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: RefreshCw,
    show: ['CNPJ_IRREGULAR', 'DADOS_INCOMPLETOS', 'EM_ANALISE_ADMINISTRATIVA'],
    endpoint: 'homologar',
  },
]

const ALL_ACTIONS = [...LEGACY_ACTIONS, ...HOMOLOGACAO_ACTIONS]

export default function TecnicoStatusActions({ techId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const available = ALL_ACTIONS.filter((a) => a.show.includes(currentStatus))

  async function handleAction(action: typeof ALL_ACTIONS[number]) {
    setLoading(action.status)
    setError('')
    try {
      let url: string
      let method: string
      let bodyData: Record<string, unknown>

      if (action.endpoint === 'homologar') {
        url    = `/api/admin/tecnicos/${techId}/homologar`
        method = 'POST'
        bodyData = { status: action.status, adminNotes: notes || undefined }
      } else {
        url    = `/api/admin/tecnicos/${techId}`
        method = 'PATCH'
        bodyData = { status: action.status, adminNotes: notes || undefined }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao atualizar status')
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(null)
    }
  }

  if (available.length === 0) return null

  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-base font-bold text-dark">Ações</h2>

      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wide mb-1.5">
          Observação (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anotações internas sobre este técnico..."
          rows={3}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        {available.map((action) => {
          const Icon = action.icon
          const isLoading = loading === action.status
          return (
            <button
              key={action.status}
              onClick={() => handleAction(action)}
              disabled={!!loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${action.color}`}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Icon size={16} />
              )}
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
