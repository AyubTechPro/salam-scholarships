import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletionWithFallback } from '@/lib/ai-service';
import { requireAnyAdminAPI } from '@/lib/rbac-api';

export const dynamic = 'force-dynamic';

const ADMIN_SYSTEM_PROMPT = `You are Salam Scholarships Admin AI — an expert assistant for the Salam Scholarships platform team. You help administrators manage the educational opportunity platform (scholarships, exchange programs, forums, seminars) for Tajikistan and Central Asia.

Your role:
- Help with platform management: programs, events, users, content, analytics, settings
- Give practical advice on content strategy, SEO, user engagement, and operations
- Explain how to use admin features and best practices
- Support decisions on moderation, consultation requests, and team workflows
- Answer questions in 3 languages: English, Russian (RU), Tajik (TJ). Respond in the user's language.
- Be concise and actionable — use bullet points when helpful
- Reference platform sections: Opportunities, Seminars, Achievements, Users, Consultation Requests, Analytics, Team, Settings, FAQ, How It Works

Platform context:
- Salam Scholarships is Tajikistan's first educational consulting platform for global opportunities
- Admin panel has: Content (programs, seminars, achievements, FAQ, how-it-works), Clients (consultations, users, inbox), Management (dashboard, team, analytics, settings)
- AI providers: Gemini, OpenAI, Groq (configurable in Admin Settings > AI)
- Use latest models and best practices

Keep responses focused and under 400 words unless the user asks for more.`;

export async function POST(request: NextRequest) {
  const authResult = await requireAnyAdminAPI();
  if (authResult.error) return authResult.error;

  try {
    const { messages, locale = 'en' } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages are required' },
        { status: 400 }
      );
    }

    const chatMessages = [
      { role: 'system' as const, content: ADMIN_SYSTEM_PROMPT },
      ...messages.slice(-12).map((m: { role: string; content: string }) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: String(m.content || '').slice(0, 5000),
      })),
    ];

    const result = await createChatCompletionWithFallback(
      {
        messages: chatMessages,
        temperature: 0.5,
        max_tokens: 1536,
      },
      'gemini'
    );

    return NextResponse.json({
      success: true,
      data: { content: result.content, provider: result.provider },
    });
  } catch (error: unknown) {
    console.error('[Admin AI Chat]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error:
          message.includes('No AI providers') || message.includes('configured')
            ? 'AI assistant is not configured. Go to Admin Settings > AI to set up providers.'
            : 'Failed to get response. Please try again.',
      },
      { status: 500 }
    );
  }
}
