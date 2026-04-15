import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveTabelaFile } from '@/lib/upload'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

// POST — admin faz upload da tabela de valores
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const tech = await prisma.technicianProfile.findUnique({ where: { id: params.id } })
  if (!tech) return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('tabela') as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  try {
    const result = await saveTabelaFile(file, params.id)
    const updated = await prisma.technicianProfile.update({
      where: { id: params.id },
      data: {
        tabelaValoresPath: result.filePath,
        tabelaValoresName: result.fileName,
        tabelaValoresSize: result.fileSize,
      },
    })
    return NextResponse.json({ success: true, profile: updated })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar arquivo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET — admin ou o próprio técnico acessa a tabela
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const tech = await prisma.technicianProfile.findUnique({ where: { id: params.id } })
  if (!tech?.tabelaValoresPath) {
    return NextResponse.json({ error: 'Tabela não encontrada' }, { status: 404 })
  }

  // Verifica permissão: admin ou o próprio técnico
  if (session.user.role !== 'ADMIN') {
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!profile || profile.id !== params.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }
  }

  const filePath = tech.tabelaValoresPath

  // Vercel Blob — redireciona direto para a URL pública
  if (filePath.startsWith('http')) {
    return NextResponse.redirect(filePath)
  }

  // Local — lê e retorna o arquivo
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'Arquivo não encontrado no servidor' }, { status: 404 })
  }

  const buffer = await readFile(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${tech.tabelaValoresName ?? 'tabela.pdf'}"`,
    },
  })
}

// DELETE — admin remove a tabela
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  await prisma.technicianProfile.update({
    where: { id: params.id },
    data: { tabelaValoresPath: null, tabelaValoresName: null, tabelaValoresSize: null },
  })

  return NextResponse.json({ success: true })
}
