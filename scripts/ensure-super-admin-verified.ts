/**
 * Ensure Super Admin is Always Verified
 * 
 * This script ensures that the super-admin user (ayubtechpro@gmail.com)
 * is always marked as emailVerified in the database.
 * 
 * Usage: npm run ensure-super-admin-verified
 * Or: npx tsx scripts/ensure-super-admin-verified.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Ensuring super-admin is verified...\n');

  const superAdminEmail = 'ayubtechpro@gmail.com';

  try {
    // Find super-admin user
    const user = await prisma.user.findUnique({
      where: { email: superAdminEmail },
      select: { id: true, email: true, emailVerified: true, role: true },
    });

    if (!user) {
      console.log(`❌ User ${superAdminEmail} not found.`);
      console.log('💡 Please create the super-admin user first using: npm run create-super-admin\n');
      process.exit(1);
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log(`✅ Super-admin ${superAdminEmail} is already verified.`);
      console.log(`   Verified at: ${user.emailVerified.toLocaleString()}\n`);
      process.exit(0);
    }

    // Update to verified
    const updatedUser = await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        emailVerified: new Date(),
      },
      select: { email: true, emailVerified: true, role: true },
    });

    console.log('✅ Super-admin verified successfully!');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Verified at: ${updatedUser.emailVerified?.toLocaleString()}\n`);
  } catch (error) {
    console.error('❌ Error ensuring super-admin verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

