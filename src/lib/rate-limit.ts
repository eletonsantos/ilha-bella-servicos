/**
 * Rate limiter em memória compatível com Edge Runtime.
 * Usa janela deslizante (sliding window) por chave (IP, rota, etc.).
 * Em ambientes serverless, o estado é por instância — não é perfeito entre
 * múltiplos workers, mas fornece boa proteção contra abuso.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Limpeza periódica de entradas expiradas (a cada 1000 verificações)
let cleanupCounter = 0
function maybeCleanup() {
  cleanupCounter++
  if (cleanupCounter < 1000) return
  cleanupCounter = 0
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key)
  })
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter: number // segundos
}

/**
 * Verifica se a chave está dentro do limite.
 * @param key     Identificador único (ex: "login:IP", "candidatura:IP")
 * @param limit   Número máximo de requisições na janela
 * @param windowMs Duração da janela em milissegundos
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  maybeCleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, retryAfter }
  }

  entry.count++
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
    retryAfter: 0,
  }
}

/** Extrai IP real da requisição (Vercel passa no header x-forwarded-for) */
export function getIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}
