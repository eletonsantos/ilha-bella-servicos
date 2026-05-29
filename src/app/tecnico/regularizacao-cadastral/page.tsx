'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, UserCheck, FileSignature, Clock, CheckCircle2,
  AlertCircle, Loader2, ChevronRight, ArrowRight, Shield,
  ShieldOff, XCircle, Info,
} from 'lucide-react'
import {
  TEXTO_ACEITE_CONTRATO_MAE,
  TEXTO_ACEITE_TECNICO_RESPONSAVEL,
  TEXTO_ACEITE_TERMO_AUTONOMO,
  CURRENT_CONTRACT_VERSION,
  CONTRACT_VERSION_LABELS,
} from '@/lib/contrato-mae'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ProviderTechnician {
  id:           string
  nomeCompleto: string
  cpf:          string
  telefone:     string
  email:        string
  funcao:       string
  especialidade: string
  cidade:       string
  uf:           string
  vinculo:      string
  isPrincipal:  boolean
  isRepLegal:   boolean
  declaracaoAceita: boolean
}

interface ProfileData {
  id:           string
  status:       string
  contractType: string | null
  fullName:     string
  cpf:          string
  email:        string
  phone:        string
  city:         string
  cnpj:         string | null
  razaoSocial:  string | null
  nomeFantasia: string | null
  cnpjSituacao: string | null
  cnpjCheckedAt: string | null
  adminNotes:   string | null
  masterContractVersion:   string | null
  masterContractSignedAt:  string | null
  masterContractSignedName: string | null
  providerTechnicians: ProviderTechnician[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VINCULO_OPTIONS = [
  { value: 'SOCIO',            label: 'Sócio' },
  { value: 'REPRESENTANTE',    label: 'Representante Legal' },
  { value: 'EMPREGADO',        label: 'Empregado CLT' },
  { value: 'PARCEIRO',         label: 'Parceiro técnico' },
  { value: 'PREPOSTO',         label: 'Preposto' },
  { value: 'TECNICO_INDICADO', label: 'Técnico indicado' },
]

const VINCULO_LABELS: Record<string, string> = Object.fromEntries(VINCULO_OPTIONS.map(o => [o.value, o.label]))

function stepFromStatus(status: string, contractType: string | null, profile?: ProfileData | null): number {
  switch (status) {
    case 'CADASTRO_INICIADO':
      return contractType === 'PJ_TERCEIRIZADO' ? 1 : 2
    case 'CNPJ_PENDENTE':
      return 1
    case 'CNPJ_IRREGULAR':
      return 1
    case 'DADOS_INCOMPLETOS':
      return 1
    case 'TECNICO_RESPONSAVEL_PENDENTE':
      return 2
    case 'CONTRATO_MAE_PENDENTE':
      return 3
    case 'CONTRATO_MAE_ASSINADO':
    case 'EM_ANALISE_ADMINISTRATIVA':
      return 4

    // Técnicos com status legado (APPROVED / LINKED / HOMOLOGADO_ATIVO) que ainda
    // não assinaram o Contrato-Mãe: detectar o passo pelo que já está preenchido
    case 'APPROVED':
    case 'LINKED':
    case 'HOMOLOGADO_ATIVO':
    default:
      if (contractType !== 'PJ_TERCEIRIZADO') return 4 // autônomo — não precisa de fluxo
      if (!profile) return 1
      if (profile.masterContractSignedAt) return 4     // já assinou — aguardando
      if (profile.providerTechnicians.length > 0) return 3 // tem resp., falta contrato
      if (profile.cnpj && profile.cnpjSituacao === 'ATIVA') return 2 // tem CNPJ, falta resp.
      return 1                                          // falta CNPJ
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RegularizacaoCadastralPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep]       = useState(1)
  const [error, setError]     = useState('')

  async function loadProfile() {
    try {
      const res = await fetch('/api/tecnico/regularizacao-cadastral')
      if (res.status === 401) { router.replace('/tecnico/login'); return }
      if (!res.ok) throw new Error('Erro ao carregar dados')
      const data: ProfileData = await res.json()
      setProfile(data)
      setStep(stepFromStatus(data.status, data.contractType, data))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex items-center justify-center">
        <Loader2 size={32} className="text-white animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 text-white rounded-2xl p-8 max-w-md text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />
          <p className="font-bold text-lg mb-2">Erro ao carregar</p>
          <p className="text-slate-300 text-sm mb-4">{error || 'Tente novamente'}</p>
          <button
            onClick={loadProfile}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl text-sm font-medium transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // Bloqueado / Suspenso / Inativo → mensagem especial
  if (['SUSPENSO', 'BLOQUEADO', 'BLOQUEADO_PAGAMENTO', 'INATIVO'].includes(profile.status)) {
    return <StatusBloqueadoPage profile={profile} />
  }

  const isPJ   = profile.contractType === 'PJ_TERCEIRIZADO'
  const totalSteps = isPJ ? 4 : 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-10 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-blue/30 border border-brand-blue/40 mb-4">
            <Shield size={26} className="text-brand-gold" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Regularização Cadastral</h1>
          <p className="text-slate-400 text-sm mt-2">
            Complete as etapas abaixo para ter acesso à plataforma
          </p>
        </div>

        {/* Indicador de etapas */}
        <StepsIndicator step={step} total={totalSteps} isPJ={isPJ} />

        {/* Conteúdo por etapa */}
        <div className="mt-6">
          {isPJ && step === 1 && (
            <StepCNPJ profile={profile} onSuccess={() => { loadProfile() }} />
          )}
          {step === (isPJ ? 2 : 1) && (
            <StepTecnicoResponsavel
              profile={profile}
              onSuccess={() => { loadProfile() }}
              onSkip={isPJ ? undefined : () => setStep(isPJ ? 3 : 2)}
              onBack={isPJ ? () => setStep(1) : undefined}
            />
          )}
          {step === (isPJ ? 3 : 2) && (
            <StepContratoMae
              profile={profile}
              onSuccess={() => { loadProfile() }}
              onBack={() => setStep(isPJ ? 2 : 1)}
            />
          )}
          {step === (isPJ ? 4 : 3) && (
            <StepAguardandoAprovacao profile={profile} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Steps indicator ─────────────────────────────────────────────────────────

function StepsIndicator({ step, total, isPJ }: { step: number; total: number; isPJ: boolean }) {
  const steps = isPJ
    ? [
        { label: 'CNPJ',        icon: Building2 },
        { label: 'Técnico',     icon: UserCheck },
        { label: 'Contrato',    icon: FileSignature },
        { label: 'Aprovação',   icon: Clock },
      ]
    : [
        { label: 'Técnico',     icon: UserCheck },
        { label: 'Contrato',    icon: FileSignature },
        { label: 'Aprovação',   icon: Clock },
      ]

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => {
        const num     = i + 1
        const active  = num === step
        const done    = num < step
        const Icon    = s.icon
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex flex-col items-center gap-1 ${active ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? 'bg-green-500 border-green-400' :
                active ? 'bg-brand-blue border-brand-blue' :
                         'bg-white/10 border-white/20'
              }`}>
                {done ? <CheckCircle2 size={18} className="text-white" /> : <Icon size={18} className="text-white" />}
              </div>
              <span className="text-white text-xs font-medium whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mt-[-20px] ${num < step ? 'bg-green-400' : 'bg-white/20'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: CNPJ ────────────────────────────────────────────────────────────

function StepCNPJ({ profile, onSuccess }: { profile: ProfileData; onSuccess: () => void }) {
  const [cnpj, setCnpj]       = useState(profile.cnpj?.replace(/\D/g, '') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState<{ situacao: string; razaoSocial: string | null; ativo: boolean } | null>(null)

  const isIrregular = profile.status === 'CNPJ_IRREGULAR'

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/tecnico/cnpj-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro na consulta'); return }
      setResult(data)
      if (data.ativo) {
        setTimeout(onSuccess, 1200)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function formatCNPJ(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 14)
    return d
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand-blue/20 flex items-center justify-center">
          <Building2 size={20} className="text-brand-blue" />
        </div>
        <div>
          <h2 className="text-white font-bold">Validação do CNPJ</h2>
          <p className="text-slate-400 text-xs">Informe o CNPJ da sua empresa para validação automática</p>
        </div>
      </div>

      {isIrregular && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl p-4 mb-5 flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">CNPJ irregular</p>
            <p className="text-xs mt-0.5 opacity-80">
              Seu CNPJ está com situação {profile.cnpjSituacao ?? 'irregular'} na Receita Federal.
              Regularize o CNPJ e tente novamente, ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      )}

      {profile.cnpj && profile.cnpjSituacao === 'ATIVA' && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-300 text-sm rounded-xl p-4 mb-5 flex items-center gap-2">
          <CheckCircle2 size={16} />
          CNPJ {profile.cnpj} validado com sucesso — {profile.razaoSocial}
        </div>
      )}

      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="text-slate-300 text-sm font-medium block mb-1.5">CNPJ da empresa</label>
          <input
            type="text"
            value={formatCNPJ(cnpj)}
            onChange={e => setCnpj(e.target.value.replace(/\D/g, ''))}
            placeholder="00.000.000/0000-00"
            maxLength={18}
            required
            className="w-full bg-white/5 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-mono"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {result && !result.ativo && (
          <div className="flex items-start gap-2 text-amber-300 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <XCircle size={15} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">CNPJ não está ativo</p>
              <p className="text-xs mt-0.5">Situação: {result.situacao}</p>
            </div>
          </div>
        )}

        {result?.ativo && (
          <div className="flex items-center gap-2 text-green-300 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <CheckCircle2 size={15} />
            CNPJ ativo! {result.razaoSocial && `— ${result.razaoSocial}`}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || cnpj.length < 14}
          className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          {loading ? 'Consultando Receita Federal...' : 'Validar CNPJ'}
        </button>
      </form>
    </div>
  )
}

// ─── Step 2: Técnico responsável ─────────────────────────────────────────────

function StepTecnicoResponsavel({
  profile,
  onSuccess,
  onSkip,
  onBack,
}: {
  profile: ProfileData
  onSuccess: () => void
  onSkip?: () => void
  onBack?: () => void
}) {
  const [form, setForm] = useState({
    nomeCompleto:    '',
    cpf:             '',
    telefone:        '',
    email:           '',
    funcao:          '',
    especialidade:   '',
    cidade:          '',
    uf:              '',
    vinculo:         'SOCIO',
    isPrincipal:     true,
    isRepLegal:      false,
    declaracaoAceita: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const existing = profile.providerTechnicians

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.declaracaoAceita) {
      setError('Você precisa aceitar a declaração para continuar.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tecnico/tecnico-responsavel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error?.message ?? JSON.stringify(data.error) ?? 'Erro ao salvar'); return }
      onSuccess()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function set(k: string, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <UserCheck size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-white font-bold">Técnico Responsável</h2>
          <p className="text-slate-400 text-xs">Indique o profissional responsável pela execução dos serviços</p>
        </div>
      </div>

      {/* Técnicos já cadastrados */}
      {existing.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-slate-400 text-xs uppercase font-semibold tracking-wide">Já cadastrados</p>
          {existing.map(t => (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-300 flex items-center gap-3">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">{t.nomeCompleto}</p>
                <p className="text-xs text-slate-400">{VINCULO_LABELS[t.vinculo]} · {t.especialidade}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-3 mt-3">
            <button
              onClick={onSuccess}
              className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <ChevronRight size={16} />
              Continuar com este técnico
            </button>
          </div>
          <p className="text-slate-500 text-xs text-center mt-1">ou adicione outro abaixo</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-slate-300 text-xs font-medium block mb-1">Nome completo</label>
            <input
              required
              value={form.nomeCompleto}
              onChange={e => set('nomeCompleto', e.target.value)}
              className="input-dark w-full"
              placeholder="Nome completo do técnico"
            />
          </div>
          <div>
            <label className="text-slate-300 text-xs font-medium block mb-1">CPF</label>
            <input
              required
              value={form.cpf}
              onChange={e => set('cpf', e.target.value)}
              className="input-dark w-full"
              placeholder="000.000.000-00"
            />
          </div>
          <div>
            <label className="text-slate-300 text-xs font-medium block mb-1">Telefone</label>
            <input
              required
              value={form.telefone}
              onChange={e => set('telefone', e.target.value)}
              className="input-dark w-full"
              placeholder="(48) 99999-9999"
            />
          </div>
          <div className="col-span-2">
            <label className="text-slate-300 text-xs font-medium block mb-1">E-mail</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="input-dark w-full"
              placeholder="tecnico@empresa.com.br"
            />
          </div>
          <div>
            <label className="text-slate-300 text-xs font-medium block mb-1">Função / Cargo</label>
            <input
              required
              value={form.funcao}
              onChange={e => set('funcao', e.target.value)}
              className="input-dark w-full"
              placeholder="Ex.: Sócio-administrador"
            />
          </div>
          <div>
            <label className="text-slate-300 text-xs font-medium block mb-1">Especialidade</label>
            <input
              required
              value={form.especialidade}
              onChange={e => set('especialidade', e.target.value)}
              className="input-dark w-full"
              placeholder="Ex.: Elétrica residencial"
            />
          </div>
          <div>
            <label className="text-slate-300 text-xs font-medium block mb-1">Cidade</label>
            <input
              required
              value={form.cidade}
              onChange={e => set('cidade', e.target.value)}
              className="input-dark w-full"
              placeholder="Florianópolis"
            />
          </div>
          <div>
            <label className="text-slate-300 text-xs font-medium block mb-1">UF</label>
            <input
              required
              value={form.uf}
              maxLength={2}
              onChange={e => set('uf', e.target.value.toUpperCase())}
              className="input-dark w-full uppercase"
              placeholder="SC"
            />
          </div>
          <div className="col-span-2">
            <label className="text-slate-300 text-xs font-medium block mb-1">Vínculo com a empresa</label>
            <select
              value={form.vinculo}
              onChange={e => set('vinculo', e.target.value)}
              className="input-dark w-full"
            >
              {VINCULO_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPrincipal}
              onChange={e => set('isPrincipal', e.target.checked)}
              className="rounded"
            />
            Técnico principal
          </label>
          <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isRepLegal}
              onChange={e => set('isRepLegal', e.target.checked)}
              className="rounded"
            />
            Representante legal
          </label>
        </div>

        {/* Declaração */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
            <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p>{TEXTO_ACEITE_TECNICO_RESPONSAVEL}</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.declaracaoAceita}
              onChange={e => set('declaracaoAceita', e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-slate-200 text-sm font-medium">
              Confirmo e aceito a declaração acima
            </span>
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              ← Voltar
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !form.declaracaoAceita}
            className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? 'Salvando...' : 'Salvar e continuar'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Step 3: Assinar Contrato-Mãe ────────────────────────────────────────────

function StepContratoMae({ profile, onSuccess, onBack }: { profile: ProfileData; onSuccess: () => void; onBack?: () => void }) {
  const router                               = useRouter()
  const isPJ                                 = profile.contractType === 'PJ_TERCEIRIZADO'
  const [signerName,     setSignerName]     = useState(profile.fullName)
  const [signerDocument, setSignerDocument] = useState(isPJ ? (profile.cnpj ?? profile.cpf) : (profile.cpf ?? ''))
  const [declaracao,     setDeclaracao]     = useState(false)
  const [showContract,   setShowContract]   = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')

  const tecnico = profile.providerTechnicians[0]

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!declaracao) { setError('Você precisa aceitar o contrato para continuar.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tecnico/contrato-mae/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, signerDocument, declaracaoAceita: declaracao }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error?.message ?? 'Erro ao assinar contrato'); return }
      // Técnicos já operacionais (APPROVED/LINKED) são promovidos a HOMOLOGADO_ATIVO
      // direto — redireciona para o portal sem precisar aguardar aprovação
      if (data.newStatus === 'HOMOLOGADO_ATIVO') {
        router.replace('/tecnico/painel')
        return
      }
      onSuccess()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const contratoTitle  = isPJ ? 'Contrato-Mãe de Prestação de Serviços' : 'Termo de Compromisso — Prestador Autônomo'
  const contratoSubtitle = isPJ
    ? `${CONTRACT_VERSION_LABELS[CURRENT_CONTRACT_VERSION]} · Assinatura eletrônica com validade jurídica`
    : 'Termo individual · Assinatura eletrônica com validade jurídica'
  const textoAceite   = isPJ ? TEXTO_ACEITE_CONTRATO_MAE : TEXTO_ACEITE_TERMO_AUTONOMO
  const labelAceite   = isPJ ? 'Li e aceito integralmente o Contrato-Mãe de Prestação de Serviços' : 'Li e aceito integralmente o Termo de Compromisso Autônomo'
  const clausulaCount = isPJ ? '19 cláusulas' : '8 cláusulas'
  const labelBotao    = isPJ ? 'Assinar Contrato-Mãe eletronicamente' : 'Assinar Termo de Compromisso eletronicamente'

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <FileSignature size={20} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-white font-bold">{contratoTitle}</h2>
          <p className="text-slate-400 text-xs">{contratoSubtitle}</p>
        </div>
      </div>

      {/* Resumo das partes */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 space-y-3 text-sm">
        <div>
          <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide mb-1">Contratante</p>
          <p className="text-white font-bold">Ilha Bella Serviços &amp; Assistência 24 Horas Ltda</p>
          <p className="text-slate-400 text-xs">CNPJ 28.864.149/0001-38 · Biguaçu/SC</p>
        </div>
        <div className="border-t border-white/10 pt-3">
          <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide mb-1">
            {isPJ ? 'Contratada (sua empresa)' : 'Prestador Autônomo'}
          </p>
          <p className="text-white font-bold">{profile.razaoSocial ?? profile.fullName}</p>
          {isPJ && profile.cnpj && (
            <p className="text-slate-400 text-xs">CNPJ {profile.cnpj} · Situação: {profile.cnpjSituacao}</p>
          )}
          {!isPJ && profile.cpf && (
            <p className="text-slate-400 text-xs">CPF {profile.cpf} · {profile.city}</p>
          )}
        </div>
        {isPJ && tecnico && (
          <div className="border-t border-white/10 pt-3">
            <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide mb-1">Técnico responsável indicado</p>
            <p className="text-white">{tecnico.nomeCompleto}</p>
            <p className="text-slate-400 text-xs">{tecnico.especialidade} · {VINCULO_LABELS[tecnico.vinculo]}</p>
          </div>
        )}
      </div>

      {/* Ver contrato */}
      <button
        type="button"
        onClick={() => setShowContract(!showContract)}
        className="w-full text-brand-blue hover:text-blue-300 text-sm font-medium py-2 flex items-center justify-center gap-2 transition mb-4"
      >
        <FileSignature size={16} />
        {showContract ? 'Ocultar termo' : `Ler termo completo (${clausulaCount})`}
      </button>

      {showContract && (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-5 mb-5 max-h-72 overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-3 font-mono">
          <p className="text-white font-bold text-sm text-center mb-4">
            {isPJ ? 'CONTRATO-MÃE DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS' : 'TERMO DE COMPROMISSO — PRESTADOR AUTÔNOMO'}
          </p>
          <p>CONTRATANTE: ILHA BELLA SERVICOS &amp; ASSISTENCIA 24 HORAS LTDA, CNPJ 28.864.149/0001-38</p>
          {isPJ
            ? <p>CONTRATADA: {profile.razaoSocial ?? profile.fullName}, CNPJ {profile.cnpj ?? '—'}</p>
            : <p>PRESTADOR: {profile.fullName}, CPF {profile.cpf ?? '—'}, {profile.city}</p>
          }
          <p className="opacity-50">— O termo completo com {clausulaCount} será gerado com seus dados no momento da assinatura e ficará disponível para auditoria. —</p>
        </div>
      )}

      <form onSubmit={handleSign} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-slate-300 text-xs font-medium block mb-1">
              {isPJ ? 'Nome do representante legal' : 'Seu nome completo'}
            </label>
            <input
              required
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              className="input-dark w-full"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-slate-300 text-xs font-medium block mb-1">
              {isPJ ? 'CNPJ ou CPF do assinante' : 'Seu CPF'}
            </label>
            <input
              required
              value={signerDocument}
              onChange={e => setSignerDocument(e.target.value)}
              className="input-dark w-full"
              placeholder={isPJ ? '00.000.000/0000-00 ou 000.000.000-00' : '000.000.000-00'}
            />
          </div>
        </div>

        {/* Aceite */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-slate-300 text-xs leading-relaxed">{textoAceite}</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={declaracao}
              onChange={e => setDeclaracao(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
            />
            <span className="text-slate-200 text-sm font-medium">{labelAceite}</span>
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              ← Voltar
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !declaracao}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <FileSignature size={18} />}
            {loading ? 'Assinando...' : labelBotao}
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center">
          A assinatura eletrônica possui validade jurídica conforme MP 2.200-2/2001 e Lei 14.063/2020.
          Um registro com IP, data/hora e hash SHA-256 será gerado para auditoria.
        </p>
      </form>
    </div>
  )
}

// ─── Step 4: Aguardando aprovação ────────────────────────────────────────────

function StepAguardandoAprovacao({ profile }: { profile: ProfileData }) {
  const isAnalise = profile.status === 'EM_ANALISE_ADMINISTRATIVA'

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center">
      <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
        {isAnalise ? (
          <Clock size={32} className="text-purple-400 animate-pulse" />
        ) : (
          <CheckCircle2 size={32} className="text-green-400" />
        )}
      </div>

      <h2 className="text-white font-bold text-lg mb-2">
        {isAnalise ? 'Em análise administrativa' : 'Documentação enviada!'}
      </h2>

      <p className="text-slate-300 text-sm leading-relaxed mb-6">
        {isAnalise
          ? 'Nossa equipe está analisando sua documentação. Você receberá uma notificação assim que a homologação for concluída.'
          : 'Sua documentação foi enviada com sucesso! Em breve nossa equipe revisará e aprovará o seu cadastro para que você possa acessar a plataforma.'}
      </p>

      {profile.masterContractSignedAt && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4 text-sm text-green-300 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Contrato-Mãe assinado em {new Date(profile.masterContractSignedAt).toLocaleString('pt-BR')}
        </div>
      )}

      {profile.adminNotes && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-sm text-amber-200 text-left">
          <p className="font-semibold text-xs uppercase tracking-wide text-amber-400 mb-1">Mensagem do admin</p>
          <p>{profile.adminNotes}</p>
        </div>
      )}

      <div className="space-y-2 text-slate-400 text-xs">
        <p>Prazo médio de análise: 1 a 3 dias úteis</p>
        <p>Dúvidas? Entre em contato via WhatsApp</p>
      </div>
    </div>
  )
}

// ─── Status bloqueado ────────────────────────────────────────────────────────

function StatusBloqueadoPage({ profile }: { profile: ProfileData }) {
  const statusMsgs: Record<string, { title: string; msg: string; color: string }> = {
    SUSPENSO:          { title: 'Cadastro suspenso',   msg: 'Seu cadastro foi suspenso temporariamente.', color: 'text-orange-400' },
    BLOQUEADO:         { title: 'Cadastro bloqueado',  msg: 'Seu acesso foi bloqueado. Entre em contato com o suporte.', color: 'text-red-400' },
    BLOQUEADO_PAGAMENTO: { title: 'Acesso bloqueado (pagamento)', msg: 'Há pendência no seu cadastro financeiro.', color: 'text-red-400' },
    INATIVO:           { title: 'Cadastro inativo',   msg: 'Seu cadastro foi inativado.', color: 'text-slate-400' },
  }
  const info = statusMsgs[profile.status] ?? { title: profile.status, msg: '', color: 'text-slate-400' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-blue-dark to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center backdrop-blur-sm">
        <ShieldOff size={40} className={`mx-auto mb-4 ${info.color}`} />
        <h2 className={`text-xl font-bold mb-2 ${info.color}`}>{info.title}</h2>
        <p className="text-slate-300 text-sm mb-4">{info.msg}</p>
        {profile.adminNotes && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-left text-sm text-slate-300">
            <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide mb-1">Motivo</p>
            <p>{profile.adminNotes}</p>
          </div>
        )}
        <a
          href="https://wa.me/554896770711"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm"
        >
          Contatar suporte via WhatsApp
        </a>
      </div>
    </div>
  )
}
