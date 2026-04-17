'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Upload, Loader2, FileText, X, Receipt } from 'lucide-react'

interface Technician {
  id: string
  fullName: string
  cpf: string
  pixKey: string
  pixKeyType: string
  status: string
}

interface Item {
  category: string
  description: string
  value: string
}

const CATEGORIES = [
  { value: 'MATERIAL',   label: 'Material' },
  { value: 'FUEL',       label: 'Combustível' },
  { value: 'PARKING',    label: 'Estacionamento' },
  { value: 'TOLL',       label: 'Pedágio' },
  { value: 'OTHER',      label: 'Outros' },
]

const PIX_TYPES = [
  { value: 'CPF',    label: 'CPF' },
  { value: 'CNPJ',   label: 'CNPJ' },
  { value: 'EMAIL',  label: 'E-mail' },
  { value: 'PHONE',  label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave aleatória' },
]

export default function NovoReembolsoPage() {
  const router = useRouter()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const [form, setForm] = useState({
    technicianId: '',
    description: '',
    pixKey: '',
    pixKeyType: 'CPF',
  })

  const [items, setItems] = useState<Item[]>([
    { category: 'MATERIAL', description: '', value: '' },
  ])

  useEffect(() => {
    fetch('/api/admin/tecnicos')
      .then(r => r.json())
      .then(data => setTechnicians(data.filter((t: Technician) => t.status === 'APPROVED' || t.status === 'LINKED')))
      .catch(() => setError('Erro ao carregar técnicos'))
  }, [])

  function handleTechnicianChange(techId: string) {
    const tech = technicians.find(t => t.id === techId)
    setForm(f => ({
      ...f,
      technicianId: techId,
      pixKey: tech?.pixKey ?? '',
      pixKeyType: tech?.pixKeyType ?? 'CPF',
    }))
  }

  function addItem() {
    setItems(prev => [...prev, { category: 'MATERIAL', description: '', value: '' }])
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: keyof Item, value: string) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const totalValue = items.reduce((s, item) => s + (parseFloat(item.value) || 0), 0)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const valid = selected.filter(f => f.size <= 10 * 1024 * 1024)
    setFiles(prev => [...prev, ...valid])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.technicianId) { setError('Selecione um técnico.'); return }
    if (!form.description) { setError('Informe a descrição/motivo.'); return }
    if (items.some(i => !i.description || !i.value)) { setError('Preencha descrição e valor de todos os itens.'); return }
    if (!form.pixKey) { setError('Informe a chave PIX para pagamento.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/reembolsos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId: form.technicianId,
          description: form.description,
          pixKey: form.pixKey,
          pixKeyType: form.pixKeyType,
          items: items.map(i => ({
            category: i.category,
            description: i.description,
            value: parseFloat(i.value),
          })),
        }),
      })

      if (!res.ok) throw new Error((await res.json()).error ?? 'Erro ao criar reembolso')
      const { reimbursement } = await res.json()
      const id = reimbursement.id

      if (files.length > 0) {
        setUploadingFiles(true)
        const fd = new FormData()
        files.forEach(f => fd.append('files', f))
        await fetch(`/api/admin/reembolsos/${id}/upload`, { method: 'POST', body: fd })
        setUploadingFiles(false)
      }

      router.push(`/admin/reembolsos/${id}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/reembolsos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors">
        <ArrowLeft size={16} /> Voltar para reembolsos
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-dark">Novo Reembolso</h1>
        <p className="text-slate-500 text-sm mt-1">Registre despesas para ressarcimento ao técnico</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Técnico */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark">Técnico</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Selecione o técnico *</label>
            <select
              value={form.technicianId}
              onChange={e => handleTechnicianChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            >
              <option value="">-- Selecione --</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Motivo / Descrição *</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Materiais para manutenção elétrica – OS #1234"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              required
            />
          </div>
        </div>

        {/* Itens */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-dark">Itens de reembolso</h2>
            <button type="button" onClick={addItem}
              className="inline-flex items-center gap-1.5 text-brand-blue text-sm font-medium hover:underline">
              <Plus size={15} /> Adicionar item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-slate-50 rounded-xl p-3">
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Categoria</label>
                  <select
                    value={item.category}
                    onChange={e => updateItem(idx, 'category', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="col-span-6">
                  <label className="block text-xs text-slate-500 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(idx, 'description', e.target.value)}
                    placeholder="Descreva o item"
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.value}
                    onChange={e => updateItem(idx, 'value', e.target.value)}
                    placeholder="0,00"
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    required
                  />
                </div>
                <div className="col-span-1 flex items-end pb-1.5">
                  <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1}
                    className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <p className="text-sm font-bold text-dark">
              Total: <span className="text-brand-blue">R$ {totalValue.toFixed(2).replace('.', ',')}</span>
            </p>
          </div>
        </div>

        {/* PIX */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark">PIX para pagamento</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
              <select
                value={form.pixKeyType}
                onChange={e => setForm(f => ({ ...f, pixKeyType: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {PIX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Chave PIX *</label>
              <input
                type="text"
                value={form.pixKey}
                onChange={e => setForm(f => ({ ...f, pixKey: e.target.value }))}
                placeholder="Chave PIX para recebimento"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
          </div>
        </div>

        {/* Comprovantes */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-dark">Comprovantes</h2>
          <p className="text-sm text-slate-500">Faça upload das notas fiscais, recibos ou fotos dos comprovantes (PDF, JPG ou PNG, máx. 10MB cada).</p>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-brand-blue hover:bg-blue-50/50 transition-all">
            <Upload size={24} className="text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">Clique para selecionar</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG · máx. 10 MB cada</p>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleFiles} className="hidden" />
          </label>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <FileText size={16} className="text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">{f.name}</p>
                    <p className="text-xs text-green-600">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || uploadingFiles}
          className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> {uploadingFiles ? 'Enviando comprovantes...' : 'Criando reembolso...'}</> : <><Receipt size={18} /> Criar Reembolso</>}
        </button>
      </form>
    </div>
  )
}
