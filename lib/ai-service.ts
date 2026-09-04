/**
 * Unified AI Service with Fallback Support
 * Supports OpenAI, Groq, Together AI, and Google AI (Gemini) with automatic fallback
 */

export type AIProvider = 'openai' | 'groq' | 'together' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseURL?: string; // For custom endpoints
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  messages: ChatMessage[];
}

export interface ChatCompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
}

export interface AIError {
  provider: AIProvider;
  error: Error;
  statusCode?: number;
}

/**
 * Get AI configuration from environment and database
 */
export async function getAIConfig(): Promise<AIConfig | null> {
  // Priority: Environment variables > Database settings
  const envOpenAIKey = process.env.OPENAI_API_KEY;
  const envGroqKey = process.env.GROQ_API_KEY;
  const envTogetherKey = process.env.TOGETHER_API_KEY;
  const envGeminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const envProvider = process.env.AI_PROVIDER as AIProvider | undefined;
  const envEnabled = process.env.AI_ENABLED === 'true';

  const { prisma } = await import('./prisma');
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' },
    select: {
      aiProvider: true,
      aiApiKey: true,
      aiEnabled: true,
    },
  });

  const aiEnabled = envEnabled || settings?.aiEnabled || false;
  if (!aiEnabled) {
    return null;
  }

  // Determine provider priority: OpenAI > Groq > Together
  const provider = envProvider || (settings?.aiProvider as AIProvider) || 'openai';

  // Get API key based on provider
  let apiKey: string | undefined;
  let baseURL: string | undefined;

  if (provider === 'openai') {
    apiKey = envOpenAIKey || settings?.aiApiKey || undefined;
  } else if (provider === 'groq') {
    apiKey = envGroqKey || settings?.aiApiKey || undefined;
    baseURL = 'https://api.groq.com/openai/v1';
  } else if (provider === 'together') {
    apiKey = envTogetherKey || settings?.aiApiKey || undefined;
    baseURL = 'https://api.together.xyz/v1';
  } else if (provider === 'gemini') {
    apiKey = envGeminiKey || settings?.aiApiKey || undefined;
  }

  if (!apiKey) {
    return null;
  }

  return {
    provider,
    apiKey,
    baseURL,
  };
}

/**
 * Get all available AI configurations (for fallback)
 */
export async function getAllAIConfigs(): Promise<AIConfig[]> {
  const configs: AIConfig[] = [];

  const { prisma } = await import('./prisma');
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'global' },
    select: {
      aiProvider: true,
      aiApiKey: true,
      aiEnabled: true,
    },
  });

  const aiEnabled = process.env.AI_ENABLED === 'true' || settings?.aiEnabled || false;
  if (!aiEnabled) {
    return [];
  }

  // Priority: Environment variables > Database settings

  // Add OpenAI if available
  const openAIKey = process.env.OPENAI_API_KEY || (settings?.aiProvider === 'openai' ? settings?.aiApiKey : null);
  if (openAIKey) {
    configs.push({
      provider: 'openai',
      apiKey: openAIKey,
    });
  }

  // Add Groq if available (only from env, not from DB - Groq is fallback only)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    configs.push({
      provider: 'groq',
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  // Add Together AI if available (only from env, not from DB - Together is fallback only)
  const togetherKey = process.env.TOGETHER_API_KEY;
  if (togetherKey) {
    configs.push({
      provider: 'together',
      apiKey: togetherKey,
      baseURL: 'https://api.together.xyz/v1',
    });
  }

  // Add Google AI (Gemini) if available - from Google AI Studio
  const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || (settings?.aiProvider === 'gemini' ? settings?.aiApiKey : null);
  if (geminiKey) {
    configs.push({
      provider: 'gemini',
      apiKey: geminiKey,
    });
  }

  return configs;
}

/**
 * Get model name based on provider
 */
function getModelForProvider(provider: AIProvider, customModel?: string): string {
  if (customModel) {
    return customModel;
  }

  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    case 'groq':
      return 'llama-3.3-70b-versatile';
    case 'together':
      return 'meta-llama/Llama-3-70b-chat-hf';
    case 'gemini':
      return 'gemini-2.0-flash';
    default:
      return 'gpt-4o-mini';
  }
}

/**
 * Create chat completion for Google Gemini API
 */
