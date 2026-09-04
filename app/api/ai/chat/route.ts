import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletionWithFallback } from '@/lib/ai-service';
import { prisma } from '@/lib/prisma';

const getSystemPrompt = (locale: string) => `You are "Salam AI", the intelligent assistant for Salam Scholarships. Your PRIMARY GOAL is to act as a Lead Catcher and redirect users to our expert human consultants on Telegram.

Your rules:
1. Answer basic, general questions briefly.
2. If the user asks about specific scholarships, admission probability, document evaluation, or personal guidance, YOU MUST STOP and politely say: "This is a great question! For a precise evaluation of your chances and to get a full scholarship, you need to speak with our experts. Please click the 'Go to Telegram' button below to start your consultation."
3. CRITICAL: You must ALWAYS respond in the EXACT SAME LANGUAGE the user asks the question in (Tajik, Russian, or English). The user's current site interface language is: ${locale.toUpperCase()}. If they ask in Tajik, your response MUST be in pure, polite Tajik.
4. Never make up details about our prices or guarantees. Just send them to Telegram.
5. Keep responses extremely concise (max 3 sentences) so they don't get bored.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, locale = 'en' } = await request.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages are required' },
        { status: 400 }
      );
    }

    // --- Heavy RAG logic removed for ultra-fast "bank payment" speed ---
    // Since the AI's goal is to redirect users to Telegram, we skip the slow postgres query.

    const chatMessages = [
      { role: 'system' as const, content: getSystemPrompt(locale) },
      ...messages.slice(-5).map((m: { role: string; content: string }) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: String(m.content || '').slice(0, 1000), // Limit context size for speed
      })),
    ];

    const result = await createChatCompletionWithFallback(
      {
        messages: chatMessages,
        temperature: 0.3, // Lower temp is often faster for deterministic replies
        max_tokens: 150,  // Hard cap to ensure lightning-fast completion
      },
      'gemini'
    );

    return NextResponse.json({
      success: true,
      data: { content: result.content, provider: result.provider },
    });
  } catch (error: unknown) {
    console.error('[AI Chat]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: message.includes('No AI providers') || message.includes('configured')
          ? 'AI assistant is not configured. Please contact support.'
          : 'Failed to get response. Please try again.',
      },
      { status: 500 }
    );
  }
}
