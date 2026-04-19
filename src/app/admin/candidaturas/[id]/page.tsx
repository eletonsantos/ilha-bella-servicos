import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, MapPin, Wrench } from 'lucide-react'
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/lib/constants-tecnico'
import CandidaturaStatusActions from './CandidaturaStatusActions'
import CriarAcessoForm from './CriarAcessoForm'
import EditarCandidaturaForm from './EditarCandidaturaForm'

interface Props { params: { id: string } }

export default async function AdminCandidaturaDetailPage({ params }: Props) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const app = await prisma.technicianApplication.findUnique({ where: { id: params.id } })
  if (!app) notFound()

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const boolBadge = (v: boolean, yes: string, no: string) => (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
      {v ? yes : no}
    </span>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/candidaturas" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-blue transition-colors">
        <ArrowLeft size={16} /> Voltar para candidaturas
      </Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-dark">{app.fullName}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{app.especialidadePrincipal}</p>
          <p className="text-slate-500 text-xs mt-1">Recebido em {fmtDate(app.createdAt)}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${APPLICATION_STATUS_COLORS[app.status]}`}>
          {APPLICATION_STATUS_LABELS[app.status]}
        </span>
      </div>

      {/* Contato */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-4 flex items-center gap-2"><Phone size={15} className="text-brand-blue" /> Contato</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">CPF / CNPJ</p>
            <p className="font-medium text-dark">{app.cpfCnpj}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">WhatsApp</p>
            <a href={`https://wa.me/55${app.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
               className="font-medium text-brand-blue hover:underline">{app.whatsapp}</a>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">E-mail</p>
            <a href={`mailto:${app.email}`} className="font-medium text-brand-blue hover:underline">{app.email}</a>
          </div>
        </div>
      </div>

      {/* Região */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-4 flex items-center gap-2"><MapPin size={15} className="text-brand-blue" /> Região</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Cidade</p>
            <p className="font-medium text-dark">{app.cidade}</p>
          </div>
          {app.bairro && (
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Bairro</p>
              <p className="font-medium text-dark">{app.bairro}</p>
            </div>
          )}
        </div>
      </div>

      {/* Especialidades */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-4 flex items-center gap-2"><Wrench size={15} className="text-brand-blue" /> Especialidades</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Principal</p>
            <p className="font-bold text-dark">{app.especialidadePrincipal}</p>
          </div>
          {app.outrasEspecialidades && (
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Outras</p>
              <p className="text-dark">{app.outrasEspecialidades}</p>
            </div>
          )}
        </div>
      </div>

      {/* Operacional */}
      <div className="card p-6">
        <h2 className="font-bold text-dark mb-4">Informações operacionais</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {boolBadge(app.atende24h, 'Atende 24h', 'Não atende 24h')}
          {boolBadge(app.possuiVeiculo, 'Possui veículo', 'Sem veículo')}
          {boolBadge(app.emiteNotaFiscal, 'Emite NF', 'Não emite NF')}
          {app.trabalhoTipo && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              {app.trabalhoTipo === 'solo' ? 'Trabalha sozinho' : 'Tem equipe'}
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {app.tempoExperiencia && (
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Experiência</p>
              <p className="text-dark">{app.tempoExperiencia}</p>
            </div>
          )}
          {app.disponibilidade && (
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Disponibilidade</p>
              <p className="text-dark">{app.disponibilidade}</p>
            </div>
          )}
        </div>
      </div>

      {/* Observações do candidato */}
      {app.observacoes && (
        <div className="card p-6">
          <h2 className="font-bold text-dark mb-2">Observações do candidato</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{app.observacoes}</p>
        </div>
      )}

      {/* Notas admin */}
      {app.adminNotes && (
        <div className="card p-6 border-l-4 border-brand-blue">
          <h2 className="font-bold text-dark mb-2">Notas internas</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{app.adminNotes}</p>
        </div>
      )}

      {/* Editar dados da candidatura */}
      {app.status !== 'CONVERTED' && (
        <EditarCandidaturaForm app={{
          id: app.id,
          fullName: app.fullName,
          cpfCnpj: app.cpfCnpj,
          whatsapp: app.whatsapp,
          email: app.email,
          cidade: app.cidade,
          bairro: app.bairro,
          especialidadePrincipal: app.especialidadePrincipal,
          outrasEspecialidades: app.outrasEspecialidades,
          atende24h: app.atende24h,
          possuiVeiculo: app.possuiVeiculo,
          emiteNotaFiscal: app.emiteNotaFiscal,
          trabalhoTipo: app.trabalhoTipo,
          disponibilidade: app.disponibilidade,
          tempoExperiencia: app.tempoExperiencia,
          observacoes: app.observacoes,
        }} />
      )}

      {/* Criar acesso — aparece apenas quando aprovado e ainda não convertido */}
      {app.status === 'APPROVED' && (
        <CriarAcessoForm
          applicationId={app.id}
          cpfCnpj={app.cpfCnpj}
          fullName={app.fullName}
          phone={app.whatsapp}
          email={app.email}
          city={app.cidade}
        />
      )}

      {/* Ações */}
      <CandidaturaStatusActions applicationId={app.id} currentStatus={app.status} />
    </div>
  )
}
