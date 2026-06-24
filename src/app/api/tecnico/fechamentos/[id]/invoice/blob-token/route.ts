import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

// Gera um token para o navegador enviar a NF diretamente ao Vercel Blob,
// contornando o limite de ~4,5 MB do corpo das serverless functions.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Confirma que o fechamento pertence a este técnico e ainda não tem NF
  const closing = await prisma.closing.findFirst({
    where:  { id: params.id, technicianId: profile.id },
    select: { id: true, invoice: { select: { id: true } } },
  })
  if (!closing) return NextResponse.json({ error: 'Closing not found' }, { status: 404 })
  if (closing.invoice) return NextResponse.json({ error: 'Invoice already sent' }, { status: 409 })

  const body = (await req.json()) as HandleUploadBody

  try {
    const json = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maximumSizeInBytes:  10 * 1024 * 1024, // 10 MB
        addRandomSuffix:     true,
        tokenPayload:        JSON.stringify({ technicianId: profile.id, closingId: closing.id }),
      }),
      // Upload finaliza direto no Blob; a criação da Invoice acontece no
      // próximo POST (rota /invoice) enviando a URL do blob. Nada a fazer aqui.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao autorizar upload'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
