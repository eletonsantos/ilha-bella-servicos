'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Plus,
  ArrowRight,
  AlertCircle,
  DollarSign,
} from 'lucide-react'

export interface TimelineEvent {
  id:          string
  eventType:   string
  statusFrom:  string | null
  statusTo:    string | null
  description: string | null
  adminNote:   string | null
  createdBy:   string
  createdAt:   Date | string
  emailLog?: {
    recipient: string
    template:  string
    status:    string
    sentAt:    Date | string | null
  } | null
}

interface Props {
  events: TimelineEvent[]
  /** Se false, oculta detalhes do e-mail (para o prestador) */
  showEmailDetails?: boolean
}

const EVENT_ICONS: Record<string, React.ElementType> = {
  CLOSING_CREATED:   Plus,
  STATUS_CHANGED:    ArrowRight,
  INVOICE_SUBMITTED: FileText,
  NOTE_ADDED:        AlertCircle,
}

const STATUS_TO_ICON: Record<string, React.ElementType> = {
  CLOSING_AVAILABLE: Clock,
  AWAITING_INVOICE:  Clock,
  INVOICE_SENT:      FileText,
  UNDER_REVIEW:      AlertCircle,
  PAYMENT_RELEASED:  DollarSign,
  PAID:              CheckCircle,
}

const STATUS_TO_COLOR: Record<string, string> = {
  CLOSING_AVAILABLE: 'bg-blue-100 text-blue-700 border-blue-200',
  AWAITING_INVOICE:  'bg-amber-100 text-amber-700 border-amber-200',
  INVOICE_SENT:      'bg-purple-100 text-purple-700 border-purple-200',
  UNDER_REVIEW:      'bg-orange-100 text-orange-700 border-orange-200',
  PAYMENT_RELEASED:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  PAID:              'bg-green-100 text-green-700 border-green-200',
}

const ICON_BG: Record<string, string> = {
  CLOSING_CREATED:   'bg-brand-blue text-white',
  STATUS_CHANGED:    'bg-slate-600 text-white',
  INVOICE_SUBMITTED: 'bg-purple-600 text-white',
  NOTE_ADDED:        'bg-amber-500 text-white',
}

export default function ClosingTimeline({ events, showEmailDetails = false }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        Nenhum evento registrado ainda.
      </div>
    )
  }

  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" aria-hidden />

      <div className="space-y-5">
        {sorted.map((ev, idx) => {
          const Icon = (ev.statusTo ? STATUS_TO_ICON[ev.statusTo] : null)
            ?? EVENT_ICONS[ev.eventType]
            ?? Clock
          const iconBg = ICON_BG[ev.eventType] ?? 'bg-slate-400 text-white'
          const isLast = idx === sorted.length - 1

          return (
            <div key={ev.id} className="flex gap-4 relative">
              {/* Ícone */}
              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${iconBg}`}>
                <Icon size={16} />
              </div>

              {/* Conteúdo */}
              <div className={`flex-1 pb-5 ${isLast ? '' : 'border-b border-slate-50'}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {ev.description && (
                      <p className="text-sm font-semibold text-dark leading-snug">{ev.description}</p>
                    )}
                    {ev.statusTo && STATUS_TO_COLOR[ev.statusTo] && (
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${STATUS_TO_COLOR[ev.statusTo]}`}>
                        {ev.statusTo.replace(/_/g, ' ')}
                      </span>
                    )}
                    {ev.adminNote && (
                      <p className="mt-1.5 text-xs text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        <span className="font-semibold">Obs: </span>{ev.adminNote}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-400">
                      {format(new Date(ev.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{ev.createdBy}</p>
                  </div>
                </div>

                {/* Detalhes do e-mail (só admin) */}
                {showEmailDetails && ev.emailLog && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={11} />
                    <span>
                      E-mail {ev.emailLog.status === 'SENT' ? '✓ enviado' : ev.emailLog.status === 'FAILED' ? '✗ falhou' : 'pendente'}
                      {ev.emailLog.status === 'SENT' && ev.emailLog.sentAt
                        ? ` em ${format(new Date(ev.emailLog.sentAt), "dd/MM/yy HH:mm", { locale: ptBR })}`
                        : ''}
                      {' '}&rarr; {ev.emailLog.recipient}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
