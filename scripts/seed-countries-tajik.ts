/**
 * Seed Countries with Tajik names
 * Run with: npx tsx scripts/seed-countries-tajik.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const countries = [
  { name: 'Germany', nameRu: 'Германия', nameTj: 'Олмон', code: 'DE' },
  { name: 'Turkey', nameRu: 'Турция', nameTj: 'Туркия', code: 'TR' },
  { name: 'United Kingdom', nameRu: 'Великобритания', nameTj: 'Бритониё', code: 'GB' },
  { name: 'United States', nameRu: 'Соединённые Штаты', nameTj: 'ИМА', code: 'US' },
  { name: 'Netherlands', nameRu: 'Нидерланды', nameTj: 'Нидерланд', code: 'NL' },
  { name: 'France', nameRu: 'Франция', nameTj: 'Фаронса', code: 'FR' },
  { name: 'Sweden', nameRu: 'Швеция', nameTj: 'Шветсия', code: 'SE' },
  { name: 'Canada', nameRu: 'Канада', nameTj: 'Канада', code: 'CA' },
  { name: 'Japan', nameRu: 'Япония', nameTj: 'Ҷопон', code: 'JP' },
  { name: 'South Korea', nameRu: 'Южная Корея', nameTj: 'Кореяи Ҷанубӣ', code: 'KR' },
  { name: 'Singapore', nameRu: 'Сингапур', nameTj: 'Сингапур', code: 'SG' },
  { name: 'Australia', nameRu: 'Австралия', nameTj: 'Австралия', code: 'AU' },
  { name: 'New Zealand', nameRu: 'Новая Зеландия', nameTj: 'Зеландияи Нав', code: 'NZ' },
];

async function main() {
  console.log('🌍 Seeding Countries with Tajik names...');

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {
        name: country.name,
        nameRu: country.nameRu,
        nameTj: country.nameTj,
        isActive: true,
      },
      create: {
        name: country.name,
        nameRu: country.nameRu,
        nameTj: country.nameTj,
        code: country.code,
        isActive: true,
        order: 0,
      },
    });
    console.log(`✅ Seeded: ${country.name} -> ${country.nameTj}`);
  }

  console.log('🎉 Countries seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

