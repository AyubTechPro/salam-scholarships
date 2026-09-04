#!/usr/bin/env tsx

/**
 * Bootstrap Admin Script (TypeScript)
 * 
 * This script upgrades a user to SUPER_ADMIN role.
 * 
 * Usage:
 *   npx tsx scripts/bootstrap-admin.ts your@email.com
 * 
 * Or compile and run:
 *   npx tsc scripts/bootstrap-admin.ts && node scripts/bootstrap-admin.js your@email.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function bootstrapAdmin(email: string) {
  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: npx tsx scripts/bootstrap-admin.ts your@email.com');
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`);
      console.log('Please sign up first at /signup');
      process.exit(1);
    }

    // Update user role to SUPER_ADMIN
    await prisma.user.update({
      where: { email },
      data: { role: 'SUPER_ADMIN' },
    });

    console.log('✅ Success!');
    console.log(`   User: ${user.name || user.email}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Old Role: ${user.role}`);
    console.log(`   New Role: SUPER_ADMIN`);
    console.log('\n🎉 You can now log in and access the Admin Dashboard!');
    console.log('   URL: http://localhost:3000/[locale]/admin');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
bootstrapAdmin(email);

