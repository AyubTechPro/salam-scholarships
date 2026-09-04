/**
 * Database Backup Script
 * 
 * Exports all critical data from the database to a JSON file for backup.
 * 
 * Usage: npx tsx scripts/backup-database.ts [output-file]
 * 
 * Example: npx tsx scripts/backup-database.ts backup-2024-01-15.json
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('💾 Starting database backup...\n');

  try {
    // Get output file path
    const args = process.argv.slice(2);
    const outputFile = args[0] || `backup-${new Date().toISOString().split('T')[0]}.json`;
    const outputPath = path.join(process.cwd(), outputFile);

    console.log(`📁 Output file: ${outputPath}\n`);

    // Export critical data
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        // Site Settings (Critical)
        siteSettings: await prisma.siteSettings.findMany(),
        
        // Site Stats
        siteStats: await prisma.siteStats.findMany(),
        
        // Navigation Menu
        navigationMenu: await prisma.navigationMenu.findMany({
          orderBy: [{ location: 'asc' }, { order: 'asc' }],
        }),
        
        // UI Dictionary
        uiDictionary: await prisma.uIDictionary.findMany({
          orderBy: [{ category: 'asc' }, { key: 'asc' }],
        }),
        
        // Hero Slides
        heroSlides: await prisma.heroSlide.findMany({
          orderBy: { order: 'asc' },
        }),
        
        // Categories
        categories: await prisma.category.findMany(),
        
        // Programs (optional - can be large)
        // Uncomment if you want to backup programs too
        // programs: await prisma.program.findMany(),
        
        // Users (optional - sensitive data, use with caution)
        // users: await prisma.user.findMany({
        //   select: {
        //     id: true,
        //     email: true,
        //     name: true,
        //     role: true,
        //     emailVerified: true,
        //     createdAt: true,
        //   },
        // }),
      },
    };

    // Write to file
    fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2), 'utf-8');

    // Get file size
    const stats = fs.statSync(outputPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ Backup completed successfully!');
    console.log(`📊 File size: ${fileSizeInMB} MB`);
    console.log(`📁 Location: ${outputPath}\n`);
    
    console.log('📦 Exported data:');
    console.log(`   - SiteSettings: ${backup.data.siteSettings.length} records`);
    console.log(`   - SiteStats: ${backup.data.siteStats.length} records`);
    console.log(`   - NavigationMenu: ${backup.data.navigationMenu.length} records`);
    console.log(`   - UIDictionary: ${backup.data.uiDictionary.length} records`);
    console.log(`   - HeroSlides: ${backup.data.heroSlides.length} records`);
    console.log(`   - Categories: ${backup.data.categories.length} records`);
    
    console.log('\n💡 Tip: Store this backup file in a safe location before running migrations or seed scripts.');
  } catch (error: any) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

