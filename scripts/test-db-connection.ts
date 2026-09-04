import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful!', result);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Check if your Neon database is active');
    console.error('2. Verify the connection string in .env file');
    console.error('3. Try using the direct connection instead of pooler');
    console.error('4. Check if your IP is allowed in Neon settings');
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

