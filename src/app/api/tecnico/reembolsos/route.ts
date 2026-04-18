import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const reimbursements = await prisma.reimbursement.findMany({
    where: { technicianId: profile.id },
    include: { items: true, _count: { select: { attachments: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reimbursements)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  try {
    const body = await req.json()
    const { description, items, contractSignedName, contractSignedDocument } = body

    if (!description || !items?.length) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const totalValue = items.reduce((s: number, i: { value: number }) => s + i.value, 0)

    const reimbursement = await prisma.reimbursement.create({
      data: {
        technicianId: profile.id,
        description,
        totalValue,
        pixKey: profile.pixKey,
        pixKeyType: profile.pixKeyType,
        contractSignedAt:       contractSignedName ? new Date() : null,
        contractSignedName:     contractSignedName ?? null,
        contractSignedDocument: contractSignedDocument ?? null,
        items: {
          create: items.map((i: { category: string; description: string; value: number }) => ({
            category: i.category,
            description: i.description,
            value: i.value,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, reimbursement })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar reembolso' }, { status: 500 })
  }
}
