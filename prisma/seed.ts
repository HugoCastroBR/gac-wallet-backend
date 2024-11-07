import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const HugoCastro = await prisma.user.upsert({
    where: { email: 'hugoecastro2008@gmail.com' },
    update: {},
    create: {
      name: 'Hugo Castro',
      email: 'hugoecastro2008@gmail.com',
      password: '12345678',
      accountValueBrl: 0,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
