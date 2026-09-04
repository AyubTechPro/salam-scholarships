/**
 * Daily Global Tip API
 * Generates a daily tip for studying abroad using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createChatCompletionWithFallback } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

// Cache daily tips (one per day, per locale)
const TIPS_CACHE = new Map<string, { tip: string; date: string }>();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // Check cache first
    const cacheKey = `tip-${locale}`;
    const today = new Date().toDateString();
    const cached = TIPS_CACHE.get(cacheKey);
    
    if (cached && cached.date === today) {
      return NextResponse.json({
        success: true,
        data: { tip: cached.tip },
      });
    }

    // Generate new tip
    const language = locale === 'ru' ? 'Russian' : locale === 'tj' ? 'Tajik' : 'English';
    
    const prompt = `You are an expert educational consultant helping students study abroad.

Generate a short, inspiring, and practical tip (2-3 sentences) for students who want to study abroad. Make it:
1. Actionable and specific
2. Encouraging and motivating
3. Relevant to international students
4. Written in ${language}

Examples:
- "Start preparing your language certificates early. IELTS/TOEFL scores are valid for 2 years, so take the test when you're ready, not when deadlines approach."
- "Research your target country's visa requirements 6 months before application deadlines. Some countries require financial proof that takes time to prepare."
- "Connect with current students from your target university on LinkedIn. They can provide insider tips about the application process and campus life."

Generate today's tip:`;

    try {
      const result = await createChatCompletionWithFallback({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational consultant. Provide concise, actionable tips.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const tip = result.content.trim();

      // Cache the tip
      TIPS_CACHE.set(cacheKey, { tip, date: today });

      return NextResponse.json({
        success: true,
        data: { tip },
      });
    } catch (error) {
      console.error('Error generating daily tip:', error);
      
      // Fallback tips
      const fallbackTips: Record<string, string[]> = {
        en: [
          'Start preparing your language certificates early. IELTS/TOEFL scores are valid for 2 years, so take the test when you\'re ready.',
          'Research your target country\'s visa requirements 6 months before application deadlines. Some countries require financial proof that takes time to prepare.',
          'Connect with current students from your target university on LinkedIn. They can provide insider tips about the application process.',
        ],
        ru: [
          'Начните готовиться к языковым сертификатам заранее. Результаты IELTS/TOEFL действительны в течение 2 лет, поэтому сдайте тест, когда будете готовы.',
          'Изучите требования к визе вашей целевой страны за 6 месяцев до крайних сроков подачи заявок. Некоторым странам требуется финансовое подтверждение, на подготовку которого уходит время.',
          'Свяжитесь с нынешними студентами вашего целевого университета в LinkedIn. Они могут предоставить внутренние советы о процессе подачи заявок.',
        ],
        tj: [
          'Пеш аз вақт ба сертификатҳои забонӣ омода шавед. Натиҷаҳои IELTS/TOEFL барои 2 сол эътибор доранд, бинобар ин вақте ки омода ҳастед, тестро супур.',
          'Талаботҳои визаи кишвари мақсади худро 6 моҳ пеш аз мӯҳлати дархостҳо омӯзед. Баъзе кишварҳо талаб мекунанд, ки исботи молиявӣ, ки вақт мегирад, тайёр карда шавад.',
          'Бо донишҷӯёни ҷории донишгоҳи мақсади худ дар LinkedIn тамос гиред. Онҳо метавонанд маслиҳатҳои дохилиро дар бораи раванди дархост диҳанд.',
        ],
      };

      const tips = fallbackTips[locale] || fallbackTips.en;
      const randomTip = tips[Math.floor(Math.random() * tips.length)];

      return NextResponse.json({
        success: true,
        data: { tip: randomTip },
      });
    }
  } catch (error) {
    console.error('Error fetching daily tip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily tip' },
      { status: 500 }
    );
  }
}

