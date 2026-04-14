import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const profileSchema = z.object({
  fullName: z.string().min(3),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  phone: z.string().min(10),
  email: z.string().email(),
  city: z.string().min(2),
  pixKey: z.string().min(1),
  pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']),
  iaAssistLogin: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json(profile)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
  })

  const profile = existing
    ? await prisma.technicianProfile.update({
        where: { userId: session.user.id },
        data: { ...parsed.data, status: 'AWAITING_APPROVAL' },
      })
    : await prisma.technicianProfile.create({
        data: { ...parsed.data, userId: session.user.id, status: 'AWAITING_APPROVAL' },
      })

  return NextResponse.json(profile)
}
