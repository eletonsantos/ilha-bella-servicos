'use client'

import { useState } from 'react'
import {
  Sparkles, Send, Loader2, CheckCircle, AlertCircle,
  RefreshCw, Eye, ChevronDown, ChevronUp, Users, UserCheck,
  Plus, X, Mail
} from 'lucide-react'

interface Technician {
  fullName: string
  email: string
}

interface Recipient {
  name: string
  email: string
}

interface Props {
  technicians: Technician[]
}

type Step = 'prompt' | 'preview' | 'confirm' | 'sending' | 'done' | 'error'
type RecipientMode = 'all' | 'select'

export default function ComunicadoClient({ technicians }: Props) {
  const [step, setStep]         = useState<Step>('prompt')
  const [prompt, setPrompt]     = useState('')
  const [subject, setSubject]   = useState('')
  const [html, setHtml]         = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null)
  const [sendError, setSendError]   = useState('')
  const [showList, setShowList] = useState(false)

  // ── DESTINATÁRIOS ──────────────────────────────────────────────────────────
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all')
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [extraRecipients, setExtraRecipients] = useState<Recipient[]>([])
  const [extraName, setExtraName]   = useState('')
  const [extraEmail, setExtraEmail] = useState('')
  const [extraError, setExtraError] = useState('')

  function toggleTech(email: string) {
    setSelectedEmails(prev => {
      const next = new Set(prev)
      next.has(email) ? next.delete(email) : next.add(email)
      return next
    })
  }

  function toggleAll() {
    if (selectedEmails.size === technicians.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(technicians.map(t => t.email)))
    }
  }

  function addExtra() {
    setExtraError('')
    if (!extraEmail.trim() || !extraEmail.includes('@')) {
      setExtraError('Informe um e-mail válido.')
      return
    }
    const name = extraName.trim() || extraEmail.split('@')[0]
    if (extraRecipients.some(r => r.email === extraEmail.trim())) {
      setExtraError('E-mail já adicionado.')
      return
    }
    setExtraRecipients(prev => [...prev, { name, email: extraEmail.trim() }])
    setExtraName('')
    setExtraEmail('')
  }

  function removeExtra(email: string) {
    setExtraRecipients(prev => prev.filter(r => r.email !== email))
  }

  // Lista final de destinatários
  const techRecipients: Recipient[] = recipientMode === 'all'
    ? technicians.map(t => ({ name: t.fullName, email: t.email }))
    : technicians.filter(t => selectedEmails.has(t.email)).map(t => ({ name: t.fullName, email: t.email }))

  const finalRecipients: Recipient[] = [
    ...techRecipients,
    ...extraRecipients.filter(e => !techRecipients.some(t => t.email === e.email)),
  ]

  // ── GERAR ──────────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (prompt.trim().length < 5) { setGenError('Descreva melhor o assunto do comunicado.'); return }
    if (finalRecipients.length === 0) { setGenError('Selecione pelo menos um destinatário.'); return }
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/admin/comunicados/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao gerar')
      setSubject(data.subject)
      setHtml(data.html)
      setStep('preview')
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Erro ao gerar comunicado')
    } finally {
      setGenerating(false)
    }
  }

  // ── ENVIAR ─────────────────────────────────────────────────────────────────
  async function handleSend() {
    setStep('sending')
    setSendError('')
    try {
      const res = await fetch('/api/admin/comunicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html, recipients: finalRecipients }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar')
      setSendResult({ sent: data.sent, failed: data.failed })
      setStep('done')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Erro ao enviar')
      setStep('error')
    }
  }

  function reset() {
    setStep('prompt')
    setPrompt('')
    setSubject('')
    setHtml('')
    setGenError('')
    setSendError('')
    setSendResult(null)
  }

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (step === 'done' && sendResult) {
    return (
      <div className="space-y-4">
        <div className="card p-6 border-l-4 border-green-400">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={22} className="text-green-500" />
            <p className="font-bold text-dark">Comunicado enviado com sucesso!</p>
          </div>
          <p className="text-slate-500 text-sm">
            <strong className="text-dark">{sendResult.sent}</strong> e-mail(s) entregue(s)
            {sendResult.failed > 0 && <> · <strong className="text-red-500">{sendResult.failed}</strong> falhou(ram)</>}
          </p>
        </div>
        <button onClick={reset}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
          <RefreshCw size={14} /> Criar novo comunicado
        </button>
      </div>
    )
  }

  // ── ERROR ──────────────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="space-y-4">
        <div className="card p-6 border-l-4 border-red-400">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle size={20} className="text-red-500" />
            <p className="font-bold text-dark">Erro ao enviar</p>
          </div>
          <p className="text-slate-500 text-sm">{sendError}</p>
        </div>
        <button onClick={() => setStep('confirm')}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
          Tentar novamente
        </button>
      </div>
    )
  }

  // ── SENDING ────────────────────────────────────────────────────────────────
  if (step === 'sending') {
    return (
      <div className="card p-8 flex flex-col items-center gap-4 text-center">
        <Loader2 size={32} className="animate-spin text-brand-blue" />
        <div>
          <p className="font-bold text-dark">Enviando comunicado...</p>
          <p className="text-slate-400 text-sm mt-1">Disparando para {finalRecipients.length} destinatário(s). Aguarde.</p>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue'

  return (
    <div className="space-y-6">

      {/* ── STEP 1: DESTINATÁRIOS + PROMPT ── */}
      <div className="card p-6 space-y-5">

        {/* Destinatários */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-brand-blue" />
            <h2 className="font-bold text-dark text-sm uppercase tracking-wide">Destinatários</h2>
          </div>

          {/* Modo: Todos ou Selecionar */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRecipientMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                recipientMode === 'all'
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue'
              }`}
            >
              <Users size={14} />
              Todos os técnicos
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${recipientMode === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {technicians.length}
              </span>
            </button>
            <button
              onClick={() => setRecipientMode('select')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                recipientMode === 'select'
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-blue'
              }`}
            >
              <UserCheck size={14} />
              Escolher técnicos
              {recipientMode === 'select' && selectedEmails.size > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-white/20">
                  {selectedEmails.size}
                </span>
              )}
            </button>
          </div>

          {/* Lista de técnicos para seleção */}
          {recipientMode === 'select' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Técnicos cadastrados</span>
                <button onClick={toggleAll} className="text-xs text-brand-blue hover:underline font-medium">
                  {selectedEmails.size === technicians.length ? 'Desmarcar todos' : 'Marcar todos'}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                {technicians.map(t => (
                  <label key={t.email} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmails.has(t.email)}
                      onChange={() => toggleTech(t.email)}
                      className="w-4 h-4 accent-brand-blue"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{t.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{t.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar e-mail avulso */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Adicionar e-mail avulso</span>
            </div>
            <div className="flex gap-2">
              <input
                value={extraName}
                onChange={e => setExtraName(e.target.value)}
                placeholder="Nome (opcional)"
                className={inputClass}
              />
              <input
                value={extraEmail}
                onChange={e => { setExtraEmail(e.target.value); setExtraError('') }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addExtra())}
                placeholder="email@exemplo.com"
                type="email"
                className={inputClass}
              />
              <button
                onClick={addExtra}
                className="flex-shrink-0 w-9 h-9 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl flex items-center justify-center transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
            {extraError && <p className="text-xs text-red-500">{extraError}</p>}

            {/* Lista de avulsos */}
            {extraRecipients.length > 0 && (
              <div className="space-y-1.5">
                {extraRecipients.map(r => (
                  <div key={r.email} className="flex items-center justify-between bg-indigo-50 rounded-lg px-3 py-1.5">
                    <div>
                      <span className="text-xs font-semibold text-dark">{r.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{r.email}</span>
                    </div>
                    <button onClick={() => removeExtra(r.email)} className="text-slate-400 hover:text-red-500 transition-colors ml-2">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo de destinatários */}
          {finalRecipients.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              ✅ <strong className="text-dark">{finalRecipients.length}</strong> destinatário(s) selecionado(s)
              {extraRecipients.length > 0 && ` (${techRecipients.length} técnico(s) + ${extraRecipients.length} avulso(s))`}
            </p>
          )}
          {finalRecipients.length === 0 && recipientMode === 'select' && (
            <p className="text-xs text-amber-600 mt-2">⚠️ Nenhum técnico selecionado. Marque ao menos um ou adicione um e-mail avulso.</p>
          )}
        </div>

        {/* Comunicado */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-indigo-500" />
            <h2 className="font-bold text-dark">
              {step === 'prompt' ? 'O que você quer comunicar?' : 'Assunto do comunicado'}
            </h2>
          </div>

          {step === 'prompt' && (
            <>
              <p className="text-slate-500 text-sm mb-3">
                Descreva em poucas palavras. A IA cria o e-mail completo para você revisar antes de enviar.
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  'Manutenção no sistema na sexta-feira das 22h às 2h',
                  'Novo prazo para envio de notas fiscais: até dia 5 de cada mês',
                  'Reunião de alinhamento online na próxima segunda às 19h',
                  'Lembrete: atualizar dados bancários para o pagamento',
                ].map(ex => (
                  <button key={ex} onClick={() => setPrompt(ex)}
                    className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-lg transition-colors text-left">
                    {ex}
                  </button>
                ))}
              </div>

              <textarea
                value={prompt}
                onChange={e => { setPrompt(e.target.value); setGenError('') }}
                placeholder="Ex: Informar que o pagamento do mês de maio será realizado na próxima sexta-feira, dia 10..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />

              {genError && (
                <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-xl mt-2">{genError}</p>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating || prompt.trim().length < 5 || finalRecipients.length === 0}
                className="mt-3 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generating
                  ? <><Loader2 size={15} className="animate-spin" /> Gerando com IA...</>
                  : <><Sparkles size={15} /> Gerar comunicado com IA</>}
              </button>
            </>
          )}

          {step !== 'prompt' && (
            <div className="space-y-3 mt-2">
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Prompt usado</p>
                <p className="text-slate-700">{prompt}</p>
              </div>
              <button onClick={reset}
                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors">
                <RefreshCw size={13} /> Gerar novo comunicado
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── STEP 2: PREVIEW ── */}
      {(step === 'preview' || step === 'confirm') && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-slate-500" />
            <h2 className="font-bold text-dark">Preview do e-mail</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Assunto</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-200">
              Prévia (o nome do destinatário substituirá {"{{nome}}"}):
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: html.replace(/\{\{nome\}\}/g, 'Técnico') }} />
            </div>
          </div>

          <p className="text-xs text-slate-400">
            💡 O texto {"{{nome}}"} será substituído pelo primeiro nome de cada destinatário no envio.
          </p>

          {step === 'preview' && (
            <button
              onClick={() => setStep('confirm')}
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
            >
              <Send size={15} /> Ficou bom, quero enviar
            </button>
          )}
        </div>
      )}

      {/* ── STEP 3: CONFIRM ── */}
      {step === 'confirm' && (
        <div className="card p-6 space-y-4 border-l-4 border-amber-400">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-amber-500" />
            <div>
              <p className="font-bold text-dark text-sm">Confirmar envio</p>
              <p className="text-slate-500 text-sm mt-0.5">
                Este comunicado será enviado para <strong>{finalRecipients.length} destinatário(s)</strong>. Confirma?
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowList(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showList ? 'Ocultar' : 'Ver'} lista de destinatários ({finalRecipients.length})
            </button>
            {showList && (
              <div className="mt-2 max-h-48 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-3">
                {finalRecipients.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-0.5">
                    <span className="text-dark font-medium">{r.name}</span>
                    <span className="text-slate-400">{r.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
            >
              <Send size={15} /> Sim, enviar agora
            </button>
            <button
              onClick={() => setStep('preview')}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
            >
              Voltar ao preview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
