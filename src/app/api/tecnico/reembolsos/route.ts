import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

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

  // Captura de auditoria server-side
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? 'unknown'

  try {
    const body = await req.json()
    const { description, items, contractSignedName, contractSignedDocument, contractData } = body

    if (!description || !items?.length) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    const totalValue = items.reduce((s: number, i: { value: number }) => s + i.value, 0)

    // Injeta auditoria com hash SHA-256 server-side
    let contractDataFinal: string | null = null
    if (contractData) {
      try {
        const cdObj = typeof contractData === 'string' ? JSON.parse(contractData) : contractData
        const auditTimestamp = new Date().toISOString()
        const rawStr = JSON.stringify(cdObj)
        // Hash: conteúdo original + totalValue + timestamp (garante integridade)
        const hashInput = rawStr + String(totalValue) + auditTimestamp
        const hash = createHash('sha256').update(hashInput).digest('hex')
        cdObj.auditoria = { ip, userAgent: ua, hash, totalValue, timestamp: auditTimestamp }
        contractDataFinal = JSON.stringify(cdObj)
      } catch {
        contractDataFinal = typeof contractData === 'string' ? contractData : JSON.stringify(contractData)
      }
    }

    // Cria reembolso sem nested items (HTTP mode não suporta transações)
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
        contractData:           contractDataFinal,
      },
    })

    // Cria cada item individualmente (createMany também usa transação no PG)
    for (const i of items as { category: string; description: string; value: number }[]) {
      await prisma.reimbursementItem.create({
        data: { reimbursementId: reimbursement.id, category: i.category, description: i.description, value: i.value },
      })
    }

    const reimbursementWithItems = await prisma.reimbursement.findUnique({
      where: { id: reimbursement.id },
      include: { items: true },
    })

    return NextResponse.json({ success: true, reimbursement: reimbursementWithItems })
  } catch (err) {
    console.error('[POST /api/tecnico/reembolsos]', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Erro ao criar reembolso', detail: msg }, { status: 500 })
  }
}
