'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, X } from 'lucide-react'

interface Props {
  tech: {
    id: string
    fullName: string
    cpf: string
    phone: string
    email: string
    city: string
    pixKey: string
    pixKeyType: string
    iaAssistLogin: string | null
    cnpj: string | null
    razaoSocial: string | null
  }
  onCancel: () => void
}

export default function EditarCadastroForm({ tech, onCancel }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    fullName:     tech.fullName,
    cpf:          tech.cpf,
    phone:        tech.phone,
    email:        tech.email,
    city:         tech.city,
    pixKey:       tech.pixKey,
    pixKeyType:   tech.pixKeyType,
    iaAssistLogin: tech.iaAssistLogin ?? '',
    cnpj:         tech.cnpj ?? '',
    razaoSocial:  tech.razaoSocial ?? '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/tecnicos/${tech.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          iaAssistLogin: form.iaAssistLogin || undefined,
          cnpj:          form.cnpj || undefined,
          razaoSocial:   form.razaoSocial || undefined,
        }),
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
      {success && <p className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl">✓ Cadastro atualizado com sucesso!</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome completo *</label>
          <input value={form.fullName} onChange={e => set('fullName', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>CPF *</label>
          <input value={form.cpf} onChange={e => set('cpf', e.target.value)} className={inputClass} placeholder="000.000.000-00" required />
        </div>
        <div>
          <label className={labelClass}>Telefone *</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>E-mail *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Cidade *</label>
          <input value={form.city} onChange={e => set('city', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Tipo de chave Pix *</label>
          <select value={form.pixKeyType} onChange={e => set('pixKeyType', e.target.value)} className={inputClass}>
            <option value="CPF">CPF</option>
            <option value="CNPJ">CNPJ</option>
            <option value="EMAIL">E-mail</option>
            <option value="PHONE">Telefone</option>
            <option value="RANDOM">Chave aleatória</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Chave Pix *</label>
          <input value={form.pixKey} onChange={e => set('pixKey', e.target.value)} className={inputClass} required />
        </div>

        {/* Dados da empresa */}
        <div className="sm:col-span-2 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dados da empresa (terceirizado)</p>
        </div>
        <div>
          <label className={labelClass}>CNPJ</label>
          <input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} className={inputClass} placeholder="00.000.000/0001-00" />
        </div>
        <div>
          <label className={labelClass}>Razão Social</label>
          <input value={form.razaoSocial} onChange={e => set('razaoSocial', e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Login IA Assist</label>
          <input value={form.iaAssistLogin} onChange={e => set('iaAssistLogin', e.target.value)} className={inputClass} />
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
