'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wrench, CheckCircle, Loader2 } from 'lucide-react'

const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"
const errorClass = "text-red-500 text-xs mt-1"

const especialidades = [
  'Encanador', 'Eletricista', 'Marmorista', 'Serralheiro', 'Pintor',
  'Pedreiro', 'Gesseiro', 'Carpinteiro', 'Vidraceiro', 'Ar-condicionado',
  'Interfone / CFTV', 'Jardineiro', 'Limpeza', 'Outro',
]

export default function TecnicoParceiroPage() {
  const [form, setForm] = useState({
    fullName: '', cpfCnpj: '', whatsapp: '', email: '',
    cidade: '', bairro: '',
    especialidadePrincipal: '', outrasEspecialidades: '',
    atende24h: false, possuiVeiculo: false, emiteNotaFiscal: false,
    trabalhoTipo: '', disponibilidade: '', tempoExperiencia: '', observacoes: '',
  })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.fullName.trim())               e.fullName = 'Campo obrigatório'
    if (!form.cpfCnpj.trim())                e.cpfCnpj = 'Campo obrigatório'
    if (!form.whatsapp.trim())               e.whatsapp = 'Campo obrigatório'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'E-mail inválido'
    if (!form.cidade.trim())                 e.cidade = 'Campo obrigatório'
    if (!form.especialidadePrincipal)        e.especialidadePrincipal = 'Selecione a especialidade'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/candidatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          outrasEspecialidades: form.outrasEspecialidades || undefined,
          bairro: form.bairro || undefined,
          trabalhoTipo: form.trabalhoTipo || undefined,
          disponibilidade: form.disponibilidade || undefined,
          tempoExperiencia: form.tempoExperiencia || undefined,
          observacoes: form.observacoes || undefined,
        }),
      })
      if (!res.ok) throw new Error('Erro ao enviar')
      setSuccess(true)
    } catch {
      setServerError('Erro ao enviar. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 mb-6">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">Cadastro recebido!</h1>
          <p className="text-slate-300 leading-relaxed mb-8">
            Cadastro recebido com sucesso. Nossa equipe analisará suas informações e poderá entrar em contato.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-gold/80 font-semibold transition-colors">
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/tecnico" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-8">
          <ArrowLeft size={15} /> Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-blue/30 border border-brand-blue/40 mb-4">
            <Wrench size={24} className="text-brand-gold" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Quero ser técnico parceiro</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Preencha o formulário abaixo. Nossa equipe analisará seu cadastro e entrará em contato.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl space-y-6">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{serverError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados pessoais */}
            <div>
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider text-slate-400 mb-4">Dados pessoais</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome completo *</label>
                  <input value={form.fullName} onChange={e => set('fullName', e.target.value)} className={inputClass} placeholder="Seu nome completo" />
                  {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
                </div>
                <div>
                  <label className={labelClass}>CPF ou CNPJ *</label>
                  <input value={form.cpfCnpj} onChange={e => set('cpfCnpj', e.target.value)} className={inputClass} placeholder="000.000.000-00" />
                  {errors.cpfCnpj && <p className={errorClass}>{errors.cpfCnpj}</p>}
                </div>
                <div>
                  <label className={labelClass}>WhatsApp *</label>
                  <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className={inputClass} placeholder="(48) 99999-9999" />
                  {errors.whatsapp && <p className={errorClass}>{errors.whatsapp}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>E-mail *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="seu@email.com" />
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Região */}
            <div>
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider text-slate-400 mb-4">Região de atendimento</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Cidade *</label>
                  <input value={form.cidade} onChange={e => set('cidade', e.target.value)} className={inputClass} placeholder="Sua cidade" />
                  {errors.cidade && <p className={errorClass}>{errors.cidade}</p>}
                </div>
                <div>
                  <label className={labelClass}>Bairro <span className="text-slate-400 font-normal">(opcional)</span></label>
                  <input value={form.bairro} onChange={e => set('bairro', e.target.value)} className={inputClass} placeholder="Seu bairro" />
                </div>
              </div>
            </div>

            {/* Especialidades */}
            <div>
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider text-slate-400 mb-4">Especialidades</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Especialidade principal *</label>
                  <select value={form.especialidadePrincipal} onChange={e => set('especialidadePrincipal', e.target.value)} className={inputClass}>
                    <option value="">Selecione...</option>
                    {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {errors.especialidadePrincipal && <p className={errorClass}>{errors.especialidadePrincipal}</p>}
                </div>
                <div>
                  <label className={labelClass}>Outras especialidades <span className="text-slate-400 font-normal">(opcional)</span></label>
                  <input value={form.outrasEspecialidades} onChange={e => set('outrasEspecialidades', e.target.value)} className={inputClass} placeholder="Ex: Eletricista, Pintor..." />
                </div>
              </div>
            </div>

            {/* Informações operacionais */}
            <div>
              <h2 className="font-bold text-dark text-sm uppercase tracking-wider text-slate-400 mb-4">Informações operacionais</h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { field: 'atende24h',      label: 'Atende emergência 24h?' },
                    { field: 'possuiVeiculo',   label: 'Possui veículo próprio?' },
                    { field: 'emiteNotaFiscal', label: 'Emite nota fiscal?' },
                  ].map(({ field, label }) => (
                    <label key={field} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={form[field as keyof typeof form] as boolean}
                        onChange={e => set(field, e.target.checked)}
                        className="w-4 h-4 accent-brand-blue"
                      />
                      <span className="text-sm text-slate-700 font-medium">{label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className={labelClass}>Trabalha sozinho ou com equipe?</label>
                  <select value={form.trabalhoTipo} onChange={e => set('trabalhoTipo', e.target.value)} className={inputClass}>
                    <option value="">Selecione...</option>
                    <option value="solo">Trabalho sozinho</option>
                    <option value="equipe">Tenho equipe</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Tempo de experiência</label>
                  <input value={form.tempoExperiencia} onChange={e => set('tempoExperiencia', e.target.value)} className={inputClass} placeholder="Ex: 5 anos como encanador" />
                </div>

                <div>
                  <label className={labelClass}>Dias e horários disponíveis</label>
                  <input value={form.disponibilidade} onChange={e => set('disponibilidade', e.target.value)} className={inputClass} placeholder="Ex: Segunda a sexta, das 8h às 18h" />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className={labelClass}>Observações <span className="text-slate-400 font-normal">(opcional)</span></label>
              <textarea
                value={form.observacoes}
                onChange={e => set('observacoes', e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Informações adicionais que queira compartilhar..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-slate-600">
              Após o envio, nossa equipe analisará suas informações e poderá entrar em contato pelo WhatsApp ou e-mail informado.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Enviando...</> : 'Enviar cadastro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
