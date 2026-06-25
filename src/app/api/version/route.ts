import { NextResponse } from 'next/server'

// Identifica a versão (deploy) atual. Usado pelo cliente para detectar quando
// há uma nova versão publicada e recarregar automaticamente.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_DEPLOYMENT_ID ??
    'dev'
  return NextResponse.json(
    { version },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
  )
}
