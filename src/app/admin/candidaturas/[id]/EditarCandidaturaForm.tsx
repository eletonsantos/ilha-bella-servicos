'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, X, Pencil } from 'lucide-react'

interface Candidatura {
  id: string
  fullName: string
  cpfCnpj: string
  whatsapp: string
  email: string
  cidade: string
  bairro: string | null
  especialidadePrincipal: string
  outrasEspecialidades: string | null
  atende24h: boolean
  possuiVeiculo: boolean
  emiteNotaFiscal: boolean
  trabalhoTipo: string | null
  disponibilidade: string | null
  tempoExperiencia: string | null
  observacoes: string | null
}

export default function EditarCandidaturaForm({ app }: { app: Candidatura }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    fullName:               app.fullName,
    cpfCnpj:                app.cpfCnpj,
    whatsapp:               app.whatsapp,
    email:                  app.email,
    cidade:                 app.cidade,
    bairro:                 app.bairro ?? '',
    especialidadePrincipal: app.especialidadePrincipal,
    outrasEspecialidades:   app.outrasEspecialidades ?? '',
    atende24h:              app.atende24h,
    possuiVeiculo:          app.possuiVeiculo,
    emiteNotaFiscal:        app.emiteNotaFiscal,
    trabalhoTipo:           app.trabalhoTipo ?? '',
    disponibilidade:        app.disponibilidade ?? '',
    tempoExperiencia:       app.tempoExperiencia ?? '',
    observacoes:            app.observacoes ?? '',
  })

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/candidaturas/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          bairro:               form.bairro || undefined,
          outrasEspecialidades: form.outrasEspecialidades || undefined,
          trabalhoTipo:         form.trabalhoTipo || undefined,
          disponibilidade:      form.disponibilidade || undefined,
          tempoExperiencia:     form.tempoExperiencia || undefined,
          observacoes:          form.observacoes || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao salvar')
      }
      setSuccess(true)
      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const inputClass  = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent'
  const labelClass  = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

  if (!editing) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-dark">Editar dados da candidatura</h2>
          {success && (
            <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">✓ Salvo com sucesso</span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-4">Corrija qualquer informação antes de aprovar ou criar acesso.</p>
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
        >
          <Pencil size={14} />
          Editar dados
        </button>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h2 className="font-bold text-dark mb-5">Editar dados da candidatura</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error   && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        {/* Dados pessoais */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">Dados pessoais</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nome completo *</label>
              <input value={form.fullName} onChange={e => set('fullName', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>CPF / CNPJ *</label>
              <input value={form.cpfCnpj} onChange={e => set('cpfCnpj', e.target.value)} className={inputClass} placeholder="000.000.000-00" required />
            </div>
            <div>
              <label className={labelClass}>WhatsApp *</label>
              <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className={inputClass} placeholder="(48) 99999-9999" required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>E-mail *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} required />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">Localização</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cidade *</label>
              <input value={form.cidade} onChange={e => set('cidade', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Bairro</label>
              <input value={form.bairro} onChange={e => set('bairro', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Especialidades */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">Especialidades</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Especialidade principal *</label>
              <input value={form.especialidadePrincipal} onChange={e => set('especialidadePrincipal', e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Outras especialidades</label>
              <input value={form.outrasEspecialidades} onChange={e => set('outrasEspecialidades', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Operacional */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100">Operacional</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.atende24h} onChange={e => set('atende24h', e.target.checked)}
                className="w-4 h-4 accent-brand-blue" />
              <span className="text-sm text-slate-700">Atende 24h</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.possuiVeiculo} onChange={e => set('possuiVeiculo', e.target.checked)}
                className="w-4 h-4 accent-brand-blue" />
              <span className="text-sm text-slate-700">Possui veículo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.emiteNotaFiscal} onChange={e => set('emiteNotaFiscal', e.target.checked)}
                className="w-4 h-4 accent-brand-blue" />
              <span className="text-sm text-slate-700">Emite NF</span>
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de trabalho</label>
              <select value={form.trabalhoTipo} onChange={e => set('trabalhoTipo', e.target.value)} className={inputClass}>
                <option value="">Não informado</option>
                <option value="solo">Trabalha sozinho</option>
                <option value="equipe">Tem equipe</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tempo de experiência</label>
              <input value={form.tempoExperiencia} onChange={e => set('tempoExperiencia', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Disponibilidade</label>
              <input value={form.disponibilidade} onChange={e => set('disponibilidade', e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Observações do candidato</label>
              <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
                rows={3} className={inputClass + ' resize-none'} />
            </div>
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
            onClick={() => { setEditing(false); setError('') }}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            <X size={15} />
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
