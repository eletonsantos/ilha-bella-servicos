import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const closings = await prisma.closing.findMany({
    include: {
      technician: { select: { fullName: true, cpf: true } },
      invoice: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(closings)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const formData = await req.formData()
    const technicianId = formData.get('technicianId') as string
    const competence = formData.get('competence') as string
    const periodStart = formData.get('periodStart') as string
    const periodEnd = formData.get('periodEnd') as string
    const totalValue = parseFloat(formData.get('totalValue') as string)
    const serviceCount = parseInt(formData.get('serviceCount') as string || '0')
    const observations = formData.get('observations') as string | null
    const reportFile = formData.get('report') as File | null

    if (!technicianId || !competence || !periodStart || !periodEnd || isNaN(totalValue)) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
    }

    // Verifica se técnico existe
    const tech = await prisma.technicianProfile.findUnique({ where: { id: technicianId } })
    if (!tech) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })

    let reportFilePath: string | null = null
    let reportFileName: string | null = null
    let reportFileSize: number | null = null

    // Salva o PDF se enviado
    if (reportFile && reportFile.size > 0) {
      const bytes = await reportFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = join(process.cwd(), 'uploads', 'reports')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

      const safeName = `${technicianId}_${Date.now()}.pdf`
      const filePath = join(uploadDir, safeName)
      await writeFile(filePath, buffer)

      reportFilePath = `/api/admin/fechamentos/report/${safeName}`
      reportFileName = reportFile.name
      reportFileSize = reportFile.size
    }

    const closing = await prisma.closing.create({
      data: {
        technicianId,
        competence,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalValue,
        serviceCount,
        observations: observations || null,
        status: 'CLOSING_AVAILABLE',
        reportFilePath,
        reportFileName,
        reportFileSize,
      },
    })

    return NextResponse.json({ success: true, closing })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno ao criar fechamento' }, { status: 500 })
  }
}
