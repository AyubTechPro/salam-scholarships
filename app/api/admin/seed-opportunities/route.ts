/**
 * Seed Opportunities API
 * Generates 20 realistic global scholarships using Groq AI
 * Admin-only route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createChatCompletionWithFallback } from '@/lib/ai-service';
import { requireSuperAdminAPI } from '@/lib/rbac-api';

const SCHOLARSHIPS = [
  {
    name: 'DAAD Scholarship',
    country: 'Germany',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Fulbright Program',
    country: 'United States',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Chevening Scholarship',
    country: 'United Kingdom',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Turkiye Burslari',
    country: 'Turkey',
    level: 'BACHELOR',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'MEXT Scholarship',
    country: 'Japan',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Erasmus Mundus',
    country: 'Multiple',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Swiss Government Excellence',
    country: 'Switzerland',
    level: 'PHD',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Australia Awards',
    country: 'Australia',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Vanier Canada Graduate',
    country: 'Canada',
    level: 'PHD',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Orange Knowledge Program',
    country: 'Netherlands',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'PARTIAL',
  },
  {
    name: 'Swedish Institute',
    country: 'Sweden',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'VLIR-UOS Scholarship',
    country: 'Belgium',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Stipendium Hungaricum',
    country: 'Hungary',
    level: 'BACHELOR',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'New Zealand Scholarships',
    country: 'New Zealand',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Korean Government Scholarship',
    country: 'South Korea',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'China Scholarship Council',
    country: 'China',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'French Eiffel Excellence',
    country: 'France',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Italian Government Scholarships',
    country: 'Italy',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'PARTIAL',
  },
  {
    name: 'Norway Quota Scheme',
    country: 'Norway',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'FULL',
  },
  {
    name: 'Denmark Government Scholarships',
    country: 'Denmark',
    level: 'MASTER',
    category: 'SCHOLARSHIP',
    fundingType: 'PARTIAL',
  },
];

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const { error } = await requireSuperAdminAPI();
    if (error) return error;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const createdOpportunities = [];

    for (const scholarship of SCHOLARSHIPS) {
      try {
        // Generate detailed content using Groq AI
        const prompt = `Generate a detailed scholarship description for ${scholarship.name} in ${scholarship.country}.

Requirements:
- Title: ${scholarship.name} - ${scholarship.country}
- Level: ${scholarship.level}
- Category: ${scholarship.category}
- Funding: ${scholarship.fundingType}
- Country: ${scholarship.country}

Generate:
1. A compelling title (max 100 characters)
2. A detailed description (300-500 words) covering:
   - What the scholarship offers
   - Eligibility requirements
   - Application process
   - Benefits and coverage
   - Why it's valuable
3. Key requirements (bullet points, 5-7 items)
4. Benefits (bullet points, 5-7 items)
5. A realistic deadline (format: YYYY-MM-DD, should be 3-12 months from now)

Return ONLY a valid JSON object:
{
  "title": "...",
  "description": "...",
  "requirements": ["req1", "req2", ...],
  "benefits": ["benefit1", "benefit2", ...],
  "deadline": "YYYY-MM-DD"
}`;

        const aiResult = await createChatCompletionWithFallback({
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational consultant. Always respond with valid JSON only, no additional text.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });

        // Parse AI response
        const content = aiResult.content.trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`Failed to parse AI response for ${scholarship.name}`);
          continue;
        }

        const scholarshipData = JSON.parse(jsonMatch[0]);

        // Calculate deadline (3-12 months from now)
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + Math.floor(Math.random() * 9) + 3);

        // Create opportunity in database
        const opportunity = await prisma.program.create({
          data: {
            title: scholarshipData.title || `${scholarship.name} - ${scholarship.country}`,
            description: scholarshipData.description || `Apply for ${scholarship.name} in ${scholarship.country}`,
            institution: scholarshipData.institution || scholarship.country,
            level: scholarship.level as any,
            category: scholarship.category as any,
            fundingType: scholarship.fundingType as any,
            country: scholarship.country,
            deadline: scholarshipData.deadline ? new Date(scholarshipData.deadline) : deadline,
            isActive: true,
            isVerified: true,
            isExpired: false,
            dynamicFields: (scholarshipData.requirements || scholarshipData.benefits)
              ? { requirements: scholarshipData.requirements || [], benefits: scholarshipData.benefits || [] }
              : undefined,
            viewCount: 0,
            slug: `${scholarship.name.toLowerCase().replace(/\s+/g, '-')}-${scholarship.country.toLowerCase().replace(/\s+/g, '-')}`,
          },
        });

        createdOpportunities.push(opportunity);
      } catch (error) {
        console.error(`Error creating ${scholarship.name}:`, error);
        // Continue with next scholarship
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdOpportunities.length} opportunities`,
      data: {
        count: createdOpportunities.length,
        opportunities: createdOpportunities.map(opp => ({
          id: opp.id,
          title: opp.title,
          country: opp.country,
        })),
      },
    });
  } catch (error) {
    console.error('Error seeding opportunities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed opportunities' },
      { status: 500 }
    );
  }
}

