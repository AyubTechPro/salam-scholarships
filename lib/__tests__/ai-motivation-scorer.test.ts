/**
 * AI Motivation Scorer Tests
 * Tests for the AI motivation letter scoring functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scoreMotivationLetter } from '../ai-motivation-scorer';

// Mock Prisma
vi.mock('../prisma', () => ({
  prisma: {
    siteSettings: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock OpenAI
const mockOpenAIResponse = vi.fn();

// Create a mock class that can be instantiated
class MockOpenAI {
  constructor(config: any) {}
  chat = {
    completions: {
      create: mockOpenAIResponse,
    },
  };
}

vi.mock('openai', async () => {
  return {
    OpenAI: MockOpenAI,
  };
});

describe('AI Motivation Scorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a valid score object when AI is enabled and configured', async () => {
    const { prisma } = await import('../prisma');
    
    // Mock site settings
    (prisma.siteSettings.findUnique as any).mockResolvedValue({
      aiEnabled: true,
      aiProvider: 'openai',
      aiApiKey: 'test-api-key',
    });

    // Mock OpenAI response with valid JSON
    mockOpenAIResponse.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              clarity: 85,
              relevance: 90,
              grammar: 80,
              overall: 'Well-written letter with clear goals and strong relevance.',
            }),
          },
        },
      ],
    });

    const motivationLetter = 'This is a well-written motivation letter that demonstrates clear goals, relevant experience, and strong grammar. I am passionate about this program because it aligns with my career objectives and will help me achieve my dreams.';

    const result = await scoreMotivationLetter(motivationLetter);

    expect(result).toHaveProperty('score');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result).toHaveProperty('feedback');
    expect(result.feedback).toHaveProperty('clarity');
    expect(result.feedback).toHaveProperty('relevance');
    expect(result.feedback).toHaveProperty('grammar');
    expect(result.feedback).toHaveProperty('overall');
  });

  it('should return neutral score when AI is not enabled', async () => {
    const { prisma } = await import('../prisma');
    
    (prisma.siteSettings.findUnique as any).mockResolvedValue({
      aiEnabled: false,
      aiProvider: 'openai',
      aiApiKey: 'test-api-key',
    });

    const result = await scoreMotivationLetter('Test letter');
    
    expect(result.score).toBe(50); // Neutral score
    expect(result.feedback.overall).toContain('not enabled');
  });

  it('should return neutral score when AI provider is not OpenAI', async () => {
    const { prisma } = await import('../prisma');
    
    (prisma.siteSettings.findUnique as any).mockResolvedValue({
      aiEnabled: true,
      aiProvider: 'anthropic',
      aiApiKey: 'test-api-key',
    });

    const result = await scoreMotivationLetter('Test letter');
    
    expect(result.score).toBe(50); // Neutral score
  });

  it('should return neutral score when API key is missing', async () => {
    const { prisma } = await import('../prisma');
    
    (prisma.siteSettings.findUnique as any).mockResolvedValue({
      aiEnabled: true,
      aiProvider: 'openai',
      aiApiKey: null,
    });

    const result = await scoreMotivationLetter('Test letter');
    
    expect(result.score).toBe(50); // Neutral score
  });

  it('should handle invalid AI responses gracefully', async () => {
    const { prisma } = await import('../prisma');
    
    (prisma.siteSettings.findUnique as any).mockResolvedValue({
      aiEnabled: true,
      aiProvider: 'openai',
      aiApiKey: 'test-api-key',
    });

    // Mock OpenAI to return invalid response
    mockOpenAIResponse.mockResolvedValue({
      choices: [
        {
          message: {
            content: 'invalid json response',
          },
        },
      ],
    });

    const result = await scoreMotivationLetter('Test letter');
    
    // Should return fallback score (50) for invalid responses
    expect(result.score).toBe(50);
    expect(result.error).toBeDefined();
  });
});
