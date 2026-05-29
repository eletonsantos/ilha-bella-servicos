export type ClosingStatus =
  | 'AWAITING_CLOSING'
  | 'CLOSING_AVAILABLE'
  | 'AWAITING_INVOICE'
  | 'INVOICE_SENT'
  | 'UNDER_REVIEW'
  | 'PAYMENT_RELEASED'
  | 'PAID'

export type ProfileStatus =
  // Status legados (compatibilidade retroativa)
  | 'INITIATED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'LINKED'
  // Novo fluxo de homologação
  | 'CADASTRO_INICIADO'
  | 'CNPJ_PENDENTE'
  | 'CNPJ_IRREGULAR'
  | 'DADOS_INCOMPLETOS'
  | 'TECNICO_RESPONSAVEL_PENDENTE'
  | 'CONTRATO_MAE_PENDENTE'
  | 'CONTRATO_MAE_ASSINADO'
  | 'EM_ANALISE_ADMINISTRATIVA'
  | 'HOMOLOGADO_ATIVO'
  | 'SUSPENSO'
  | 'BLOQUEADO'
  | 'BLOQUEADO_PAGAMENTO'
  | 'INATIVO'

/** Status que permitem acesso operacional completo à plataforma */
export const OPERATIONAL_STATUSES: ProfileStatus[] = [
  'HOMOLOGADO_ATIVO',
  // Legados — considerados operacionais para não bloquear técnicos antigos
  'APPROVED',
  'LINKED',
]

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'

export type Role = 'ADMIN' | 'TECHNICIAN'

export const CLOSING_STATUS_LABELS: Record<string, string> = {
  AWAITING_CLOSING: 'Aguardando fechamento',
  CLOSING_AVAILABLE: 'Fechamento disponível',
  AWAITING_INVOICE: 'Aguardando NF',
  INVOICE_SENT: 'NF enviada',
  UNDER_REVIEW: 'Em conferência',
  PAYMENT_RELEASED: 'Pagamento liberado',
  PAID: 'Pago',
}

export const CLOSING_STATUS_COLORS: Record<string, string> = {
  AWAITING_CLOSING: 'bg-slate-100 text-slate-600',
  CLOSING_AVAILABLE: 'bg-blue-100 text-blue-700',
  AWAITING_INVOICE: 'bg-amber-100 text-amber-700',
  INVOICE_SENT: 'bg-purple-100 text-purple-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  PAYMENT_RELEASED: 'bg-emerald-100 text-emerald-700',
  PAID: 'bg-green-100 text-green-700',
}

export const PROFILE_STATUS_LABELS: Record<string, string> = {
  // Legados
  INITIATED:         'Cadastro iniciado',
  AWAITING_APPROVAL: 'Aguardando aprovação',
  APPROVED:          'Aprovado',
  LINKED:            'Vinculado',
  // Novo fluxo
  CADASTRO_INICIADO:            'Cadastro iniciado',
  CNPJ_PENDENTE:                'CNPJ pendente',
  CNPJ_IRREGULAR:               'CNPJ irregular',
  DADOS_INCOMPLETOS:            'Dados incompletos',
  TECNICO_RESPONSAVEL_PENDENTE: 'Técnico responsável pendente',
  CONTRATO_MAE_PENDENTE:        'Contrato-Mãe pendente',
  CONTRATO_MAE_ASSINADO:        'Contrato-Mãe assinado',
  EM_ANALISE_ADMINISTRATIVA:    'Em análise administrativa',
  HOMOLOGADO_ATIVO:             'Homologado / Ativo',
  SUSPENSO:                     'Suspenso',
  BLOQUEADO:                    'Bloqueado',
  BLOQUEADO_PAGAMENTO:          'Bloqueado (pagamento)',
  INATIVO:                      'Inativo',
}

