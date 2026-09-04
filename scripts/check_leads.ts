import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const reqs = await prisma.consultationRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log('✅ RECENT CONSULTATION LEADS:');
  console.log(JSON.stringify(reqs, null, 2));
}
check().catch(console.error).finally(() => prisma.$disconnect());
