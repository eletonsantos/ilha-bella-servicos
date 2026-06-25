import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

// Gera um token para o navegador enviar a NF diretamente ao Vercel Blob,
// contornando o limite de ~4,5 MB do corpo das serverless functions.
//
// IMPORTANTE: a autenticação acontece DENTRO de onBeforeGenerateToken — essa
// fase roda na chamada inicial do cliente (que carrega o cookie de sessão).
// O Vercel Blob faz uma 2ª chamada server-to-server (evento upload-completed)
// SEM sessão; se exigíssemos auth no topo, esse callback receberia 401 e o
// upload travaria no cliente até expirar.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = (await req.json()) as HandleUploadBody

  try {
    const json = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async () => {
        const session = await auth()
        if (!session?.user?.id) throw new Error('Não autenticado')

        const profile = await prisma.technicianProfile.findUnique({
          where:  { userId: session.user.id },
          select: { id: true },
        })
        if (!profile) throw new Error('Perfil não encontrado')

        const closing = await prisma.closing.findFirst({
          where:  { id: params.id, technicianId: profile.id },
          select: { id: true, invoice: { select: { id: true } } },
        })
        if (!closing) throw new Error('Fechamento não encontrado')
        if (closing.invoice) throw new Error('Nota fiscal já enviada')

        return {
          // octet-stream incluído porque PDFs vindos do Google Drive no celular
          // às vezes chegam sem MIME correto
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/octet-stream'],
          maximumSizeInBytes:  15 * 1024 * 1024, // 15 MB
          addRandomSuffix:     true,
          tokenPayload:        JSON.stringify({ technicianId: profile.id, closingId: closing.id }),
        }
      },
      // Criação da Invoice acontece no POST seguinte (/invoice) enviando a URL
      // do blob. Aqui é só o handshake de conclusão — nada a fazer.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(json)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao autorizar upload'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
