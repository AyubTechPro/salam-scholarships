/**
 * Direct Scholarship Seeding Script
 * Run with: npx tsx scripts/seed-scholarships.ts
 * 
 * This script directly seeds the database with AI-generated scholarships
 * without requiring API authentication.
 */

import { PrismaClient } from '@prisma/client';
import { createChatCompletionWithFallback } from '../lib/ai-service';

const prisma = new PrismaClient();

const SCHOLARSHIP_TEMPLATES = [
  { name: 'Chevening Scholarship 2025', country: 'United Kingdom', level: 'MASTER', region: 'EUROPE' },
  { name: 'DAAD Scholarship', country: 'Germany', level: 'MASTER', region: 'EUROPE' },
  { name: 'Fulbright Program', country: 'United States', level: 'MASTER', region: 'NORTH_AMERICA' },
  { name: 'MEXT Scholarship', country: 'Japan', level: 'MASTER', region: 'ASIA' },
  { name: 'Turkiye Burslari', country: 'Turkey', level: 'BACHELOR', region: 'ASIA' },
  { name: 'Stipendium Hungaricum', country: 'Hungary', level: 'BACHELOR', region: 'EUROPE' },
  { name: 'Swiss Government Excellence', country: 'Switzerland', level: 'PHD', region: 'EUROPE' },
  { name: 'Australia Awards', country: 'Australia', level: 'MASTER', region: 'OCEANIA' },
  { name: 'Vanier Canada Graduate', country: 'Canada', level: 'PHD', region: 'NORTH_AMERICA' },
  { name: 'Orange Knowledge Program', country: 'Netherlands', level: 'MASTER', region: 'EUROPE' },
  { name: 'Swedish Institute Scholarship', country: 'Sweden', level: 'MASTER', region: 'EUROPE' },
  { name: 'VLIR-UOS Scholarship', country: 'Belgium', level: 'MASTER', region: 'EUROPE' },
  { name: 'New Zealand Scholarships', country: 'New Zealand', level: 'MASTER', region: 'OCEANIA' },
  { name: 'Korean Government Scholarship', country: 'South Korea', level: 'MASTER', region: 'ASIA' },
  { name: 'China Scholarship Council', country: 'China', level: 'MASTER', region: 'ASIA' },
  { name: 'French Eiffel Excellence', country: 'France', level: 'MASTER', region: 'EUROPE' },
  { name: 'Italian Government Scholarships', country: 'Italy', level: 'MASTER', region: 'EUROPE' },
  { name: 'Norway Quota Scheme', country: 'Norway', level: 'MASTER', region: 'EUROPE' },
  { name: 'Denmark Government Scholarships', country: 'Denmark', level: 'MASTER', region: 'EUROPE' },
  { name: 'Erasmus Mundus Joint Masters', country: 'Multiple Countries', level: 'MASTER', region: 'EUROPE' },
];

async function seedScholarships() {
  console.log('🌱 Starting scholarship seeding...\n');

  const createdPrograms = [];
  const errors = [];

  for (let i = 0; i < SCHOLARSHIP_TEMPLATES.length; i++) {
    const template = SCHOLARSHIP_TEMPLATES[i];
    console.log(`[${i + 1}/${SCHOLARSHIP_TEMPLATES.length}] Generating ${template.name}...`);

    try {
      // Generate comprehensive scholarship data using Groq AI
      const prompt = `Generate a detailed, realistic scholarship description for ${template.name} in ${template.country} for 2025.

Requirements:
- This is a REAL scholarship program that exists in 2025
- Level: ${template.level}
- Country: ${template.country}
- Must include current 2025 deadlines and requirements

Generate a JSON object with:
{
  "title": "Full scholarship title (max 120 chars)",
  "description": "Comprehensive 400-600 word description covering: what it offers, eligibility, application process, benefits, coverage, and value proposition",
  "institution": "Institution or organization name",
  "deadline": "YYYY-MM-DD (realistic 2025 deadline, 2-12 months from now)",
  "applicationUrl": "Official application website URL (realistic)",
  "websiteUrl": "Official scholarship website URL",
  "requirements": ["Requirement 1", "Requirement 2", ...] (5-8 key requirements),
  "benefits": ["Benefit 1", "Benefit 2", ...] (5-8 key benefits)
}

Return ONLY valid JSON, no markdown, no code blocks.`;

      const aiResult = await createChatCompletionWithFallback({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational consultant specializing in global scholarships. Always respond with valid JSON only, no additional text or markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Parse AI response
      const content = aiResult.content.trim();
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        errors.push(`Failed to parse AI response for ${template.name}`);
        console.log(`  ❌ Failed to parse AI response\n`);
        continue;
      }

      const scholarshipData = JSON.parse(jsonMatch[0]);

      // Generate slug
      const slug = scholarshipData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      // Check if program already exists
      const existing = await prisma.program.findUnique({
        where: { slug },
      });

      if (existing) {
        console.log(`  ⏭️  Already exists, skipping...\n`);
        continue;
      }

      // Ensure slug is unique
      let finalSlug = slug;
      let slugCounter = 1;
      while (await prisma.program.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${slugCounter}`;
        slugCounter++;
      }

      // Parse deadline
      let deadline = new Date();
      deadline.setMonth(deadline.getMonth() + Math.floor(Math.random() * 10) + 2);
      
      if (scholarshipData.deadline) {
        try {
          const parsedDeadline = new Date(scholarshipData.deadline);
          if (!isNaN(parsedDeadline.getTime())) {
            deadline = parsedDeadline;
          }
        } catch {
          // Use default deadline
        }
      }

      // Create program in database
      const program = await prisma.program.create({
        data: {
          title: scholarshipData.title || `${template.name} - ${template.country}`,
          description: scholarshipData.description || `Apply for ${template.name} in ${template.country}. This prestigious scholarship program offers excellent opportunities for international students.`,
          level: template.level as any,
          category: 'SCHOLARSHIP',
          fundingType: 'FULL',
          region: template.region as any,
          country: template.country,
          institution: scholarshipData.institution || (template.country.includes('Government') ? `${template.country} Government` : `${template.country} University`),
          deadline: deadline,
          slug: finalSlug,
          websiteUrl: scholarshipData.websiteUrl || scholarshipData.applicationUrl || `https://example.com/${finalSlug}`,
          applicationUrl: scholarshipData.applicationUrl || null,
          isActive: true,
          isVerified: true,
          isExpired: false,
          isFeatured: Math.random() > 0.7,
          viewCount: 0,
          requiresEnglishCert: Math.random() > 0.3,
          dynamicFields: {
            requirements: scholarshipData.requirements || [
              'Bachelor\'s degree or equivalent',
              'English language proficiency (IELTS/TOEFL)',
              'Academic transcripts',
              'Letters of recommendation',
            ],
            benefits: scholarshipData.benefits || [
              'Full tuition coverage',
              'Monthly stipend',
              'Health insurance',
              'Travel allowance',
            ],
          },
        },
      });

      createdPrograms.push({
        id: program.id,
        title: program.title,
        country: program.country,
        level: program.level,
        deadline: program.deadline,
      });

      console.log(`  ✅ Created: ${program.title}\n`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${template.name}: ${errorMsg}`);
      console.log(`  ❌ Error: ${errorMsg}\n`);
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`  ✅ Successfully created: ${createdPrograms.length} scholarships`);
  if (errors.length > 0) {
    console.log(`  ❌ Errors: ${errors.length}`);
    errors.forEach((err) => console.log(`    - ${err}`));
  }

  await prisma.$disconnect();
  process.exit(0);
}

seedScholarships().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});

