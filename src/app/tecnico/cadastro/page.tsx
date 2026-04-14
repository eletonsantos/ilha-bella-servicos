'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Wrench, CheckCircle } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (use 000.000.000-00)'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  pixKey: z.string().min(1, 'Chave Pix obrigatória'),
  pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']),
  iaAssistLogin: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tecnico/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Erro ao salvar cadastro')
      router.push('/tecnico/painel')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"
  const errorClass = "text-red-500 text-xs mt-1"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-blue/30 border border-brand-blue/40 mb-4">
            <Wrench size={24} className="text-brand-gold" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Complete seu cadastro</h1>
          <p className="text-slate-400 text-sm mt-2">Preencha os dados para acessar o painel</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nome completo *</label>
                <input {...register('fullName')} className={inputClass} placeholder="Seu nome completo" />
                {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>CPF *</label>
                <input {...register('cpf')} className={inputClass} placeholder="000.000.000-00" />
                {errors.cpf && <p className={errorClass}>{errors.cpf.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Telefone *</label>
                <input {...register('phone')} className={inputClass} placeholder="(48) 99999-9999" />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelClass}>E-mail *</label>
                <input {...register('email')} type="email" className={inputClass} placeholder="seu@email.com" />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Cidade *</label>
                <input {...register('city')} className={inputClass} placeholder="Sua cidade" />
                {errors.city && <p className={errorClass}>{errors.city.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Tipo de chave Pix *</label>
                <select {...register('pixKeyType')} className={inputClass}>
                  <option value="">Selecione...</option>
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Telefone</option>
                  <option value="RANDOM">Chave aleatória</option>
                </select>
                {errors.pixKeyType && <p className={errorClass}>{errors.pixKeyType.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Chave Pix *</label>
                <input {...register('pixKey')} className={inputClass} placeholder="Sua chave Pix" />
                {errors.pixKey && <p className={errorClass}>{errors.pixKey.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Login no app IA Assist <span className="text-slate-400 font-normal">(opcional — para vinculação futura)</span></label>
                <input {...register('iaAssistLogin')} className={inputClass} placeholder="Seu login no IA Assist" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle size={16} className="text-brand-blue flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                Após salvar, seu cadastro ficará em análise. Você será notificado quando for aprovado.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold
                         py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar cadastro e acessar painel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
