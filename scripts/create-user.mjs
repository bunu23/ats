import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@ats.com' },
    update: {},
    create: {
      id: 'admin-user',
      name: 'Admin User',
      email: 'admin@ats.com',
      password: 'password',
      role: 'admin'
    }
  });
  console.log('User created: admin@ats.com / password');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
