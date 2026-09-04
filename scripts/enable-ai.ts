/**
 * Enable AI in Database
 * Updates SiteSettings to enable AI with OpenAI configuration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableAI() {
  try {
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'global' },
      update: {
        aiEnabled: true,
        aiProvider: 'openai',
        aiApiKey: apiKey,
      },
      create: {
        id: 'global',
        aiEnabled: true,
        aiProvider: 'openai',
        aiApiKey: apiKey,
      },
    });

    console.log('✅ AI enabled successfully!');
    console.log(`   Provider: ${settings.aiProvider}`);
    console.log(`   Enabled: ${settings.aiEnabled}`);
    console.log(`   API Key: ${settings.aiApiKey ? `${settings.aiApiKey.substring(0, 20)}...` : 'Not set'}`);
  } catch (error) {
    console.error('❌ Error enabling AI:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

enableAI();

