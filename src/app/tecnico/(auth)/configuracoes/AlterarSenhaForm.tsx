'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function AlterarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha,  setNovaSenha]  = useState('')
  const [confirmar,  setConfirmar]  = useState('')

  const [showAtual, setShowAtual] = useState(false)
  const [showNova,  setShowNova]  = useState(false)
  const [showConf,  setShowConf]  = useState(false)

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (novaSenha.length < 6) {
      setMsg({ type: 'err', text: 'A nova senha precisa ter pelo menos 6 caracteres.' })
      return
    }
    if (novaSenha !== confirmar) {
      setMsg({ type: 'err', text: 'As senhas não conferem.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/tecnico/alterar-senha', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ senhaAtual, novaSenha, confirmar }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg({ type: 'err', text: data.error ?? 'Erro ao alterar senha.' })
      } else {
        setMsg({ type: 'ok', text: 'Senha alterada com sucesso! Use a nova senha no próximo login.' })
        setSenhaAtual('')
        setNovaSenha('')
        setConfirmar('')
      }
    } catch {
      setMsg({ type: 'err', text: 'Erro de conexão. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Senha atual */}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Senha atual</label>
        <div className="relative">
          <input
            type={showAtual ? 'text' : 'password'}
            value={senhaAtual}
            onChange={e => setSenhaAtual(e.target.value)}
            placeholder="Digite sua senha atual"
            required
            className="input pr-10 w-full"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowAtual(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showAtual ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Nova senha */}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Nova senha</label>
        <div className="relative">
          <input
            type={showNova ? 'text' : 'password'}
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            className="input pr-10 w-full"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNova(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showNova ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Confirmar */}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Confirmar nova senha</label>
        <div className="relative">
          <input
            type={showConf ? 'text' : 'password'}
            value={confirmar}
            onChange={e => setConfirmar(e.target.value)}
            placeholder="Repita a nova senha"
            required
            className="input pr-10 w-full"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConf(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {msg && (
        <div className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2.5 ${
          msg.type === 'ok'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.type === 'ok'
            ? <CheckCircle size={15} className="mt-0.5 shrink-0" />
            : <AlertCircle size={15} className="mt-0.5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !senhaAtual || !novaSenha || !confirmar}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? <Loader2 size={16} className="animate-spin" />
          : <KeyRound size={16} />}
        {loading ? 'Salvando…' : 'Alterar Senha'}
      </button>
    </form>
  )
}
