import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
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

  const ext = file.name.split('.').pop()
  const fileName = `nf_${technicianId}_${closingId}_${Date.now()}.${ext}`
  const uploadPath = path.join(UPLOAD_DIR, 'invoices', technicianId)

  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true })
  }

  const filePath = path.join(uploadPath, fileName)
  const bytes = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(bytes))

  return {
    filePath: filePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  }
}
