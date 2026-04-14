import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'adm@ilhabellaservicos.com.br' },
    update: {},
    create: {
      email: 'adm@ilhabellaservicos.com.br',
      name: 'Administrador',
      role: 'ADMIN',
    },
  })

  console.log('Seed completed. Admin user:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
