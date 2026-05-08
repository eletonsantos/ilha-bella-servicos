'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, MessageCircle, Send, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'model'
  parts: [{ text: string }]
  createdAt: string
}

type ApiChatResponse = {
  done?: boolean
  text?: string
  whatsappUrl?: string
  summary?: string
}

const INITIAL_FALLBACK_MESSAGE = 'Olá! 👋 Sou a Bella da Ilha Bella Serviços. Qual serviço você precisa? (Encanador, Eletricista, Chaveiro, Desentupimento...)'
const ERROR_MESSAGE = 'Desculpe, tive um problema. Pode repetir? 😅'
const QUICK_REPLIES = ['Encanador', 'Eletricista', 'Chaveiro', 'Desentupimento']

function createMessage(role: Message['role'], text: string): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    parts: [{ text }],
    createdAt: new Date().toISOString(),
  }
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState(false)
  const [done, setDone] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function loadGreeting() {
    setGreeting(true)
    setLoading(true)

    try {
      const res = await fetch('/api/chat')
      const data: ApiChatResponse = await res.json()
      setMessages([createMessage('model', data.text || INITIAL_FALLBACK_MESSAGE)])
    } catch {
      setMessages([createMessage('model', INITIAL_FALLBACK_MESSAGE)])
    } finally {
      setLoading(false)
    }
  }

  async function handleOpen() {
    setOpen(true)

    if (messages.length === 0 && !greeting) {
      await loadGreeting()
    }
  }

  async function sendMessage(text: string) {
    const normalizedText = text.trim()
    if (!normalizedText || loading || done) return

    const userMsg = createMessage('user', normalizedText)
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data: ApiChatResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.text || 'Erro ao processar mensagem')
      }

      const botMsg = createMessage('model', data.text || ERROR_MESSAGE)
      setMessages(prev => [...prev, botMsg])

      if (data.done) {
        setDone(true)
        setWhatsappUrl(data.whatsappUrl || '')
        setSummary(data.summary ?? '')
      }
    } catch {
      setMessages(prev => [...prev, createMessage('model', ERROR_MESSAGE)])
    } finally {
      setLoading(false)
    }
  }

  function handleSend() {
    sendMessage(input)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleReset() {
    setMessages([])
    setInput('')
    setDone(false)
    setWhatsappUrl('')
    setSummary('')
    setGreeting(false)
    setShowSummary(false)
    await loadGreeting()
  }

  return (
    <>
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="Abrir pré-atendimento com a Bella"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20BA5A] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/35 group"
      >
        {!open && <span className="absolute h-14 w-14 animate-ping rounded-full bg-[#25D366] opacity-30" />}

        <div className="relative z-10">
          {open
            ? <ChevronDown size={24} className="text-white" />
            : <WhatsAppIcon className="h-7 w-7 text-white" />}
        </div>

        {!open && (
          <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Fale conosco
          </span>
        )}
      </button>

      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[calc(100vw-48px)] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 sm:w-96 ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}
        style={{ maxHeight: 'min(560px, calc(100svh - 120px))' }}
      >
        <div className="flex flex-shrink-0 items-center gap-3 bg-[#075E54] px-4 py-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight text-white">Bella — Ilha Bella Serviços</p>
            <p className="text-xs text-green-300">Pré-atendimento • Online agora</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar pré-atendimento"
            className="p-1 text-white/60 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 rounded"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
          aria-live="polite"
          style={{
            background: `#e5ddd5 url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4b9b0' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {messages.length === 0 && !loading && (
            <div className="text-center">
              <div className="inline-block rounded-lg bg-[#fff9c4] px-4 py-2 text-xs text-[#7a6f00] shadow-sm">
                🤖 A Bella vai te ajudar a preparar o pedido antes do WhatsApp!
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-line ${msg.role === 'user'
                ? 'rounded-br-none bg-[#dcf8c6] text-slate-800'
                : 'rounded-bl-none bg-white text-slate-800'}`}
              >
                {msg.parts[0].text}
                <span className="mt-0.5 block text-right text-[10px] text-slate-400">
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg rounded-bl-none bg-white px-4 py-3 shadow-sm" aria-label="Bella está digitando">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {done && whatsappUrl && (
            <div className="space-y-2 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#20BA5A] hover:shadow-lg active:scale-95"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Continuar no WhatsApp →
              </a>

              <button
                onClick={() => setShowSummary(v => !v)}
                className="w-full py-1 text-center text-xs text-slate-500 transition-colors hover:text-slate-700"
              >
                {showSummary ? '▲ Ocultar' : '▼ Ver'} resumo que será enviado
              </button>

              {showSummary && (
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3 font-mono text-xs leading-relaxed text-slate-600 backdrop-blur whitespace-pre-line">
                  {summary}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full py-1 text-center text-xs text-slate-400 transition-colors hover:text-slate-600"
              >
                Recomeçar conversa
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {!done && (
          <div className="flex-shrink-0 border-t border-slate-200 bg-[#f0f0f0] px-3 py-2">
            {messages.length <= 1 && !loading && (
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                {QUICK_REPLIES.map(reply => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="flex-shrink-0 rounded-full border border-[#25D366]/30 bg-white px-3 py-1 text-xs font-medium text-[#075E54] transition-colors hover:bg-[#dcf8c6]"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={loading ? 'Aguarde...' : 'Digite sua mensagem...'}
                disabled={loading}
                maxLength={600}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label="Enviar mensagem"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] transition-all hover:bg-[#20BA5A] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? <Loader2 size={15} className="animate-spin text-white" />
                  : <Send size={15} className="ml-0.5 text-white" />}
              </button>
            </div>
          </div>
        )}

        <div className="flex-shrink-0 border-t border-slate-200 bg-[#f0f0f0] py-1.5 text-center">
          <p className="text-[10px] text-slate-400">Ilha Bella Serviços • Pré-atendimento automático</p>
        </div>
      </div>
    </>
  )
}
