import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reimbursements = await prisma.reimbursement.findMany({
    include: {
      technician: { select: { fullName: true, cpf: true } },
      items: true,
      _count: { select: { attachments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reimbursements)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { technicianId, description, items } = body

    if (!technicianId || !description || !items?.length) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const tech = await prisma.technicianProfile.findUnique({ where: { id: technicianId } })
    if (!tech) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })

    const totalValue = items.reduce((s: number, i: { value: number }) => s + i.value, 0)

    const reimbursement = await prisma.reimbursement.create({
      data: {
        technicianId,
        description,
        totalValue,
        pixKey: tech.pixKey,
        pixKeyType: tech.pixKeyType,
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
    console.error('[POST /api/admin/reembolsos]', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Erro ao criar reembolso', detail: msg }, { status: 500 })
  }
}
