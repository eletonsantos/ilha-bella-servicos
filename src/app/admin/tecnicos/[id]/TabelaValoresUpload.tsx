'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Trash2, Loader2, ExternalLink } from 'lucide-react'

interface Props {
  techId: string
  tabelaName: string | null
  tabelaSize: number | null
}

export default function TabelaValoresUpload({ techId, tabelaName, tabelaSize }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving]   = useState(false)
  const [error, setError]         = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('tabela', file)
      const res = await fetch(`/api/admin/tecnicos/${techId}/tabela`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao enviar')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    if (!confirm('Remover tabela de valores deste técnico?')) return
    setRemoving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/tecnicos/${techId}/tabela`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao remover')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover')
    } finally {
      setRemoving(false)
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {tabelaName ? (
        /* Tabela já cadastrada */
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-brand-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark truncate">{tabelaName}</p>
            {tabelaSize && <p className="text-xs text-slate-400">{formatSize(tabelaSize)}</p>}
          </div>
          <a
            href={`/api/admin/tecnicos/${techId}/tabela`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-blue hover:text-brand-blue-dark text-xs font-semibold transition-colors"
          >
            <ExternalLink size={13} />
            Visualizar
          </a>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-semibold transition-colors disabled:opacity-50 ml-1"
          >
            {removing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Remover
          </button>
        </div>
      ) : (
        /* Sem tabela ainda */
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center">
          <FileText size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400 mb-3">Nenhuma tabela cadastrada</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? 'Enviando...' : 'Enviar PDF'}
          </button>
        </div>
      )}

      {/* Botão de substituir quando já existe */}
      {tabelaName && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-blue text-xs font-medium transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Enviando...' : 'Substituir PDF'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
