/**
 * Create Super Admin User Script
 * 
 * This script creates a SUPER_ADMIN user with a known password for testing.
 * 
 * Usage: tsx scripts/create-super-admin.ts
 * 
 * Default credentials:
 * - Email: ayubtechpro@gmail.com
 * - Password: Admin123!
 * - Role: SUPER_ADMIN
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Creating Super Admin User\n');

  // Default super admin credentials
  const email = 'ayubtechpro@gmail.com';
  const name = 'Super Admin';
  const password = 'Admin123!';
  const role = 'SUPER_ADMIN';

  console.log('Using credentials:');
  console.log(`  Email: ${email}`);
  console.log(`  Name: ${name}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role: ${role}\n`);

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`⚠️  User with email ${email} already exists`);
      console.log('   Updating to SUPER_ADMIN role and resetting password...\n');
      
      // Hash password with 12 rounds for production security
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update existing user to super admin
      const admin = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role: role,
          emailVerified: new Date(), // Auto-verify for super admin
        },
      });

      console.log('✅ Super Admin user updated successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Email Verified: ${admin.emailVerified ? 'Yes' : 'No'}`);
      console.log(`\n🔑 You can now login with:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      // Hash password with 12 rounds for production security
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create super admin user
      const admin = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: role,
          emailVerified: new Date(), // Auto-verify for super admin
        },
      });

      console.log('✅ Super Admin user created successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Email Verified: ${admin.emailVerified ? 'Yes' : 'No'}`);
      console.log(`\n🔑 You can now login with:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    }
  } catch (error: any) {
    console.error('❌ Error creating super admin user:', error.message);
    if (error.code === 'P2002') {
      console.error('   This email is already in use. The user has been updated instead.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

