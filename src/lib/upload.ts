import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// MIME types e seus magic bytes para validação real do conteúdo
const FILE_SIGNATURES: Record<string, { mimes: string[]; magic: number[][] }> = {
  pdf:  { mimes: ['application/pdf'], magic: [[0x25, 0x50, 0x44, 0x46]] },            // %PDF
  jpeg: { mimes: ['image/jpeg'],      magic: [[0xFF, 0xD8, 0xFF]] },
  png:  { mimes: ['image/png'],       magic: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]] },
}

const ALLOWED_MIMES = Object.values(FILE_SIGNATURES).flatMap(v => v.mimes)

export interface UploadResult {
  filePath: string
  fileName: string
  fileSize: number
  mimeType: string
}

/** Verifica magic bytes — não confia somente no MIME type declarado pelo cliente */
async function validateMagicBytes(file: File): Promise<void> {
  const header = await file.slice(0, 12).arrayBuffer()
  const buf = Buffer.from(header)
  for (const sig of Object.values(FILE_SIGNATURES)) {
    if (!sig.mimes.includes(file.type)) continue
    const ok = sig.magic.some(bytes => bytes.every((b, i) => buf[i] === b))
    if (!ok) throw new Error('Conteúdo do arquivo não corresponde ao formato declarado.')
    return
  }
  throw new Error('Formato de arquivo não permitido.')
}

function validateFile(file: File, pdfOnly = false) {
  if (file.size > MAX_FILE_SIZE) throw new Error('Arquivo muito grande. Máximo 10MB.')
  const allowed = pdfOnly ? ['application/pdf'] : ALLOWED_MIMES
  if (!allowed.includes(file.type)) throw new Error(
    pdfOnly ? 'Apenas PDF é aceito.' : 'Formato inválido. Use PDF, JPG ou PNG.'
  )
}

function getExt(mimeType: string): string {
  return { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[mimeType] ?? 'bin'
}

/** Nome de arquivo gerado no servidor — sem dependência do nome original do cliente */
function safeName(prefix: string, ext: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${ext}`
}

async function toBlob(blobPath: string, file: File): Promise<string> {
  const blob = await put(blobPath, file, { access: 'public' })
  return blob.url
}

async function toLocal(dir: string, fileName: string, file: File): Promise<string> {
  const fullDir = path.join(process.cwd(), 'uploads', dir)
  await mkdir(fullDir, { recursive: true })
  const dest = path.join(fullDir, fileName)
  await writeFile(dest, Buffer.from(await file.arrayBuffer()))
  return dest
}

// ── Nota Fiscal ───────────────────────────────────────────────────────────────
export async function saveInvoiceFile(file: File, technicianId: string, closingId: string): Promise<UploadResult> {
  validateFile(file)
  await validateMagicBytes(file)
  const ext  = getExt(file.type)
  const name = safeName(`inv_${closingId}`, ext)
  const dir  = `invoices/${technicianId}`
  const filePath = process.env.BLOB_READ_WRITE_TOKEN
    ? await toBlob(`${dir}/${name}`, file)
    : await toLocal(dir, name, file)
  return { filePath, fileName: name, fileSize: file.size, mimeType: file.type }
}

// ── Tabela de valores ─────────────────────────────────────────────────────────
export async function saveTabelaFile(file: File, technicianId: string): Promise<{ filePath: string; fileName: string; fileSize: number }> {
  validateFile(file, true)
  await validateMagicBytes(file)
  const name = safeName(`tab_${technicianId}`, 'pdf')
  const filePath = process.env.BLOB_READ_WRITE_TOKEN
    ? await toBlob(`tabelas/${technicianId}/${name}`, file)
    : await toLocal('tabelas', name, file)
  return { filePath, fileName: name, fileSize: file.size }
}

// ── Relatório ─────────────────────────────────────────────────────────────────
export async function saveReportFile(file: File, technicianId: string): Promise<{ filePath: string; fileName: string; fileSize: number }> {
  validateFile(file, true)
  await validateMagicBytes(file)
  const name = safeName(`rep_${technicianId}`, 'pdf')
  const filePath = process.env.BLOB_READ_WRITE_TOKEN
    ? await toBlob(`reports/${technicianId}/${name}`, file)
    : await toLocal('reports', name, file)
  return { filePath, fileName: name, fileSize: file.size }
}

// ── Reembolso ─────────────────────────────────────────────────────────────────
export async function saveReimbursementFile(file: File, technicianId: string, reimbursementId: string): Promise<UploadResult> {
  validateFile(file)
  await validateMagicBytes(file)
  const ext  = getExt(file.type)
  const name = safeName(`rei_${reimbursementId}`, ext)
  const dir  = `reimbursements/${technicianId}`
  const filePath = process.env.BLOB_READ_WRITE_TOKEN
    ? await toBlob(`${dir}/${name}`, file)
    : await toLocal(dir, name, file)
  return { filePath, fileName: name, fileSize: file.size, mimeType: file.type }
}
