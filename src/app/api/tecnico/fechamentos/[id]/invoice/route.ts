import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { saveInvoiceFile } from '@/lib/upload'
import { sendInvoiceNotification } from '@/lib/email'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

  const formData = await req.formData()
  const file = formData.get('file') as File
  const invoiceNumber = formData.get('invoiceNumber') as string
  const competence = formData.get('competence') as string
  const value = parseFloat(formData.get('value') as string)
  const observations = formData.get('observations') as string | null

  if (!file || !invoiceNumber || !competence || isNaN(value)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

  return NextResponse.json(invoice)
}
