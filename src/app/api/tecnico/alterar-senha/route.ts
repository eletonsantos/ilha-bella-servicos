import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  senhaAtual:  z.string().min(1, 'Informe a senha atual'),
  novaSenha:   z.string().min(6, 'A nova senha precisa ter pelo menos 6 caracteres'),
  confirmar:   z.string().min(6),
}).refine(d => d.novaSenha === d.confirmar, {
  message: 'As senhas não conferem',
  path: ['confirmar'],
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Dados inválidos'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { senhaAtual, novaSenha } = parsed.data

  // Busca o usuário com a senha atual
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  })

  if (!user || !user.password) {
    return NextResponse.json({ error: 'Usuário sem senha cadastrada. Contate o administrador.' }, { status: 400 })
  }

  // Verifica a senha atual
  const correta = await bcrypt.compare(senhaAtual, user.password)
  if (!correta) {
    return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
  }

  // Não permite reutilizar a mesma senha
  const mesma = await bcrypt.compare(novaSenha, user.password)
  if (mesma) {
    return NextResponse.json({ error: 'A nova senha não pode ser igual à senha atual.' }, { status: 400 })
  }

  // Aplica a nova senha
  const hashed = await bcrypt.hash(novaSenha, 12)
  await prisma.user.update({
    where: { id: user.id },
    data:  { password: hashed },
  })

  return NextResponse.json({ success: true })
}
