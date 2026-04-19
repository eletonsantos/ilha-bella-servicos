import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ComunicadoSendButton from './ComunicadoSendButton'
import { Mail, Users } from 'lucide-react'

export default async function ComunicadosPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const technicians = await prisma.technicianProfile.findMany({
    select: { fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark">Comunicados</h1>
        <p className="text-slate-500 text-sm mt-1">Envie mensagens para todos os técnicos cadastrados.</p>
      </div>

      {/* Card do comunicado */}
      <div className="card p-6 border-l-4 border-brand-blue space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
            <Mail size={18} className="text-brand-blue" />
          </div>
          <div>
            <p className="font-bold text-dark">Portal do Prestador — Novidade!</p>
            <p className="text-xs text-slate-400 mt-0.5">Aviso sobre instalação do app no celular</p>
          </div>
        </div>

        {/* Preview do assunto */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm space-y-1">
          <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">Assunto</p>
          <p className="text-dark font-medium">📲 Novo! Instale o Portal do Prestador Ilha Bella no seu celular</p>
        </div>

        {/* Resumo do conteúdo */}
        <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
          <p>O e-mail contém:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 ml-2">
            <li>Boas-vindas e apresentação do portal</li>
            <li>Lista de funcionalidades (fechamentos, NF, antecipação, reembolsos)</li>
            <li>Passo a passo para instalar no Android (Chrome)</li>
            <li>Passo a passo para instalar no iPhone (Safari)</li>
            <li>Botão direto para a página de instalação</li>
            <li>Link e instruções de login</li>
          </ul>
        </div>

        {/* Destinatários */}
        <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-3">
          <Users size={16} className="text-indigo-500" />
          <p className="text-sm text-indigo-700 font-medium">
            Será enviado para <strong>{technicians.length} técnico(s)</strong> cadastrado(s)
          </p>
        </div>

        {/* Lista de destinatários */}
        {technicians.length > 0 && (
          <details className="text-sm">
            <summary className="text-slate-400 cursor-pointer hover:text-slate-600 text-xs">
              Ver lista de destinatários ({technicians.length})
            </summary>
            <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
              {technicians.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-dark font-medium text-xs">{t.fullName}</span>
                  <span className="text-slate-400 text-xs">{t.email}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        <ComunicadoSendButton total={technicians.length} />
      </div>
    </div>
  )
}
