'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileSignature, Pencil, Save, Loader2, CheckCircle2,
  AlertCircle, Info, RotateCcw, Eye, EyeOff,
} from 'lucide-react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Variable { tag: string; desc: string }

interface Template {
  id:        string | null
  type:      string
  title:     string
  content:   string
  version:   string
  variables: Variable[]
  isDefault: boolean
  updatedAt: string | null
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ContratosEditorPage() {
  const [templates, setTemplates]   = useState<Template[]>([])
  const [selected,  setSelected]    = useState<'CONTRATO_MAE' | 'TERMO_FECHAMENTO'>('CONTRATO_MAE')
  const [content,   setContent]     = useState('')
  const [title,     setTitle]       = useState('')
  const [loading,   setLoading]     = useState(true)
  const [saving,    setSaving]      = useState(false)
  const [success,   setSuccess]     = useState(false)
  const [error,     setError]       = useState('')
  const [preview,   setPreview]     = useState(false)

  const current = templates.find(t => t.type === selected)

  async function loadTemplates() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/contrato-template')
      if (!res.ok) throw new Error('Erro ao carregar templates')
      const data: Template[] = await res.json()
      setTemplates(data)
      const first = data.find(t => t.type === selected) ?? data[0]
      if (first) {
        setContent(first.content)
        setTitle(first.title)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTemplates() }, [])

  function handleTabChange(type: 'CONTRATO_MAE' | 'TERMO_FECHAMENTO') {
    setSelected(type)
    const tpl = templates.find(t => t.type === type)
    if (tpl) { setContent(tpl.content); setTitle(tpl.title) }
    setSuccess(false)
    setError('')
  }

  function handleReset() {
    if (!current) return
    if (!confirm('Restaurar o texto padrão original? Esta ação não pode ser desfeita.')) return
    setContent(current.content)
    setTitle(current.title)
  }

  async function handleSave() {
    if (!content.trim()) { setError('O conteúdo não pode estar vazio.'); return }
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      const res = await fetch('/api/admin/contrato-template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selected, content, title }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error?.message ?? 'Erro ao salvar'); return }
      setSuccess(true)
      await loadTemplates()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { type: 'CONTRATO_MAE' | 'TERMO_FECHAMENTO'; label: string }[] = [
    { type: 'CONTRATO_MAE',     label: 'Contrato-Mãe' },
    { type: 'TERMO_FECHAMENTO', label: 'Termo Mensal de Fechamento' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/contratos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para contratos
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark flex items-center gap-2">
            <Pencil size={20} className="text-brand-blue" />
            Editor de Templates de Contrato
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Edite o texto dos contratos. As alterações serão aplicadas em novas assinaturas.
          </p>
        </div>
      </div>

      {/* Aviso sobre variáveis */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-700">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">Variáveis disponíveis</p>
          <p className="text-xs text-blue-600">
            Use as tags <code className="bg-blue-100 px-1 rounded">{'{{VARIAVEL}}'}</code> no texto.
            Elas serão substituídas automaticamente com os dados do técnico ao gerar cada contrato.
            Veja a lista completa abaixo do editor.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-brand-blue animate-spin" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.type}
                onClick={() => handleTabChange(tab.type)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selected === tab.type
                    ? 'bg-white shadow text-dark'
                    : 'text-slate-500 hover:text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Info do template atual */}
          {current && (
            <div className="flex items-center gap-4 text-xs text-slate-400">
              {current.isDefault ? (
                <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
                  Usando template padrão
                </span>
              ) : (
                <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Template personalizado · {current.version}
                </span>
              )}
              {current.updatedAt && (
                <span>Última edição: {new Date(current.updatedAt).toLocaleString('pt-BR')}</span>
              )}
            </div>
          )}

          {/* Editor */}
          <div className="card-elevated p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Título do contrato
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Título do contrato"
                />
              </div>
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-dark transition-colors"
              >
                {preview ? <EyeOff size={16} /> : <Eye size={16} />}
                {preview ? 'Editor' : 'Pré-visualizar'}
              </button>
            </div>

            {preview ? (
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {content || 'Nenhum conteúdo'}
                </pre>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Texto do contrato (use {'{{VARIAVEL}}'} para campos dinâmicos)
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={30}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue resize-y leading-relaxed"
                  placeholder="Digite o texto completo do contrato..."
                  spellCheck={false}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {content.length.toLocaleString()} caracteres · {content.split('\n').length} linhas
                </p>
              </div>
            )}

            {/* Feedback */}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                <CheckCircle2 size={15} />
                Template salvo com sucesso! Novas assinaturas usarão este texto.
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Salvando...' : 'Salvar template'}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-slate-500 hover:text-dark text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
              >
                <RotateCcw size={15} />
                Restaurar padrão
              </button>
            </div>
          </div>

          {/* Lista de variáveis disponíveis */}
          {current?.variables && current.variables.length > 0 && (
            <div className="card-elevated p-6">
              <h3 className="text-sm font-bold text-dark mb-4 flex items-center gap-2">
                <FileSignature size={15} className="text-brand-blue" />
                Variáveis disponíveis para {tabs.find(t => t.type === selected)?.label}
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {current.variables.map(v => (
                  <div key={v.tag} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <code
                      className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded font-mono whitespace-nowrap flex-shrink-0 cursor-pointer hover:bg-brand-blue/20"
                      onClick={() => setContent(c => c + v.tag)}
                      title="Clique para inserir no final do texto"
                    >
                      {v.tag}
                    </code>
                    <span className="text-xs text-slate-500">{v.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                💡 Clique em qualquer tag para inserí-la no final do texto.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
