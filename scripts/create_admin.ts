import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Spy123!@#', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'spy@salam.com' },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
    },
    create: {
      email: 'spy@salam.com',
      name: 'QA Spy',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  
  console.log('Spy Admin created:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
