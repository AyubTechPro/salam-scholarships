/**
 * AI-Powered Opportunity Matching
 * Matches user profile (goal, country, interests) with best opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletionWithFallback } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const matchSchema = z.object({
  level: z.enum(['SCHOOL', 'BACHELOR', 'MASTER', 'PHD']).optional(),
  country: z.string().optional(),
  interests: z.string().optional(),
  cvText: z.string().optional(),
  locale: z.enum(['en', 'ru', 'tj']).optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const identifier = session?.user?.id ?? getClientIP(request);
    const { allowed } = await checkRateLimit(identifier, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }
    const body = await request.json();
    const { level, country, interests, cvText, locale } = matchSchema.parse(body);

    // Fetch all active opportunities
    const allOpportunities = await prisma.program.findMany({
      where: {
        isActive: true,
        isExpired: false,
        deletedAt: null,
      },
      take: 50, // Limit for AI processing
      select: {
        id: true,
        title: true,
        titleRu: true,
        titleTj: true,
        description: true,
        descriptionRu: true,
        descriptionTj: true,
        level: true,
        category: true,
        country: true,
        fundingType: true,
        deadline: true,
        imageUrl: true,
        isVerified: true,
        slug: true,
      },
      orderBy: [
        { isVerified: 'desc' },
        { deadline: 'asc' },
      ],
    });

    if (allOpportunities.length === 0) {
      return NextResponse.json({
        success: true,
        data: { opportunities: [] },
      });
    }

    // Build context for AI matching
    const userContext = {
      level: level || 'Not specified',
      country: country || 'Any country',
      interests: interests || 'Not specified',
      cvSummary: cvText ? cvText.substring(0, 500) : 'Not provided',
    };

    const opportunitiesSummary = allOpportunities.map((opp, index) => ({
      id: opp.id,
      index,
      title: locale === 'ru' && opp.titleRu ? opp.titleRu : locale === 'tj' && opp.titleTj ? opp.titleTj : opp.title,
      level: opp.level,
      category: opp.category,
      country: opp.country,
      fundingType: opp.fundingType,
      description: (locale === 'ru' && opp.descriptionRu ? opp.descriptionRu : locale === 'tj' && opp.descriptionTj ? opp.descriptionTj : opp.description).substring(0, 200),
    }));

    const language = locale === 'ru' ? 'Russian' : locale === 'tj' ? 'Tajik' : 'English';

    const aiPrompt = `You are an expert educational consultant matching students with opportunities.

User Profile:
- Level: ${userContext.level}
- Preferred Country: ${userContext.country}
- Interests: ${userContext.interests}
- CV Summary: ${userContext.cvSummary}

Available Opportunities (${allOpportunities.length} total):
${JSON.stringify(opportunitiesSummary, null, 2)}

Select the TOP 3 best-matching opportunities based on:
1. Level compatibility
2. Country preference
3. Field of study/interests match
4. Funding availability

Return ONLY a JSON array of opportunity indices (0-based) in order of best match:
[<index1>, <index2>, <index3>]

Example: [5, 12, 3]`;

    let topIndices: number[] = [];

    try {
      const aiResult = await createChatCompletionWithFallback({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Always respond with valid JSON arrays only, no additional text.',
          },
          {
            role: 'user',
            content: aiPrompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 100,
      });

      // Parse AI response
      const content = aiResult.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topIndices = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: simple matching
        topIndices = allOpportunities
          .map((opp, idx) => ({
            idx,
            score: calculateMatchScore(opp, userContext),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(item => item.idx);
      }
    } catch (error) {
      console.error('AI matching error:', error);
      // Fallback: simple matching algorithm
      topIndices = allOpportunities
        .map((opp, idx) => ({
          idx,
          score: calculateMatchScore(opp, userContext),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.idx);
    }

    // Return top 3 opportunities
    const matchedOpportunities = topIndices
      .filter(idx => idx >= 0 && idx < allOpportunities.length)
      .map(idx => allOpportunities[idx])
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        opportunities: matchedOpportunities,
        matchCount: matchedOpportunities.length,
      },
    });
  } catch (error) {
    console.error('Match opportunities error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to match opportunities' },
      { status: 500 }
    );
  }
}

// Simple matching algorithm (fallback)
function calculateMatchScore(opportunity: any, userContext: any): number {
  let score = 0;

  // Level match (40 points)
  if (userContext.level && opportunity.level === userContext.level) {
    score += 40;
  }

  // Country match (30 points)
  if (userContext.country && userContext.country !== 'Any country') {
    if (opportunity.country.toLowerCase().includes(userContext.country.toLowerCase())) {
      score += 30;
    }
  }

  // Funding match (20 points)
  if (opportunity.fundingType === 'FULL') {
    score += 20;
  } else if (opportunity.fundingType === 'PARTIAL') {
    score += 10;
  }

  // Verified bonus (10 points)
  if (opportunity.isVerified) {
    score += 10;
  }

  return score;
}

