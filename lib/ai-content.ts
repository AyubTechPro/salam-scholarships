/**
 * AI Content Assistant Utility
 * Generates translations and summaries using AI with automatic fallback
 * Supports OpenAI, Groq, and Together AI
 */

import { createChatCompletionWithFallback, getAIErrorMessage, isAIAvailable } from './ai-service';

interface ContentGenerationOptions {
  sourceText: string;
  sourceLanguage?: 'en' | 'ru' | 'tj';
  targetLanguages: ('en' | 'ru' | 'tj')[];
  contentType: 'translation' | 'summary' | 'both';
  url?: string; // If provided, fetch content from URL first
}

interface GeneratedContent {
  translations: Record<string, string>;
  summary?: string;
  error?: string;
}

/**
 * Fetch content from URL
 */
async function fetchContentFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const html = await response.text();
    // Simple HTML to text extraction (can be improved with a library like jsdom)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text.substring(0, 5000); // Limit to 5000 characters
  } catch (error) {
    throw new Error(`Error fetching URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate translations and summaries using AI with automatic fallback
 */
async function generateWithAI(
  options: ContentGenerationOptions
): Promise<GeneratedContent> {
  let sourceText = options.sourceText;
  
  // If URL provided, fetch content first
  if (options.url) {
    sourceText = await fetchContentFromURL(options.url);
  }

  const translations: Record<string, string> = {};
  const translationPromises: Promise<void>[] = [];

  // Generate translations for each target language
  for (const lang of options.targetLanguages) {
    if (lang === options.sourceLanguage) {
      translations[lang] = sourceText;
      continue;
    }

    const langName = lang === 'en' ? 'English' : lang === 'ru' ? 'Russian' : 'Tajik';
    const sourceLangName = options.sourceLanguage === 'en' ? 'English' : options.sourceLanguage === 'ru' ? 'Russian' : 'Tajik';

    translationPromises.push(
      createChatCompletionWithFallback({
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text from ${sourceLangName} to ${langName}. Maintain the original meaning, tone, and formatting.`,
          },
          {
            role: 'user',
            content: sourceText,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })
        .then((result) => {
          translations[lang] = result.content;
        })
        .catch((error: any) => {
          console.error(`Error translating to ${langName}:`, error);
          // Set empty translation on error (will be handled by outer catch)
          translations[lang] = '';
          throw error;
        })
    );
  }

  try {
    await Promise.all(translationPromises);
  } catch (error: any) {
    // If all translations failed, return error
    const errorMessage = getAIErrorMessage(error);
    return {
      translations: {},
      error: errorMessage,
    };
  }

  // Generate summary if requested
  let summary: string | undefined;
  if (options.contentType === 'summary' || options.contentType === 'both') {
    try {
      const summaryResult = await createChatCompletionWithFallback({
        messages: [
          {
            role: 'system',
            content: 'You are a content summarizer. Create a concise, informative summary of the following text.',
          },
          {
            role: 'user',
            content: sourceText,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });
      summary = summaryResult.content || undefined;
    } catch (error: any) {
      // If summary generation fails, log but don't fail the entire request
      console.error('Error generating summary:', error);
      // Summary is optional, so we continue even if it fails
    }
  }

  return { translations, summary };
}

/**
 * Generate content using AI with automatic fallback
 */
export async function generateAIContent(
  options: ContentGenerationOptions
): Promise<GeneratedContent> {
  try {
    // Check if AI is available
    const aiAvailable = await isAIAvailable();
    if (!aiAvailable) {
      return {
        translations: {},
        error: 'AI content generation is not enabled or configured. Please configure at least one AI provider (OpenAI, Groq, or Together AI) in Admin Panel or environment variables.',
      };
    }

    // Use unified AI service with automatic fallback
    return await generateWithAI(options);
  } catch (error: any) {
    console.error('Error generating AI content:', error);
    
    // Get user-friendly error message
    const errorMessage = getAIErrorMessage(error);
    
    return {
      translations: {},
      error: errorMessage,
    };
  }
}

