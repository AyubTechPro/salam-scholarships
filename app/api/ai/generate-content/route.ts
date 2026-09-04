import { NextRequest, NextResponse } from 'next/server';
import { requireContentDirectorAPI } from '@/lib/rbac-api';
import { generateAIContent } from '@/lib/ai-content';
import { z } from 'zod';

const contentGenerationSchema = z.object({
  sourceText: z.string().min(1),
  sourceLanguage: z.enum(['en', 'ru', 'tj']).optional(),
  targetLanguages: z.array(z.enum(['en', 'ru', 'tj'])).min(1),
  contentType: z.enum(['translation', 'summary', 'both']).default('translation'),
  url: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireContentDirectorAPI();
    if (error) return error;

    const body = await request.json();
    const validatedData = contentGenerationSchema.parse(body);

    const result = await generateAIContent({
      sourceText: validatedData.sourceText,
      sourceLanguage: validatedData.sourceLanguage,
      targetLanguages: validatedData.targetLanguages,
      contentType: validatedData.contentType,
      url: validatedData.url,
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating AI content:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