export const PROFILE_STATUS_COLORS: Record<string, string> = {
  // Legados
  INITIATED:         'bg-slate-100 text-slate-600',
  AWAITING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED:          'bg-green-100 text-green-700',
  LINKED:            'bg-blue-100 text-blue-700',
  // Novo fluxo
  CADASTRO_INICIADO:            'bg-slate-100 text-slate-600',
  CNPJ_PENDENTE:                'bg-amber-100 text-amber-700',
  CNPJ_IRREGULAR:               'bg-red-100 text-red-700',
  DADOS_INCOMPLETOS:            'bg-orange-100 text-orange-700',
  TECNICO_RESPONSAVEL_PENDENTE: 'bg-amber-100 text-amber-700',
  CONTRATO_MAE_PENDENTE:        'bg-amber-100 text-amber-700',
  CONTRATO_MAE_ASSINADO:        'bg-blue-100 text-blue-700',
  EM_ANALISE_ADMINISTRATIVA:    'bg-purple-100 text-purple-700',
  HOMOLOGADO_ATIVO:             'bg-green-100 text-green-700',
  SUSPENSO:                     'bg-orange-100 text-orange-700',
  BLOQUEADO:                    'bg-red-100 text-red-700',
  BLOQUEADO_PAGAMENTO:          'bg-red-100 text-red-700',
  INATIVO:                      'bg-slate-100 text-slate-500',
}

export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  PENDING:  'Aguardando análise',
  APPROVED: 'Contestação aprovada',
  REJECTED: 'Contestação recusada',
}

export const DISPUTE_STATUS_COLORS: Record<string, string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export const ADVANCE_STATUS_LABELS: Record<string, string> = {
  PENDING:  'Aguardando aprovação',
  APPROVED: 'Antecipação aprovada',
  REJECTED: 'Antecipação recusada',
}

export const ADVANCE_STATUS_COLORS: Record<string, string> = {
  PENDING:  'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export const PIX_KEY_TYPE_LABELS: Record<string, string> = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  EMAIL: 'E-mail',
  PHONE: 'Telefone',
  RANDOM: 'Chave aleatória',
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendente',
  EM_ANALISE: 'Em análise',
  APPROVED:   'Aprovado',
  REJECTED:   'Reprovado',
  CONVERTED:  'Acesso criado',
}

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-700',
  EM_ANALISE: 'bg-blue-100 text-blue-700',
  APPROVED:   'bg-green-100 text-green-700',
  REJECTED:   'bg-red-100 text-red-700',
  CONVERTED:  'bg-indigo-100 text-indigo-700',
}

export const REIMBURSEMENT_STATUS_LABELS: Record<string, string> = {
  PENDING:          'Aguardando análise',
  UNDER_REVIEW:     'Em análise',
  APPROVED:         'Aprovado',
  PAYMENT_RELEASED: 'Pagamento agendado',
  PAID:             'Pago',
  REJECTED:         'Recusado',
}

export const REIMBURSEMENT_STATUS_COLORS: Record<string, string> = {
  PENDING:          'bg-amber-100 text-amber-700',
  UNDER_REVIEW:     'bg-orange-100 text-orange-700',
  APPROVED:         'bg-blue-100 text-blue-700',
  PAYMENT_RELEASED: 'bg-emerald-100 text-emerald-700',
  PAID:             'bg-green-100 text-green-700',
  REJECTED:         'bg-red-100 text-red-700',
}

export const REIMBURSEMENT_CATEGORY_LABELS: Record<string, string> = {
  MATERIAL:   'Material',
  FUEL:       'Combustível',
  PARKING:    'Estacionamento',
  TOLL:       'Pedágio',
  OTHER:      'Outros',
}

export const REIMBURSEMENT_CATEGORY_COLORS: Record<string, string> = {
  MATERIAL:   'bg-blue-100 text-blue-700',
  FUEL:       'bg-orange-100 text-orange-700',
  PARKING:    'bg-slate-100 text-slate-700',
  TOLL:       'bg-purple-100 text-purple-700',
  OTHER:      'bg-gray-100 text-gray-700',
}
