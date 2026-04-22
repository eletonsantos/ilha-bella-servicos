'use client'

import { useState } from 'react'
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react'

interface Props {
  techId:   string
  cpf:      string  // já formatado ex: 123.456.789-00
}

export default function CredenciaisCard({ techId, cpf }: Props) {
  const [novaSenha,     setNovaSenha]     = useState('')
  const [confirmar,     setConfirmar]     = useState('')
  const [showNova,      setShowNova]      = useState(false)
  const [showConf,      setShowConf]      = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [msg,           setMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [copied,        setCopied]        = useState(false)

  const cpfSoDigitos = cpf.replace(/\D/g, '')

  function copiarCPF() {
    navigator.clipboard.writeText(cpfSoDigitos).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (novaSenha.length < 6) {
      setMsg({ type: 'err', text: 'A senha precisa ter pelo menos 6 caracteres.' })
      return
    }
    if (novaSenha !== confirmar) {
      setMsg({ type: 'err', text: 'As senhas não conferem.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tecnicos/${techId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ newPassword: novaSenha }),
      })
      if (!res.ok) throw new Error()
      setMsg({ type: 'ok', text: 'Senha alterada com sucesso!' })
      setNovaSenha('')
      setConfirmar('')
    } catch {
      setMsg({ type: 'err', text: 'Erro ao alterar senha. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <KeyRound size={16} className="text-brand-blue" />
        <h2 className="text-base font-bold text-dark">Credenciais de Acesso</h2>
      </div>

      {/* Login */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Login (CPF — somente números)</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono text-dark select-all">
            {cpfSoDigitos}
          </code>
          <button
            type="button"
            onClick={copiarCPF}
            title="Copiar CPF"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-colors text-sm"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            <span className="hidden sm:block">{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          O técnico usa o CPF sem pontos ou traços para entrar no sistema.
        </p>
      </div>

      {/* Separador */}
      <div className="border-t border-slate-100" />

      {/* Alterar senha */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm font-semibold text-dark">Definir nova senha</p>
        <p className="text-xs text-slate-400 -mt-1">
          Por segurança, a senha atual não pode ser exibida. Você pode definir uma nova senha aqui.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {/* Nova senha */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Nova senha</label>
            <div className="relative">
              <input
                type={showNova ? 'text' : 'password'}
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
            <label className="block text-xs text-slate-500 mb-1">Confirmar senha</label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repita a nova senha"
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
        </div>

        {/* Feedback */}
        {msg && (
          <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
            msg.type === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg.type === 'ok'
              ? <CheckCircle size={14} />
              : <AlertCircle size={14} />}
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !novaSenha || !confirmar}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
          {loading ? 'Salvando…' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  )
}
