import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { saveInvoiceFile } from '@/lib/upload'
import { sendInvoiceNotification } from '@/lib/email'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createHash } from 'crypto'
import { createClosingEvent } from '@/lib/closing-events'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const closing = await prisma.closing.findFirst({
    where: { id: params.id, technicianId: profile.id },
    include: { invoice: true },
  })
  if (!closing) return NextResponse.json({ error: 'Closing not found' }, { status: 404 })
  if (closing.invoice) return NextResponse.json({ error: 'Invoice already sent' }, { status: 409 })

  // Captura de auditoria server-side
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? 'unknown'

  // Aceita dois formatos:
  // 1. JSON com o arquivo já enviado direto ao Vercel Blob (contorna limite de 4,5 MB)
  // 2. multipart/form-data com o arquivo (fluxo legado / dev local sem Blob)
  const isJson = (req.headers.get('content-type') ?? '').includes('application/json')

  let invoiceNumber: string
  let competence: string
  let value: number
  let observations: string | null
  let contractSignedName: string | null
  let contractSignedDocument: string | null
  let contractDataRaw: string | null
  let uploadResult: { filePath: string; fileName: string; fileSize: number; mimeType: string }

  if (isJson) {
    const b = await req.json()
    invoiceNumber          = b.invoiceNumber
    competence             = b.competence
    const rawValue         = parseFloat(b.value)
    value                  = isNaN(rawValue) ? closing.totalValue : rawValue
    observations           = b.observations ?? null
    contractSignedName     = b.contractSignedName ?? null
    contractSignedDocument = b.contractSignedDocument ?? null
    contractDataRaw        = b.contractData ?? null

    if (!b.blobUrl || !invoiceNumber || !competence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    uploadResult = {
      filePath: b.blobUrl,
      fileName: b.fileName ?? 'nota-fiscal',
      fileSize: typeof b.fileSize === 'number' ? b.fileSize : 0,
      mimeType: b.mimeType ?? 'application/octet-stream',
    }
  } else {
    const formData = await req.formData()
    const file = formData.get('file') as File
    invoiceNumber          = formData.get('invoiceNumber') as string
    competence             = formData.get('competence') as string
    const rawValue         = parseFloat(formData.get('value') as string)
    value                  = isNaN(rawValue) ? closing.totalValue : rawValue
    observations           = formData.get('observations') as string | null
    contractSignedName     = formData.get('contractSignedName') as string | null
    contractSignedDocument = formData.get('contractSignedDocument') as string | null
    contractDataRaw        = formData.get('contractData') as string | null

    if (!file || !invoiceNumber || !competence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
      uploadResult = await saveInvoiceFile(file, profile.id, closing.id)
    } catch (uploadErr: unknown) {
      const msg = uploadErr instanceof Error ? uploadErr.message : 'Erro ao salvar arquivo'
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  // Injeta auditoria com hash SHA-256 server-side
  let contractDataFinal: string | null = null
  if (contractDataRaw) {
    try {
      const cdObj = JSON.parse(contractDataRaw)
      const auditTimestamp = new Date().toISOString()
      // Hash: conteúdo original + closingId + timestamp (garante integridade)
      const hashInput = contractDataRaw + closing.id + auditTimestamp
      const hash = createHash('sha256').update(hashInput).digest('hex')
      cdObj.auditoria = { ip, userAgent: ua, hash, closingId: closing.id, timestamp: auditTimestamp }
      contractDataFinal = JSON.stringify(cdObj)
    } catch {
      contractDataFinal = contractDataRaw
    }
  }

  const invoice = await prisma.invoice.create({
    data: {
      closingId: closing.id,
      invoiceNumber,
      competence,
      value,
      observations: observations ?? undefined,
      filePath: uploadResult.filePath,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      contractSignedAt:       contractSignedName ? new Date() : null,
      contractSignedName:     contractSignedName ?? null,
      contractSignedDocument: contractSignedDocument ?? null,
      contractData:           contractDataFinal ?? null,
    },
  })

  await prisma.closing.update({
    where: { id: closing.id },
    data: { status: 'INVOICE_SENT' },
  })

  const period = `${format(closing.periodStart, 'dd/MM/yyyy', { locale: ptBR })} a ${format(closing.periodEnd, 'dd/MM/yyyy', { locale: ptBR })}`

  await sendInvoiceNotification({
    technicianName: profile.fullName,
    technicianCpf: profile.cpf,
    closingPeriod: period,
    invoiceValue: value,
    invoiceNumber,
    observations: observations ?? undefined,
    fileName: uploadResult.fileName,
    closingId: closing.id,
  })

  // Registra evento de NF enviada (sem e-mail — admin já recebe pelo sendInvoiceNotification)
  await createClosingEvent({
    closingId:   closing.id,
    eventType:   'INVOICE_SUBMITTED',
    statusFrom:  closing.status,
    statusTo:    'INVOICE_SENT',
    description: `Nota Fiscal enviada pelo prestador. NF nº ${invoiceNumber} — ${contractSignedName ? 'com contrato assinado' : 'sem contrato'}.`,
    createdBy:   'technician',
  }).catch(err => console.error('[event] Failed to create INVOICE_SUBMITTED event:', err))

  return NextResponse.json(invoice)
}
