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

  const formData = await req.formData()
  const file = formData.get('file') as File
  const invoiceNumber = formData.get('invoiceNumber') as string
  const competence = formData.get('competence') as string
  const rawValue = parseFloat(formData.get('value') as string)
  // Fallback: se value ausente/inválido, usa totalValue do fechamento
  const value = isNaN(rawValue) ? closing.totalValue : rawValue
  const observations = formData.get('observations') as string | null
  const contractSignedName     = formData.get('contractSignedName') as string | null
  const contractSignedDocument = formData.get('contractSignedDocument') as string | null
  const contractDataRaw        = formData.get('contractData') as string | null

  if (!file || !invoiceNumber || !competence) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

  let uploadResult
  try {
    uploadResult = await saveInvoiceFile(file, profile.id, closing.id)
  } catch (uploadErr: unknown) {
    const msg = uploadErr instanceof Error ? uploadErr.message : 'Erro ao salvar arquivo'
    return NextResponse.json({ error: msg }, { status: 500 })
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
