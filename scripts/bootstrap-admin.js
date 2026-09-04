#!/usr/bin/env node

/**
 * Bootstrap Admin Script
 * 
 * This script upgrades a user to SUPER_ADMIN role.
 * 
 * Usage:
 *   node scripts/bootstrap-admin.js your@email.com
 * 
 * Or use npx:
 *   npx tsx scripts/bootstrap-admin.ts your@email.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function bootstrapAdmin(email) {
  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('Usage: node scripts/bootstrap-admin.js your@email.com');
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
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
bootstrapAdmin(email);

