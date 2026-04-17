import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { saveReimbursementFile } from '@/lib/upload'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reimbursement = await prisma.reimbursement.findUnique({ where: { id: params.id } })
  if (!reimbursement) return NextResponse.json({ error: 'Reembolso não encontrado' }, { status: 404 })

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

    const attachments = []
    for (const file of files) {
      if (file.size === 0) continue
      const result = await saveReimbursementFile(file, reimbursement.technicianId, params.id)
      const att = await prisma.reimbursementAttachment.create({
        data: {
          reimbursementId: params.id,
          filePath: result.filePath,
          fileName: result.fileName,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
        },
      })
      attachments.push(att)
    }

    return NextResponse.json({ success: true, attachments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
  }
}
