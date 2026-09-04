import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dictionaryEntries = [
  // Hero Stats Labels
  {
    key: 'hero.stats.opportunities',
    en: 'Active Opportunities',
    ru: 'Активные возможности',
    tj: 'Имкониятҳои фаъол',
    category: 'hero',
    description: 'Hero section stat label for opportunities',
  },
  {
    key: 'hero.stats.countries',
    en: 'Countries',
    ru: 'Страны',
    tj: 'Кишварҳо',
    category: 'hero',
    description: 'Hero section stat label for countries',
  },
  {
    key: 'hero.stats.students',
    en: 'Students Served',
    ru: 'Студенты обслуживаются',
    tj: 'Донишҷӯёни хизматрасонӣ',
    category: 'hero',
    description: 'Hero section stat label for students',
  },
  // TrustBar Labels
  {
    key: 'trustBar.opportunities',
    en: 'Active Opportunities',
    ru: 'Активные возможности',
    tj: 'Имкониятҳои фаъол',
    category: 'trustBar',
    description: 'TrustBar stat label for opportunities',
  },
  {
    key: 'trustBar.countries',
    en: 'Countries',
    ru: 'Страны',
    tj: 'Кишварҳо',
    category: 'trustBar',
    description: 'TrustBar stat label for countries',
  },
  {
    key: 'trustBar.consultations',
    en: 'Consultations',
    ru: 'Консультации',
    tj: 'Машваратҳо',
    category: 'trustBar',
    description: 'TrustBar stat label for consultations',
  },
  // Global Reach
  {
    key: 'globalReach.title',
    en: 'Global Reach',
    ru: 'Глобальный охват',
    tj: 'Қабули ҷаҳонӣ',
    category: 'sections',
    description: 'Global Reach section title',
  },
  // Opportunities Section
  {
    key: 'opportunitiesSection.title',
    en: 'Latest Opportunities',
    ru: 'Последние возможности',
    tj: 'Имкониятҳои охирин',
    category: 'sections',
    description: 'Opportunities section title on homepage',
  },
  {
    key: 'opportunitiesSection.viewAll',
    en: 'View All',
    ru: 'Смотреть все',
    tj: 'Дидани ҳама',
    category: 'buttons',
    description: 'View All button text for opportunities section',
  },
];

async function seedHeroStatsDictionary() {
  try {
    console.log('🌱 Seeding UIDictionary with Hero Stats keys...');

    for (const entry of dictionaryEntries) {
      await prisma.uIDictionary.upsert({
        where: { key: entry.key },
        update: {
          en: entry.en,
          ru: entry.ru,
          tj: entry.tj,
          category: entry.category,
          description: entry.description,
        },
        create: {
          key: entry.key,
          en: entry.en,
          ru: entry.ru,
          tj: entry.tj,
          category: entry.category,
          description: entry.description,
        },
      });
      console.log(`✓ Seeded: ${entry.key}`);
    }

    console.log('✅ Successfully seeded all UIDictionary entries!');
  } catch (error) {
    console.error('❌ Error seeding UIDictionary:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedHeroStatsDictionary();

