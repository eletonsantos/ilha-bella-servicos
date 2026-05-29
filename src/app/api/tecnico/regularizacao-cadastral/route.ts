import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      providerTechnicians: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  return NextResponse.json({
    id:             profile.id,
    status:         profile.status,
    contractType:   profile.contractType,
    fullName:       profile.fullName,
    cpf:            profile.cpf,
    email:          profile.email,
    phone:          profile.phone,
    city:           profile.city,
    cnpj:           profile.cnpj,
    razaoSocial:    profile.razaoSocial,
    nomeFantasia:   profile.nomeFantasia,
    cnpjSituacao:   profile.cnpjSituacao,
    cnpjCheckedAt:  profile.cnpjCheckedAt,
    adminNotes:     profile.adminNotes,
    masterContractVersion:   profile.masterContractVersion,
    masterContractSignedAt:  profile.masterContractSignedAt,
    masterContractSignedName: profile.masterContractSignedName,
    providerTechnicians: profile.providerTechnicians,
  })
}
