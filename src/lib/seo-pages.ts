import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type { SeoPagesData } from '@/types/seo-page'

export function readSeoPagesData(): SeoPagesData {
  const filePath = join(process.cwd(), 'src', 'data', 'seo-pages.json')
  if (!existsSync(filePath)) return {}
  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as SeoPagesData
  } catch {
    return {}
  }
}
