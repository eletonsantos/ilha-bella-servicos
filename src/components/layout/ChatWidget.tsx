'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, ExternalLink, MessageCircle, ChevronDown } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  parts: [{ text: string }]
  // display only
  displayText?: string
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function ChatWidget() {
  const [open, setOpen]             = useState(false)
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [greeting, setGreeting]     = useState(false)
  const [done, setDone]             = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [summary, setSummary]       = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [unread, setUnread]         = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll para o fim a cada nova mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Foca o input quando abre
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Busca a saudação inicial ao abrir pela primeira vez
  async function handleOpen() {
    setOpen(true)
    setUnread(false)
    if (messages.length === 0 && !greeting) {
      setGreeting(true)
      setLoading(true)
      try {
        const res = await fetch('/api/chat')
        const data = await res.json()
        setMessages([{ role: 'model', parts: [{ text: data.text }] }])
      } catch {
        setMessages([{
          role: 'model',
          parts: [{ text: 'Olá! 👋 Sou a Bella da Ilha Bella Serviços. Qual serviço você precisa? (Encanador, Eletricista, Chaveiro, Desentupimento...)' }],
        }])
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading || done) return

    const userMsg: Message = { role: 'user', parts: [{ text }] }
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
      const data = await res.json()

      const botMsg: Message = { role: 'model', parts: [{ text: data.text }] }
      setMessages(prev => [...prev, botMsg])

      if (data.done) {
        setDone(true)
        setWhatsappUrl(data.whatsappUrl)
        setSummary(data.summary ?? '')
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: 'Desculpe, tive um problema. Pode repetir? 😅' }],
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleReset() {
    setMessages([])
    setInput('')
    setDone(false)
    setWhatsappUrl('')
    setSummary('')
    setGreeting(false)
    setShowSummary(false)
    handleOpen()
  }

  return (
    <>
      {/* ── FAB BUTTON ── */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="Pré-atendimento"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center
                   w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full
                   shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      >
        {/* Pulse ring */}
        {!open && <span className="absolute w-14 h-14 rounded-full bg-[#25D366] animate-ping opacity-30" />}

        {/* Unread dot */}
        {unread && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        )}

        <div className="relative z-10">
          {open
            ? <ChevronDown size={24} className="text-white" />
            : <WhatsAppIcon className="w-7 h-7 text-white" />}
        </div>

        {/* Tooltip */}
        {!open && (
          <span className="absolute right-16 whitespace-nowrap bg-slate-900 text-white text-xs font-medium
                           px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                           pointer-events-none shadow-lg">
            Fale conosco
          </span>
        )}
      </button>

      {/* ── CHAT WINDOW ── */}
      <div className={`
        fixed bottom-24 right-6 z-50 w-[calc(100vw-48px)] sm:w-96
        bg-white rounded-2xl shadow-2xl border border-slate-200
        flex flex-col overflow-hidden
        transition-all duration-300 origin-bottom-right
        ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}
      `}
        style={{ maxHeight: 'min(560px, calc(100svh - 120px))' }}
      >

        {/* Header */}
        <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">Bella — Ilha Bella Serviços</p>
            <p className="text-green-300 text-xs">Pré-atendimento • Online agora</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Background pattern (like WhatsApp) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
          style={{
            background: `#e5ddd5 url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4b9b0' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}>

          {/* Aviso inicial */}
          {messages.length === 0 && !loading && (
            <div className="text-center">
              <div className="inline-block bg-[#fff9c4] text-[#7a6f00] text-xs px-4 py-2 rounded-lg shadow-sm">
                🤖 A Bella vai te ajudar a preparar o pedido antes do WhatsApp!
              </div>
            </div>
          )}

          {/* Mensagens */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[80%] px-3 py-2 rounded-lg shadow-sm text-sm leading-relaxed whitespace-pre-line
                ${msg.role === 'user'
                  ? 'bg-[#dcf8c6] text-slate-800 rounded-br-none'
                  : 'bg-white text-slate-800 rounded-bl-none'}
              `}>
                {msg.parts[0].text}
                <span className="block text-right text-[10px] text-slate-400 mt-0.5">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Botão WhatsApp quando concluído */}
          {done && whatsappUrl && (
            <div className="space-y-2 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A]
                           text-white font-bold py-3 px-4 rounded-xl transition-all
                           shadow-md hover:shadow-lg active:scale-95 text-sm"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Continuar no WhatsApp →
              </a>

              <button
                onClick={() => setShowSummary(v => !v)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 transition-colors py-1"
              >
                {showSummary ? '▲ Ocultar' : '▼ Ver'} resumo que será enviado
              </button>

              {showSummary && (
                <div className="bg-white/80 backdrop-blur rounded-xl p-3 text-xs text-slate-600
                                border border-slate-200 whitespace-pre-line font-mono leading-relaxed">
                  {summary}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
              >
                Recomeçar conversa
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!done && (
          <div className="bg-[#f0f0f0] px-3 py-2 flex items-center gap-2 flex-shrink-0 border-t border-slate-200">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? 'Aguarde...' : 'Digite sua mensagem...'}
              disabled={loading}
              className="flex-1 bg-white rounded-full px-4 py-2 text-sm focus:outline-none
                         border border-slate-200 disabled:opacity-60 placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-[#25D366] hover:bg-[#20BA5A] disabled:opacity-40
                         rounded-full flex items-center justify-center transition-all
                         disabled:cursor-not-allowed active:scale-90 flex-shrink-0"
            >
              {loading
                ? <Loader2 size={15} className="text-white animate-spin" />
                : <Send size={15} className="text-white ml-0.5" />}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#f0f0f0] text-center py-1.5 border-t border-slate-200 flex-shrink-0">
          <p className="text-[10px] text-slate-400">Ilha Bella Serviços • Pré-atendimento automático</p>
        </div>
      </div>
    </>
  )
}
