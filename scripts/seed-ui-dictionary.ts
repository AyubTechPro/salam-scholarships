/**
 * Seed UI Dictionary with initial keys from translation files
 * Run with: npx tsx scripts/seed-ui-dictionary.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initial UI Dictionary keys from common translations
const initialKeys = [
  // Navbar
  { key: 'common.consulting', category: 'Navbar', description: 'Navbar consultation button text' },
  { key: 'common.scholarships', category: 'Navbar', description: 'Scholarships submenu item' },
  { key: 'common.exchangePrograms', category: 'Navbar', description: 'Exchange programs submenu item' },
  { key: 'common.forumsConferences', category: 'Navbar', description: 'Forums & conferences submenu item' },
  { key: 'common.summerPrograms', category: 'Navbar', description: 'Summer programs submenu item' },
  
  // Buttons
  { key: 'common.learnMore', category: 'Buttons', description: 'Learn More button text' },
  { key: 'common.apply', category: 'Buttons', description: 'Apply button text' },
  { key: 'common.readMore', category: 'Buttons', description: 'Read More button text' },
  { key: 'common.readLess', category: 'Buttons', description: 'Read Less button text' },
  { key: 'buttons.discussTelegram', category: 'Buttons', description: 'Discuss Application on Telegram button' },
  { key: 'buttons.visitOfficialWebsite', category: 'Buttons', description: 'Visit Official Website button' },
  { key: 'buttons.registrationClosed', category: 'Buttons', description: 'Registration Closed button (when deadline passed)' },
  
  // Opportunity Detail Page
  { key: 'opportunityDetail.needHelpTitle', category: 'Opportunity Detail Page', description: 'Need Help CTA title in sidebar' },
  { key: 'opportunityDetail.needHelpDescription', category: 'Opportunity Detail Page', description: 'Need Help CTA description' },
  { key: 'opportunityDetail.successRate', category: 'Opportunity Detail Page', description: 'Success Rate label' },
  { key: 'opportunityDetail.withOurHelp', category: 'Opportunity Detail Page', description: 'With Our Help label' },
  { key: 'opportunityDetail.average', category: 'Opportunity Detail Page', description: 'Average label' },
  { key: 'opportunityDetail.aboutThisOpportunity', category: 'Opportunity Detail Page', description: 'About This Opportunity section title' },
  { key: 'opportunityDetail.programTimeline', category: 'Opportunity Detail Page', description: 'Program Timeline section title' },
  { key: 'opportunityDetail.startDate', category: 'Opportunity Detail Page', description: 'Start Date label' },
  { key: 'opportunityDetail.endDate', category: 'Opportunity Detail Page', description: 'End Date label' },
  { key: 'opportunityDetail.howToApply', category: 'Opportunity Detail Page', description: 'How to Apply section title' },
  { key: 'opportunityDetail.country', category: 'Opportunity Detail Page', description: 'Country label in info grid' },
  { key: 'opportunityDetail.institution', category: 'Opportunity Detail Page', description: 'Institution label in info grid' },
  { key: 'opportunityDetail.deadline', category: 'Opportunity Detail Page', description: 'Deadline label in info grid' },
  { key: 'opportunityDetail.timeLeft', category: 'Opportunity Detail Page', description: 'Time Left label in info grid' },
  { key: 'opportunityDetail.back', category: 'Opportunity Detail Page', description: 'Back button text' },
  { key: 'opportunityDetail.profileAnalysis', category: 'Opportunity Detail Page', description: 'Profile Analysis feature label' },
  { key: 'opportunityDetail.applicationStrategy', category: 'Opportunity Detail Page', description: 'Application Strategy feature label' },
  { key: 'opportunityDetail.documentReview', category: 'Opportunity Detail Page', description: 'Document Review feature label' },
  
  // Page Titles
  { key: 'hero.title', category: 'PageTitles', description: 'Main opportunities page title' },
  { key: 'hero.subtitle', category: 'PageTitles', description: 'Main opportunities page subtitle' },
  { key: 'hero.cta', category: 'PageTitles', description: 'Hero section CTA button' },
  
  // Category Names
  { key: 'category.scholarships', category: 'Categories', description: 'Scholarships category name' },
  { key: 'category.exchange-programs', category: 'Categories', description: 'Exchange programs category name' },
  { key: 'category.forums-conferences', category: 'Categories', description: 'Forums & conferences category name' },
  { key: 'category.summer-programs', category: 'Categories', description: 'Summer programs category name' },
  
  // Opportunity Detail Page
  { key: 'opportunityDetail.needHelpTitle', category: 'Opportunity Detail Page', description: 'Need Help CTA title in sidebar' },
  { key: 'opportunityDetail.needHelpDescription', category: 'Opportunity Detail Page', description: 'Need Help CTA description' },
  { key: 'opportunityDetail.successRate', category: 'Opportunity Detail Page', description: 'Success Rate label' },
  { key: 'opportunityDetail.withOurHelp', category: 'Opportunity Detail Page', description: 'With Our Help label' },
  { key: 'opportunityDetail.average', category: 'Opportunity Detail Page', description: 'Average label' },
  { key: 'opportunityDetail.aboutThisOpportunity', category: 'Opportunity Detail Page', description: 'About This Opportunity section title' },
  { key: 'opportunityDetail.programTimeline', category: 'Opportunity Detail Page', description: 'Program Timeline section title' },
  { key: 'opportunityDetail.startDate', category: 'Opportunity Detail Page', description: 'Start Date label' },
  { key: 'opportunityDetail.endDate', category: 'Opportunity Detail Page', description: 'End Date label' },
  { key: 'opportunityDetail.howToApply', category: 'Opportunity Detail Page', description: 'How to Apply section title' },
  { key: 'opportunityDetail.country', category: 'Opportunity Detail Page', description: 'Country label in info grid' },
  { key: 'opportunityDetail.institution', category: 'Opportunity Detail Page', description: 'Institution label in info grid' },
  { key: 'opportunityDetail.deadline', category: 'Opportunity Detail Page', description: 'Deadline label in info grid' },
  { key: 'opportunityDetail.timeLeft', category: 'Opportunity Detail Page', description: 'Time Left label in info grid' },
  { key: 'opportunityDetail.back', category: 'Opportunity Detail Page', description: 'Back button text' },
  { key: 'opportunityDetail.profileAnalysis', category: 'Opportunity Detail Page', description: 'Profile Analysis feature label' },
  { key: 'opportunityDetail.applicationStrategy', category: 'Opportunity Detail Page', description: 'Application Strategy feature label' },
  { key: 'opportunityDetail.documentReview', category: 'Opportunity Detail Page', description: 'Document Review feature label' },
];

async function main() {
  console.log('🌱 Seeding UI Dictionary...');

  // Import translation files
  const enTranslations = await import('../messages/en.json');
  const ruTranslations = await import('../messages/ru.json');
  const tjTranslations = await import('../messages/tj.json');

  const getNestedValue = (obj: any, path: string): string | null => {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return typeof value === 'string' ? value : null;
  };

  for (const item of initialKeys) {
    const en = getNestedValue(enTranslations.default, item.key);
    const ru = getNestedValue(ruTranslations.default, item.key);
    const tj = getNestedValue(tjTranslations.default, item.key);

    if (!en) {
      console.warn(`⚠️  Key "${item.key}" not found in English translations, skipping...`);
      continue;
    }

    try {
      await prisma.uIDictionary.upsert({
        where: { key: item.key },
        update: {
          en,
          ru: ru || null,
          tj: tj || null,
          category: item.category,
          description: item.description,
        },
        create: {
          key: item.key,
          en,
          ru: ru || null,
          tj: tj || null,
          category: item.category,
          description: item.description,
        },
      });
      console.log(`✅ Seeded: ${item.key}`);
    } catch (error) {
      console.error(`❌ Error seeding ${item.key}:`, error);
    }
  }

  console.log('🎉 UI Dictionary seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

