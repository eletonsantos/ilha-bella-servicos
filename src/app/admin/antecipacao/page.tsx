import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Zap, CheckCircle } from 'lucide-react'
import AntecipacaoAdminCard from './AntecipacaoAdminCard'

export default async function AdminAntecipacaoPage() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') redirect('/tecnico/login')

  const advances = await prisma.paymentAdvance.findMany({
    include: {
      closing:    { select: { competence: true } },
      technician: { select: { fullName: true, pixKey: true, pixKeyType: true } },
    },
    orderBy: [
      { status: 'asc' },   // PENDING primeiro (P vem antes de A/R)
      { createdAt: 'desc' },
    ],
  }).catch(() => [])

  const pending  = advances.filter(a => a.status === 'PENDING')
  const resolved = advances.filter(a => a.status !== 'PENDING')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark">Antecipações</h1>
          <p className="text-slate-500 text-sm mt-1">Solicitações de antecipação de pagamento dos técnicos.</p>
        </div>
        {pending.length > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-full">
            <Zap size={14} />
            {pending.length} pendente{pending.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Pendentes */}
      {pending.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={12} /> Aguardando sua aprovação
          </p>
          {pending.map(adv => (
            <AntecipacaoAdminCard
              key={adv.id}
              advance={{
                id:            adv.id,
                closingId:     adv.closingId,
                status:        adv.status,
                originalValue: adv.originalValue,
                feePercent:    adv.feePercent,
                feeValue:      adv.feeValue,
                netValue:      adv.netValue,
                signedName:    adv.signedName,
                signedCnpj:    adv.signedCnpj,
                signedAt:      adv.signedAt,
                adminNotes:    adv.adminNotes,
                closing:       adv.closing,
                technician:    adv.technician,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <CheckCircle size={40} className="text-emerald-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhuma antecipação pendente.</p>
          <p className="text-slate-400 text-sm mt-1">Tudo em dia! Quando um técnico solicitar, aparecerá aqui.</p>
        </div>
      )}

      {/* Histórico */}
      {resolved.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Histórico</p>
          {resolved.map(adv => (
            <AntecipacaoAdminCard
              key={adv.id}
              advance={{
                id:            adv.id,
                closingId:     adv.closingId,
                status:        adv.status,
                originalValue: adv.originalValue,
                feePercent:    adv.feePercent,
                feeValue:      adv.feeValue,
                netValue:      adv.netValue,
                signedName:    adv.signedName,
                signedCnpj:    adv.signedCnpj,
                signedAt:      adv.signedAt,
                adminNotes:    adv.adminNotes,
                closing:       adv.closing,
                technician:    adv.technician,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
