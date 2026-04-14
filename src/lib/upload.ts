import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export interface UploadResult {
  filePath: string
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
  const fileName = `nf_${technicianId}_${closingId}_${Date.now()}.${ext}`
  const uploadPath = path.join(process.cwd(), 'uploads', 'invoices', technicianId)

  await mkdir(uploadPath, { recursive: true })

  const absolutePath = path.join(uploadPath, fileName)
  const bytes = await file.arrayBuffer()
  await writeFile(absolutePath, Buffer.from(bytes))

  return {
    filePath: absolutePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  }
}
