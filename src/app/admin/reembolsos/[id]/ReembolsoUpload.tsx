'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, FileText, X } from 'lucide-react'

export default function ReembolsoUpload({ reimbursementId }: { reimbursementId: string }) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(prev => [...prev, ...selected.filter(f => f.size <= 10 * 1024 * 1024)])
  }

  async function handleUpload() {
    if (!files.length) return
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const res = await fetch(`/api/admin/reembolsos/${reimbursementId}/upload`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Erro ao fazer upload')
      setFiles([])
      router.refresh()
    } catch {
      setError('Erro ao enviar comprovantes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <p className="text-sm font-medium text-slate-600">Adicionar comprovantes</p>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <label className="flex items-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-brand-blue hover:bg-blue-50/50 transition-all">
        <Upload size={16} className="text-slate-400" />
        <span className="text-sm text-slate-500">Selecionar arquivos (PDF, JPG, PNG)</span>
        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={handleFiles} className="hidden" />
      </label>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
              <FileText size={14} className="text-brand-blue flex-shrink-0" />
              <span className="text-xs text-dark truncate flex-1">{f.name}</span>
              <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">
                <X size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold py-2 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Enviando...</> : 'Enviar comprovantes'}
          </button>
        </div>
      )}
    </div>
  )
}
