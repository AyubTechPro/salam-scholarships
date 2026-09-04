/**
 * AI Motivation Letter Scorer
 * Analyzes student motivation letters and provides a 0-100 score
 * based on clarity, relevance, and grammar
 * Uses unified AI service with automatic fallback (OpenAI > Groq > Together AI)
 */

import { createChatCompletionWithFallback, getAIErrorMessage, isAIAvailable } from './ai-service';

interface MotivationScoreResult {
  score: number; // 0-100
  feedback: {
    clarity: number; // 0-100
    relevance: number; // 0-100
    grammar: number; // 0-100
    overall: string; // Text feedback
  };
  error?: string;
  provider?: string; // Which AI provider was used
}

/**
 * Score motivation letter using AI with automatic fallback
 */
export async function scoreMotivationLetter(
  motivationLetter: string,
  programTitle?: string,
  programDescription?: string
): Promise<MotivationScoreResult> {
  try {
    // Check if AI is available
    const aiAvailable = await isAIAvailable();
    if (!aiAvailable) {
      return {
        score: 50,
        feedback: {
          clarity: 50,
          relevance: 50,
          grammar: 50,
          overall: 'AI scoring is not enabled. Please configure at least one AI provider (OpenAI, Groq, or Together AI) in Admin Panel or environment variables.',
        },
        error: 'No AI providers configured',
      };
    }

    // Build context for scoring
    const programContext = programTitle
      ? `\n\nProgram: ${programTitle}${programDescription ? `\nDescription: ${programDescription.substring(0, 500)}` : ''}`
      : '';

    const prompt = `You are an expert educational consultant evaluating a student's motivation letter for a scholarship/educational program application.

${programContext}

Evaluate this motivation letter on three criteria (each scored 0-100):
1. **Clarity**: Is the letter clear, well-structured, and easy to understand?
2. **Relevance**: Does it clearly explain why the applicant is interested in this specific program and what they will contribute?
3. **Grammar**: Is the writing grammatically correct with proper spelling and punctuation?

Return ONLY a valid JSON object with this exact structure:
{
  "clarity": <number 0-100>,
  "relevance": <number 0-100>,
  "grammar": <number 0-100>,
  "overall": "<brief feedback text (2-3 sentences)>"
}

Motivation Letter:
${motivationLetter}`;

    // Use unified AI service with automatic fallback
    const result = await createChatCompletionWithFallback({
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
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = result.content;
    
    // Parse JSON response
    let feedback: { clarity: number; relevance: number; grammar: number; overall: string };
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to default scoring
      return {
        score: 50,
        feedback: {
          clarity: 50,
          relevance: 50,
          grammar: 50,
          overall: 'AI scoring encountered an error. Please try again.',
        },
        error: 'Failed to parse AI response',
      };
    }

    // Calculate weighted average score (clarity: 30%, relevance: 40%, grammar: 30%)
    const score = Math.round(
      feedback.clarity * 0.3 +
      feedback.relevance * 0.4 +
      feedback.grammar * 0.3
    );

    return {
      score: Math.max(0, Math.min(100, score)), // Ensure score is 0-100
      feedback: {
        clarity: Math.max(0, Math.min(100, feedback.clarity)),
        relevance: Math.max(0, Math.min(100, feedback.relevance)),
        grammar: Math.max(0, Math.min(100, feedback.grammar)),
        overall: feedback.overall || 'No feedback provided.',
      },
      provider: result.provider,
    };
  } catch (error: any) {
    console.error('Error scoring motivation letter:', error);
    
    // Get user-friendly error message
    const errorMessage = getAIErrorMessage(error);
    
    return {
      score: 50,
      feedback: {
        clarity: 50,
        relevance: 50,
        grammar: 50,
        overall: errorMessage,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

