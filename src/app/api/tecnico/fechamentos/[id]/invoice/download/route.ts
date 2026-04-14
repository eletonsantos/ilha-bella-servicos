import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const closing = await prisma.closing.findUnique({
    where: { id: params.id },
    include: { invoice: true },
  })

  if (!closing?.invoice) {
    return NextResponse.json({ error: 'Nota fiscal não encontrada' }, { status: 404 })
  }

  // Verifica permissão: admin ou o próprio técnico
  const isAdmin = session.user.role === 'ADMIN'
  if (!isAdmin) {
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!profile || closing.technicianId !== profile.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }
  }

  const filePath = closing.invoice.filePath

  // Se for URL do Vercel Blob (começa com https://), redireciona direto
  if (filePath.startsWith('http')) {
    return NextResponse.redirect(filePath)
  }

  // Arquivo local (desenvolvimento)
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Arquivo não encontrado no servidor' }, { status: 404 })
  }

  const buffer = await readFile(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': closing.invoice.mimeType,
      'Content-Disposition': `attachment; filename="${closing.invoice.fileName}"`,
    },
  })
}
