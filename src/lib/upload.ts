import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export interface UploadResult {
  filePath: string   // URL pública (Blob) ou caminho local
  fileName: string
  fileSize: number
  mimeType: string
}

export async function saveInvoiceFile(
  file: File,
  technicianId: string,
  closingId: string
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 10MB.')
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato inválido. Use PDF, JPG ou PNG.')
  }

  const ext = file.name.split('.').pop() ?? 'pdf'
  const safeName = `invoices/${technicianId}/${closingId}_${Date.now()}.${ext}`

  // Produção: usa Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeName, file, { access: 'public' })
    return {
      filePath: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }
  }

  // Desenvolvimento: salva no sistema de arquivos local
  const uploadPath = path.join(process.cwd(), 'uploads', 'invoices', technicianId)
  await mkdir(uploadPath, { recursive: true })
  const absolutePath = path.join(uploadPath, `${closingId}_${Date.now()}.${ext}`)
  const bytes = await file.arrayBuffer()
  await writeFile(absolutePath, Buffer.from(bytes))

  return {
    filePath: absolutePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  }
}

export async function saveTabelaFile(
  file: File,
  technicianId: string
): Promise<{ filePath: string; fileName: string; fileSize: number }> {
  if (file.size > MAX_FILE_SIZE) throw new Error('Arquivo muito grande. Máximo 10MB.')
  if (file.type !== 'application/pdf') throw new Error('Apenas PDF é aceito para tabela de valores.')

  const safeName = `tabelas/${technicianId}/${Date.now()}.pdf`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeName, file, { access: 'public' })
    return { filePath: blob.url, fileName: file.name, fileSize: file.size }
  }

  const uploadPath = path.join(process.cwd(), 'uploads', 'tabelas')
  await mkdir(uploadPath, { recursive: true })
  const absolutePath = path.join(uploadPath, `${technicianId}_${Date.now()}.pdf`)
  const bytes = await file.arrayBuffer()
  await writeFile(absolutePath, Buffer.from(bytes))
  return { filePath: absolutePath, fileName: file.name, fileSize: file.size }
}

export async function saveReportFile(
  file: File,
  technicianId: string
): Promise<{ filePath: string; fileName: string; fileSize: number }> {
  const safeName = `reports/${technicianId}/${Date.now()}.pdf`

  // Produção: usa Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeName, file, { access: 'public' })
    return { filePath: blob.url, fileName: file.name, fileSize: file.size }
  }

  // Desenvolvimento: salva localmente
  const uploadPath = path.join(process.cwd(), 'uploads', 'reports')
  await mkdir(uploadPath, { recursive: true })
  const absolutePath = path.join(uploadPath, `${technicianId}_${Date.now()}.pdf`)
  const bytes = await file.arrayBuffer()
  await writeFile(absolutePath, Buffer.from(bytes))

  return { filePath: absolutePath, fileName: file.name, fileSize: file.size }
}

export async function saveReimbursementFile(
  file: File,
  technicianId: string,
  reimbursementId: string
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) throw new Error('Arquivo muito grande. Máximo 10MB.')
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Formato inválido. Use PDF, JPG ou PNG.')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const safeName = `reimbursements/${technicianId}/${reimbursementId}_${Date.now()}.${ext}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeName, file, { access: 'public' })
    return { filePath: blob.url, fileName: file.name, fileSize: file.size, mimeType: file.type }
  }

  const uploadPath = path.join(process.cwd(), 'uploads', 'reimbursements', technicianId)
  await mkdir(uploadPath, { recursive: true })
  const absolutePath = path.join(uploadPath, `${reimbursementId}_${Date.now()}.${ext}`)
  const bytes = await file.arrayBuffer()
  await writeFile(absolutePath, Buffer.from(bytes))
  return { filePath: absolutePath, fileName: file.name, fileSize: file.size, mimeType: file.type }
}
