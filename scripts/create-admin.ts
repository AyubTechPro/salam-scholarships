import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@salam.tj';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
      name: 'Central Admin',
    },
    create: {
      email,
      name: 'Central Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log(`\n✅ Permanent Admin Created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);
}

main()
  .catch((e) => {
    console.error('Failed to create admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
