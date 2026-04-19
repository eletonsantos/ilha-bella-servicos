'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, Loader2, Eye, EyeOff, CheckCircle, Search } from 'lucide-react'
import { useCnpjLookup } from '@/hooks/useCnpjLookup'

interface Props {
  applicationId: string
  cpfCnpj:  string
  fullName: string
  phone:    string
  email:    string
  city:     string
}

const CONTRACT_LABELS: Record<string, string> = {
  AUTONOMO:        'Autônomo',
  PJ_TERCEIRIZADO: 'Terceirizado PJ',
  CLT:             'CLT',
}

export default function CriarAcessoForm({ applicationId, cpfCnpj, fullName, phone, email, city }: Props) {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const { lookup, lookingUp, lookupError } = useCnpjLookup()

  const cpf = cpfCnpj.replace(/\D/g, '')
  const isCnpj = cpf.length === 14
  const inputClass = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue'

  const [form, setForm] = useState({
    fullName:     fullName,
    phone:        phone,
    email:        email,
    city:         city,
    pixKey:       '',
    pixKeyType:   isCnpj ? 'CNPJ' : 'CPF',
    cnpj:         isCnpj ? cpfCnpj : '',
    razaoSocial:  '',
    contractType: isCnpj ? 'PJ_TERCEIRIZADO' : 'AUTONOMO',
    password:     '',
    confirm:      '',
  })

  // Busca dados do CNPJ automaticamente se for PJ
  useEffect(() => {
    if (!isCnpj) return
    fetch(`https://brasilapi.com.br/api/cnpj/v1/${cpf}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setForm(prev => ({
          ...prev,
          razaoSocial: data.razao_social || prev.razaoSocial,
          city: prev.city || (data.municipio ? `${data.municipio} - ${data.uf}` : prev.city),
        }))
      })
      .catch(() => {})
  }, [])

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
    if (form.password.length < 6)          { setError('Senha deve ter no mínimo 6 caracteres.'); return }
    if (form.password !== form.confirm)    { setError('As senhas não conferem.'); return }
    if (!form.pixKey.trim())               { setError('Informe a chave Pix.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/candidaturas/${applicationId}/criar-acesso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password:     form.password,
          fullName:     form.fullName,
          phone:        form.phone,
          email:        form.email,
          city:         form.city,
          pixKey:       form.pixKey,
          pixKeyType:   form.pixKeyType,
          cnpj:         form.cnpj || undefined,
          razaoSocial:  form.razaoSocial || undefined,
          contractType: form.contractType,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao criar acesso')
      setSuccess(true)
      setTimeout(() => { router.push('/admin/tecnicos'); router.refresh() }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar acesso')
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
            <p className="font-bold text-dark text-sm">Acesso criado com sucesso!</p>
            <p className="text-slate-500 text-sm mt-0.5">
              {form.fullName} pode entrar com o CPF <strong>{cpf}</strong> e a senha definida.
              Redirecionando para Técnicos...
            </p>
          </div>
        </div>
      </div>
    )
  }

  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

  return (
    <div className="card p-6 border-l-4 border-indigo-400">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck size={18} className="text-indigo-600" />
        <h2 className="font-bold text-dark">Cadastrar técnico com dados da candidatura</h2>
      </div>

      <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 text-sm">
        <p className="text-slate-500 mb-0.5">Login de acesso:</p>
        <p className="font-mono font-bold text-dark">CPF: {cpf}</p>
        <p className="text-slate-400 text-xs mt-1">Defina a senha inicial e revise os dados antes de cadastrar.</p>
      </div>

      {error && <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dados pessoais */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nome completo *</label>
            <input value={form.fullName} onChange={e => set('fullName', e.target.value)} className={inputClass} required />
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

          {/* Tipo de contratação */}
          <div>
            <label className={labelClass}>Tipo de contratação *</label>
            <select value={form.contractType} onChange={e => set('contractType', e.target.value)} className={inputClass}>
              {Object.entries(CONTRACT_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Pix */}
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
            <input value={form.pixKey} onChange={e => set('pixKey', e.target.value)} className={inputClass} placeholder="Informe a chave Pix" required />
          </div>

          {/* Dados PJ com consulta automática */}
          <div>
            <label className={labelClass}>CNPJ <span className="normal-case font-normal text-slate-400">(se PJ) — preenche automaticamente</span></label>
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
              placeholder="Preenchido pelo CNPJ"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="border-t border-slate-100 pt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Senha inicial *</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={inputClass + ' pr-10'}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Cadastrando técnico...</>
            : <><UserCheck size={15} /> Cadastrar técnico</>}
        </button>
      </form>
    </div>
  )
}
