/**
 * Magic Search API - Natural Language Opportunity Search
 * Uses AI to understand user intent and find matching opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletionWithFallback } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const searchSchema = z.object({
  query: z.string().min(1),
  locale: z.enum(['en', 'ru', 'tj']).optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const { allowed } = await checkRateLimit(ip, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }
    const body = await request.json();
    const { query, locale } = searchSchema.parse(body);

    // Use AI to extract search parameters from natural language
    const language = locale === 'ru' ? 'Russian' : locale === 'tj' ? 'Tajik' : 'English';
    
    const aiPrompt = `You are an expert educational consultant helping students find opportunities.

User Query: "${query}"

Extract the following information from the user's query and return ONLY a valid JSON object:
{
  "level": "SCHOOL" | "BACHELOR" | "MASTER" | "PHD" | null,
  "category": "SCHOLARSHIP" | "FORUM" | "SUMMER_SCHOOL" | "CONFERENCE" | "EXCHANGE" | "INTERNSHIP" | "SEMINAR" | null,
  "country": "<country name>" | null,
  "fundingType": "FULL" | "PARTIAL" | "NONE" | null,
  "keywords": ["<keyword1>", "<keyword2>"],
  "fieldOfStudy": "<field>" | null
}

Examples:
- "Find me a scholarship in Germany for IT" → {"level": null, "category": "SCHOLARSHIP", "country": "Germany", "fundingType": null, "keywords": ["IT", "technology"], "fieldOfStudy": "IT"}
- "Master degree programs in USA" → {"level": "MASTER", "category": null, "country": "United States", "fundingType": null, "keywords": ["master"], "fieldOfStudy": null}
- "Fully funded PhD in computer science" → {"level": "PHD", "category": null, "country": null, "fundingType": "FULL", "keywords": ["computer science", "PhD"], "fieldOfStudy": "Computer Science"}

Return ONLY the JSON object, no additional text.`;

    let searchParams: any = {
      level: null,
      category: null,
      country: null,
      fundingType: null,
      keywords: [],
      fieldOfStudy: null,
    };

    try {
      const aiResult = await createChatCompletionWithFallback({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: aiPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      // Parse AI response
      const content = aiResult.content.trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        searchParams = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI search parsing error:', error);
      // Fallback to keyword search
      searchParams.keywords = query.split(' ').filter(w => w.length > 2);
    }

    // Build Prisma query
    const where: any = {
      isActive: true,
      isExpired: false,
      deletedAt: null,
    };

    if (searchParams.level) {
      where.level = searchParams.level;
    }

    if (searchParams.category) {
      where.category = searchParams.category;
    }

    if (searchParams.fundingType) {
      where.fundingType = searchParams.fundingType;
    }

    if (searchParams.country) {
      where.country = {
        contains: searchParams.country,
        mode: 'insensitive',
      };
    }

    // Keyword search: match ANY keyword in title/description (OR across keywords)
    const allKeywords = [
      ...(searchParams.keywords || []),
      ...(searchParams.fieldOfStudy ? [searchParams.fieldOfStudy] : []),
    ].filter(Boolean);
    if (allKeywords.length > 0) {
      where.OR = allKeywords.flatMap((keyword: string) => [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { titleRu: { contains: keyword, mode: 'insensitive' } },
        { descriptionRu: { contains: keyword, mode: 'insensitive' } },
        { titleTj: { contains: keyword, mode: 'insensitive' } },
        { descriptionTj: { contains: keyword, mode: 'insensitive' } },
      ]);
    }

    // Fetch matching opportunities - 2026: hybrid ranking (verified + deadline urgency)
    const opportunities = await prisma.program.findMany({
      where,
      take: 24,
      orderBy: [
        { isVerified: 'desc' },
        { deadline: 'asc' },
      ],
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
    });

    return NextResponse.json({
      success: true,
      data: {
        opportunities,
        searchParams,
        query,
      },
    });
  } catch (error) {
    console.error('Magic search error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to process search' },
      { status: 500 }
    );
  }
}

