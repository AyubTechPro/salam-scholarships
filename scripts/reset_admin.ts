import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function reset() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } }
  });
  
  console.log("Found admins in DB:", admins.map(a => a.email));
  
  if (admins.length > 0) {
    const hashed = await bcrypt.hash('Salam2026!!!', 10);
    for (const a of admins) {
      await prisma.user.update({
        where: { id: a.id },
        data: { 
          password: hashed,
          emailVerified: new Date() // Force verification
        }
      });
      console.log(`✅ Reset password for ${a.email} to: Salam2026!!!`);
    }
  } else {
    // create one
    const hashed = await bcrypt.hash('Salam2026!!!', 10);
    await prisma.user.create({
      data: {
        email: 'ayubtechpro@gmail.com',
        name: 'Ayub',
        password: hashed,
        role: 'SUPER_ADMIN',
        emailVerified: new Date()
      }
    });
    console.log("✅ Created ayubtechpro@gmail.com with password: Salam2026!!!");
  }
}

reset().catch(console.error).finally(() => prisma.$disconnect());
