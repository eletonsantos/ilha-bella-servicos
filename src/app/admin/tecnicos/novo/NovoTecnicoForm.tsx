'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Loader2, Eye, EyeOff, CheckCircle, Search } from 'lucide-react'
import { useCnpjLookup } from '@/hooks/useCnpjLookup'

const inputClass =
  'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent'
const labelClass =
  'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

export default function NovoTecnicoForm() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { lookup, lookingUp, lookupError } = useCnpjLookup()

  const [form, setForm] = useState({
    fullName:      '',
    cpf:           '',
    phone:         '',
    email:         '',
    city:          '',
    pixKey:        '',
    pixKeyType:    'CPF',
    contractType:  'AUTONOMO',
    cnpj:          '',
    razaoSocial:   '',
    iaAssistLogin: '',
    password:      '',
    confirm:       '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleCnpjBlur() {
    const data = await lookup(form.cnpj)
    if (!data) return
    setForm(prev => ({
      ...prev,
      razaoSocial: data.razao_social || prev.razaoSocial,
      fullName:    prev.fullName || data.nome_fantasia || data.razao_social || prev.fullName,
      city:        prev.city || (data.municipio ? `${data.municipio} - ${data.uf}` : prev.city),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6)       { setError('Senha deve ter no mínimo 6 caracteres.'); return }
    if (form.password !== form.confirm)  { setError('As senhas não conferem.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/tecnicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:      form.fullName,
          cpf:           form.cpf,
          phone:         form.phone,
          email:         form.email,
          city:          form.city,
          pixKey:        form.pixKey,
          pixKeyType:    form.pixKeyType,
          contractType:  form.contractType,
          cnpj:          form.cnpj          || undefined,
          razaoSocial:   form.razaoSocial   || undefined,
          iaAssistLogin: form.iaAssistLogin || undefined,
          password:      form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao cadastrar')
      setSuccess(true)
      setTimeout(() => router.push(`/admin/tecnicos/${data.profileId}`), 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar técnico')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-6 border-l-4 border-green-400">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500" />
          <div>
            <p className="font-bold text-dark text-sm">Técnico cadastrado com sucesso!</p>
            <p className="text-slate-500 text-sm mt-0.5">Redirecionando para o perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      {/* Dados pessoais */}
      <div>
        <p className={labelClass + ' mb-3'}>Dados pessoais</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome completo *</label>
            <input
              value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              className={inputClass}
              placeholder="Nome completo do técnico"
              required
            />
          </div>
          <div>
            <label className={labelClass}>CPF *</label>
            <input
              value={form.cpf}
              onChange={e => set('cpf', e.target.value)}
              className={inputClass}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Telefone / WhatsApp *</label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className={inputClass}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div>
            <label className={labelClass}>E-mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={inputClass}
              placeholder="tecnico@email.com"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Cidade *</label>
            <input
              value={form.city}
              onChange={e => set('city', e.target.value)}
              className={inputClass}
              placeholder="Ex: Florianópolis"
              required
            />
          </div>
        </div>
      </div>

      {/* Pix */}
      <div className="border-t border-slate-100 pt-4">
        <p className={labelClass + ' mb-3'}>Dados de pagamento</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tipo de chave Pix *</label>
            <select
              value={form.pixKeyType}
              onChange={e => set('pixKeyType', e.target.value)}
              className={inputClass}
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
              <option value="EMAIL">E-mail</option>
              <option value="PHONE">Telefone</option>
              <option value="RANDOM">Chave aleatória</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Chave Pix *</label>
            <input
              value={form.pixKey}
              onChange={e => set('pixKey', e.target.value)}
              className={inputClass}
              placeholder="Informe a chave Pix"
              required
            />
          </div>
        </div>
      </div>

      {/* Tipo de contratação */}
      <div className="border-t border-slate-100 pt-4">
        <p className={labelClass + ' mb-3'}>Contratação</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tipo de contratação *</label>
            <select
              value={form.contractType}
              onChange={e => set('contractType', e.target.value)}
              className={inputClass}
            >
              <option value="AUTONOMO">Autônomo</option>
              <option value="PJ_TERCEIRIZADO">Terceirizado PJ</option>
              <option value="CLT">CLT</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Login IA Assist</label>
            <input
              value={form.iaAssistLogin}
              onChange={e => set('iaAssistLogin', e.target.value)}
              className={inputClass}
              placeholder="Opcional"
            />
          </div>

          {/* CNPJ com consulta automática */}
          <div>
            <label className={labelClass}>
              CNPJ <span className="normal-case font-normal text-slate-400">(se PJ)</span>
            </label>
            <div className="relative">
              <input
                value={form.cnpj}
                onChange={e => set('cnpj', e.target.value)}
                onBlur={handleCnpjBlur}
                className={inputClass + ' pr-10'}
                placeholder="00.000.000/0001-00"
              />
              {lookingUp && (
                <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-blue animate-spin" />
              )}
              {!lookingUp && form.cnpj.replace(/\D/g,'').length === 14 && (
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" />
              )}
            </div>
            {lookupError && <p className="text-xs text-red-500 mt-1">{lookupError}</p>}
            {!lookupError && form.cnpj.replace(/\D/g,'').length > 0 && form.cnpj.replace(/\D/g,'').length < 14 && (
              <p className="text-xs text-slate-400 mt-1">Digite os 14 dígitos para buscar automaticamente</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Razão Social</label>
            <input
              value={form.razaoSocial}
              onChange={e => set('razaoSocial', e.target.value)}
              className={inputClass}
              placeholder="Preenchido automaticamente pelo CNPJ"
            />
          </div>
        </div>
      </div>

      {/* Senha */}
      <div className="border-t border-slate-100 pt-4">
        <p className={labelClass + ' mb-3'}>Acesso ao sistema</p>
        <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 text-sm">
          <p className="text-slate-500">O técnico fará login com:</p>
          <p className="font-mono font-bold text-dark mt-0.5">
            CPF (apenas números) + senha definida abaixo
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Senha inicial *</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={inputClass + ' pr-10'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Confirmar senha *</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              placeholder="Repita a senha"
              className={inputClass}
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" /> Cadastrando...</>
          : <><UserPlus size={15} /> Cadastrar técnico</>}
      </button>
    </form>
  )
}
