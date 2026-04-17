'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface Props {
  reimbursementId: string
  description: string
  techName: string
}

export default function DeleteReembolsoButton({ reimbursementId, description, techName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    const confirmed = confirm(
      `⚠️ Excluir reembolso?\n\n` +
      `Técnico: ${techName}\n` +
      `Motivo: ${description}\n\n` +
      `Esta ação é IRREVERSÍVEL e removerá o reembolso, ` +
      `todos os itens e comprovantes vinculados.\n\n` +
      `Tem certeza que deseja excluir?`
    )
    if (!confirmed) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/reembolsos/${reimbursementId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao excluir')
      }
      router.push('/admin/reembolsos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir')
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 border-l-4 border-red-400">
      <h2 className="font-bold text-dark mb-1">Zona de perigo</h2>
      <p className="text-sm text-slate-500 mb-4">
        A exclusão remove permanentemente este reembolso, incluindo todos os itens e comprovantes anexados. Não é possível desfazer.
      </p>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        {loading ? 'Excluindo...' : 'Excluir reembolso'}
      </button>
    </div>
  )
}
