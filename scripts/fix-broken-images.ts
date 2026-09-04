/**
 * Fix broken Unsplash image URLs in the database.
 * Run: npx tsx scripts/fix-broken-images.ts
 */
import { PrismaClient } from '@prisma/client';

// Use a reliable placeholder from picsum.photos
const FALLBACK_URL = 'https://picsum.photos/seed/scholarship/800/600';

async function main() {
  const prisma = new PrismaClient();
  const programs = await prisma.program.updateMany({
    where: { imageUrl: { contains: 'photo-1523050854058-8df90110c9f1' } },
    data: { imageUrl: FALLBACK_URL },
  });
  if (programs.count > 0) {
    console.log(`Updated ${programs.count} Program(s) with broken image URL`);
  }

  // Also fix Achievement.studentImage if it uses the same broken URL
  const achievements = await prisma.achievement.updateMany({
    where: { studentImage: { contains: 'photo-1523050854058-8df90110c9f1' } },
    data: { studentImage: FALLBACK_URL },
  });
  if (achievements.count > 0) {
    console.log(`Updated ${achievements.count} Achievement(s) with broken image URL`);
  }

  console.log('Done.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
