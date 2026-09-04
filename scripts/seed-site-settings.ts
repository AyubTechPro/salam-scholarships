import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding site settings...');

  // Upsert site settings
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 'global' },
    update: {
      linkedinUrl: 'https://www.linkedin.com/company/salamconsulting',
      instagramUrl: 'https://www.instagram.com/salamconsultingtj?igsh=MWl0ZGk4Zm94NmhpNw%3D%3D&utm_source=qr',
      telegramChannelUrl: 'https://t.me/salamconsulting',
      telegramSupportUsername: 'ayub_it_tj',
      whatsappUrl: 'https://wa.me/message/WLICN6BZQ7QEL1',
      contactEmail: 'salamconsultingtj@gmail.com',
    },
    create: {
      id: 'global',
      linkedinUrl: 'https://www.linkedin.com/company/salamconsulting',
      instagramUrl: 'https://www.instagram.com/salamconsultingtj?igsh=MWl0ZGk4Zm94NmhpNw%3D%3D&utm_source=qr',
      telegramChannelUrl: 'https://t.me/salamconsulting',
      telegramSupportUsername: 'ayub_it_tj',
      whatsappUrl: 'https://wa.me/message/WLICN6BZQ7QEL1',
      contactEmail: 'salamconsultingtj@gmail.com',
    },
  });

  console.log('✅ Site settings seeded:', siteSettings);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding site settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

