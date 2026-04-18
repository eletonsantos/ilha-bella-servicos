import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  PROFILE_STATUS_LABELS,
  PROFILE_STATUS_COLORS,
  PIX_KEY_TYPE_LABELS,
} from '@/lib/constants-tecnico'
import TecnicoStatusActions from './TecnicoStatusActions'
import EditarCadastroWrapper from './EditarCadastroWrapper'
import TabelaValoresUpload from './TabelaValoresUpload'
import DeleteTecnicoButton from './DeleteTecnicoButton'

interface Props {
  params: { id: string }
}

export default async function AdminTecnicoDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const tech = await prisma.technicianProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true, name: true } },
      closings: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!tech) notFound()

  const fields = [
    { label: 'Nome completo',  value: tech.fullName },
    { label: 'CPF',            value: tech.cpf },
    { label: 'Telefone',       value: tech.phone },
    { label: 'E-mail',         value: tech.email },
    { label: 'Cidade',         value: tech.city },
    { label: 'Chave Pix',      value: `${tech.pixKey} (${PIX_KEY_TYPE_LABELS[tech.pixKeyType] ?? tech.pixKeyType})` },
    { label: 'CNPJ',           value: tech.cnpj ?? '—' },
    { label: 'Razão Social',   value: tech.razaoSocial ?? '—' },
    { label: 'Login IA Assist',value: tech.iaAssistLogin ?? '—' },
    { label: 'Tipo de contratação', value: { PJ_TERCEIRIZADO: 'Terceirizado PJ', AUTONOMO: 'Autônomo', CLT: 'CLT' }[tech.contractType ?? 'AUTONOMO'] ?? '—' },
    { label: 'Cadastrado em',  value: new Date(tech.createdAt).toLocaleDateString('pt-BR') },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Voltar */}
      <Link
        href="/admin/tecnicos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar para técnicos
      </Link>

      {/* Header com status */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-dark">{tech.fullName}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{tech.user.email}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${PROFILE_STATUS_COLORS[tech.status]}`}>
          {PROFILE_STATUS_LABELS[tech.status]}
        </span>
      </div>

      {/* Dados do cadastro — com botão Editar embutido */}
      <div className="card p-6">
        <EditarCadastroWrapper
          fields={fields}
          tech={{
            id:           tech.id,
            fullName:     tech.fullName,
            cpf:          tech.cpf,
            phone:        tech.phone,
            email:        tech.email,
            city:         tech.city,
            pixKey:       tech.pixKey,
            pixKeyType:   tech.pixKeyType,
            iaAssistLogin:tech.iaAssistLogin,
            cnpj:         tech.cnpj,
            razaoSocial:  tech.razaoSocial,
            contractType: tech.contractType,
          }}
        />
      </div>

      {/* Tabela de Valores */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-dark mb-1">Tabela de Valores</h2>
        <p className="text-sm text-slate-400 mb-4">
          Suba o PDF com a tabela de preços deste técnico. Ele poderá visualizar diretamente no painel.
        </p>
        <TabelaValoresUpload
          techId={tech.id}
          tabelaName={tech.tabelaValoresName ?? null}
          tabelaSize={tech.tabelaValoresSize ?? null}
        />
      </div>

      {/* Observações do admin */}
      {tech.adminNotes && (
        <div className="card p-6 border-l-4 border-amber-400">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Observações do admin</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{tech.adminNotes}</p>
        </div>
      )}

      {/* Ações de status */}
      <TecnicoStatusActions techId={tech.id} currentStatus={tech.status} />

      {/* Excluir técnico */}
      <DeleteTecnicoButton techId={tech.id} techName={tech.fullName} />
    </div>
  )
}
