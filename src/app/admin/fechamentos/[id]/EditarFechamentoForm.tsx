'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, X } from 'lucide-react'

interface Props {
  closing: {
    id: string
    competence: string
    periodStart: Date
    periodEnd: Date
    totalValue: number
    serviceCount: number
    observations: string | null
    scheduledPaymentDate: Date | null
  }
  onCancel: () => void
}

function toDateInput(d: Date | string | null): string {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

export default function EditarFechamentoForm({ closing, onCancel }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    competence:           closing.competence,
    periodStart:          toDateInput(closing.periodStart),
    periodEnd:            toDateInput(closing.periodEnd),
    totalValue:           closing.totalValue.toFixed(2),
    serviceCount:         String(closing.serviceCount),
    observations:         closing.observations ?? '',
    scheduledPaymentDate: toDateInput(closing.scheduledPaymentDate),
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload: Record<string, unknown> = {
      competence:   form.competence,
      periodStart:  new Date(form.periodStart).toISOString(),
      periodEnd:    new Date(form.periodEnd).toISOString(),
      totalValue:   parseFloat(form.totalValue.replace(',', '.')),
      serviceCount: parseInt(form.serviceCount, 10),
      observations: form.observations || undefined,
      scheduledPaymentDate: form.scheduledPaymentDate
        ? new Date(form.scheduledPaymentDate).toISOString()
        : null,
    }

    try {
      const res = await fetch(`/api/admin/fechamentos/${closing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao salvar')
      }
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent'
  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error   && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
      {success && <p className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl">✓ Fechamento atualizado com sucesso!</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Competência *</label>
          <input
            value={form.competence}
            onChange={e => set('competence', e.target.value)}
            className={inputClass}
            placeholder="ex: Janeiro/2025"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Período início *</label>
          <input
            type="date"
            value={form.periodStart}
            onChange={e => set('periodStart', e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Período fim *</label>
          <input
            type="date"
            value={form.periodEnd}
            onChange={e => set('periodEnd', e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Valor total (R$) *</label>
          <input
            value={form.totalValue}
            onChange={e => set('totalValue', e.target.value)}
            className={inputClass}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Qtd. serviços *</label>
          <input
            type="number"
            min="0"
            value={form.serviceCount}
            onChange={e => set('serviceCount', e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Data de pagamento programado</label>
          <input
            type="date"
            value={form.scheduledPaymentDate}
            onChange={e => set('scheduledPaymentDate', e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-slate-400 mt-1">Deixe em branco se não houver data definida.</p>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Observações</label>
          <textarea
            value={form.observations}
            onChange={e => set('observations', e.target.value)}
            className={`${inputClass} min-h-[80px] resize-y`}
            placeholder="Observações sobre o fechamento..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Salvar alterações
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
        >
          <X size={15} />
          Cancelar
        </button>
      </div>
    </form>
  )
}
