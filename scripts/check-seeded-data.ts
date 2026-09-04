/**
 * Quick script to check seeded scholarship data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  const scholarships = await prisma.program.findMany({
    where: {
      category: 'SCHOLARSHIP',
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      country: true,
      level: true,
      deadline: true,
      institution: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 25,
  });

  console.log(`\n📊 Found ${scholarships.length} active scholarships:\n`);

  // Group by level
  const byLevel = scholarships.reduce((acc, s) => {
    acc[s.level] = (acc[s.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('By Level:');
  Object.entries(byLevel).forEach(([level, count]) => {
    console.log(`  ${level}: ${count}`);
  });

  // Group by country
  const byCountry = scholarships.reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nBy Country:');
  Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([country, count]) => {
      console.log(`  ${country}: ${count}`);
    });

  console.log('\n📋 Recent Scholarships:');
  scholarships.slice(0, 10).forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.title}`);
    console.log(`     ${s.country} | ${s.level} | Deadline: ${s.deadline.toLocaleDateString()}`);
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);

