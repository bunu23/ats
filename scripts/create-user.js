import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({ where: { email: 'admin@ats.com' } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: 'admin-id',
        name: 'Admin',
        email: 'admin@ats.com',
        password: 'password',
        role: 'admin'
      }
    });
    console.log('Created admin user');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
