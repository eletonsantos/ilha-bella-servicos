'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, Loader2, FileText, X } from 'lucide-react'

interface Technician {
  id: string
  fullName: string
  cpf: string
  status: string
  user: { email: string }
}

export default function NovoFechamentoPage() {
  const router = useRouter()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    technicianId: '',
    competence: '',
    periodStart: '',
    periodEnd: '',
    totalValue: '',
    serviceCount: '',
    observations: '',
  })

  useEffect(() => {
    fetch('/api/admin/tecnicos')
      .then(r => r.json())
      .then(data => setTechnicians(data.filter((t: Technician) => t.status === 'APPROVED' || t.status === 'LINKED')))
      .catch(() => setError('Erro ao carregar técnicos'))
  }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      if (f.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são aceitos.')
        return
      }
      if (f.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 10MB.')
        return
      }
      setFile(f)
      setError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.technicianId) { setError('Selecione um técnico.'); return }
    if (!form.competence) { setError('Informe a competência.'); return }
    if (!form.periodStart || !form.periodEnd) { setError('Informe o período.'); return }
    if (!form.totalValue || isNaN(parseFloat(form.totalValue))) { setError('Informe o valor total.'); return }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('technicianId', form.technicianId)
      formData.append('competence', form.competence)
      formData.append('periodStart', form.periodStart)
      formData.append('periodEnd', form.periodEnd)
      formData.append('totalValue', form.totalValue)
      formData.append('serviceCount', form.serviceCount || '0')
      formData.append('observations', form.observations)
      if (file) formData.append('report', file)

      const res = await fetch('/api/admin/fechamentos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar fechamento')
      }

      router.push('/admin/fechamentos')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/fechamentos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors">
        <ArrowLeft size={16} /> Voltar para fechamentos
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-dark">Novo Fechamento</h1>
        <p className="text-slate-500 text-sm mt-1">Crie um fechamento e envie o relatório PDF para o técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Técnico */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark">Técnico</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Selecione o técnico *</label>
            <select
              value={form.technicianId}
              onChange={e => setForm(f => ({ ...f, technicianId: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            >
              <option value="">-- Selecione --</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>
                  {t.fullName} — {t.user.email}
                </option>
              ))}
            </select>
            {technicians.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">Nenhum técnico aprovado encontrado.</p>
            )}
          </div>
        </div>

        {/* Período */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark">Período</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Competência * <span className="text-slate-400 font-normal">(ex: Abril/2026)</span></label>
            <input
              type="text"
              value={form.competence}
              onChange={e => setForm(f => ({ ...f, competence: e.target.value }))}
              placeholder="Abril/2026"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data início *</label>
              <input
                type="date"
                value={form.periodStart}
                onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data fim *</label>
              <input
                type="date"
                value={form.periodEnd}
                onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark">Valores</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor total (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.totalValue}
                onChange={e => setForm(f => ({ ...f, totalValue: e.target.value }))}
                placeholder="930,00"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Qtd. serviços</label>
              <input
                type="number"
                min="0"
                value={form.serviceCount}
                onChange={e => setForm(f => ({ ...f, serviceCount: e.target.value }))}
                placeholder="25"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações</label>
            <textarea
              value={form.observations}
              onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
              placeholder="Informações adicionais para o técnico..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>
        </div>

        {/* Upload PDF */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark">Relatório PDF</h2>
          <p className="text-sm text-slate-500">Faça upload do relatório gerado pelo IA Assist. O técnico poderá baixar o PDF no painel.</p>

          {!file ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-brand-blue hover:bg-blue-50/50 transition-all">
              <Upload size={28} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">Clique para selecionar o PDF</p>
              <p className="text-xs text-slate-400 mt-1">Máximo 10MB</p>
              <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
            </label>
          ) : (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <FileText size={20} className="text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{file.name}</p>
                <p className="text-xs text-green-600">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Criando fechamento...</> : 'Criar Fechamento'}
        </button>
      </form>
    </div>
  )
}