async function createGeminiCompletion(
  config: AIConfig,
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const model = getModelForProvider('gemini', options.model);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

  const systemMsg = options.messages.find((m) => m.role === 'system');
  const conversation = options.messages.filter((m) => m.role !== 'system');
  const contents = conversation.length
    ? conversation.map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content }],
      }))
    : [{ parts: [{ text: systemMsg?.content || 'Respond.' }] }];

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.max_tokens ?? 2000,
    },
  };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const content =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

  return { content, provider: 'gemini', model };
}

/**
 * Create chat completion using OpenAI-compatible API (OpenAI, Groq, Together)
 */
async function createOpenAICompatibleCompletion(
  config: AIConfig,
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const { OpenAI } = await import('openai');
  const clientConfig: any = { apiKey: config.apiKey };
  if (config.baseURL) clientConfig.baseURL = config.baseURL;

  const openai = new OpenAI(clientConfig);
  const model = getModelForProvider(config.provider, options.model);
  const response = await openai.chat.completions.create({
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.max_tokens ?? 2000,
  });

  const content = response.choices[0]?.message?.content || '';
  return { content, provider: config.provider, model };
}

/**
 * Create chat completion (routes to correct provider)
 */
async function createChatCompletion(
  config: AIConfig,
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  if (config.provider === 'gemini') {
    return createGeminiCompletion(config, options);
  }
  return createOpenAICompatibleCompletion(config, options);
}

/**
 * Create chat completion with automatic fallback
 */
export async function createChatCompletionWithFallback(
  options: ChatCompletionOptions,
  preferredProvider?: AIProvider
): Promise<ChatCompletionResult> {
  const allConfigs = await getAllAIConfigs();
  
  if (allConfigs.length === 0) {
    throw new Error('No AI providers configured. Please set up at least one AI provider in environment variables or Admin Settings.');
  }

  // Sort configs: preferred provider first, then by priority (OpenAI > Groq > Together)
  const sortedConfigs = [...allConfigs].sort((a, b) => {
    if (preferredProvider) {
      if (a.provider === preferredProvider) return -1;
      if (b.provider === preferredProvider) return 1;
    }
    
    const priority: Record<AIProvider, number> = {
      openai: 1,
      gemini: 2,
      groq: 3,
      together: 4,
    };
    return priority[a.provider] - priority[b.provider];
  });

  const errors: AIError[] = [];

  // Try each provider in order
  for (const config of sortedConfigs) {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await createChatCompletion(config, options);
        return result;
      } catch (error: any) {
        attempts++;
        const statusCode = error?.status || error?.response?.status || error?.statusCode;
        const isQuotaError = statusCode === 429 || error?.message?.includes('quota') || error?.message?.includes('billing');
        const isAuthError = statusCode === 401 || statusCode === 403;
        
        // Final attempt failed or fatal auth error
        if (attempts === maxAttempts || isAuthError) {
          errors.push({
            provider: config.provider,
            error: error instanceof Error ? error : new Error(String(error)),
            statusCode,
          });
          break; // Move to next provider
        }

        // Exponential backoff before retry (e.g., 500ms, 1000ms)
        const backoffMs = Math.pow(2, attempts) * 250;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  // All providers failed
  const errorMessages = errors.map(e => `${e.provider} (${e.statusCode || 'unknown'}): ${e.error.message}`).join('; ');
  throw new Error(`All AI providers failed. Errors: ${errorMessages}`);
}

/**
 * Check if AI is available
 */
export async function isAIAvailable(): Promise<boolean> {
  const configs = await getAllAIConfigs();
  return configs.length > 0;
}

/**
 * Get user-friendly error message
 */
export function getAIErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('quota') || message.includes('billing') || message.includes('429')) {
      return 'AI service is temporarily unavailable due to quota limits. The system will automatically try alternative providers. Please try again in a moment.';
    }
    
    if (message.includes('401') || message.includes('403') || message.includes('invalid api key')) {
      return 'AI service configuration error. Please check your API keys in Admin Settings > AI Settings.';
    }
    
    if (message.includes('no ai providers')) {
      return 'AI features are not configured. Please set up at least one AI provider (OpenAI, Gemini, Groq, or Together AI) in Admin Settings or environment variables.';
    }
    
    if (message.includes('all ai providers failed')) {
      return 'All AI services are currently unavailable. Please try again later or contact support.';
    }
  }
  
  return 'An unexpected error occurred with the AI service. Please try again or contact support.';
}

