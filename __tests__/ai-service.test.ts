import { describe, it, expect } from 'vitest';
import { getAIErrorMessage } from '@/lib/ai-service';

describe('AI Service Error Formatting', () => {
  it('identifies quota errors and alerts for alternative providers', () => {
    const error = new Error('429 Too Many Requests: quota exceeded');
    const msg = getAIErrorMessage(error);
    expect(msg).toContain('quota limits');
    expect(msg).toContain('alternative providers');
  });

  it('identifies auth configuration errors explicitly', () => {
    const error = new Error('401 Unauthorized: invalid api key');
    const msg = getAIErrorMessage(error);
    expect(msg).toContain('configuration error');
  });

  it('handles generic unknown errors gracefully', () => {
    const error = new Error('Something weird happened from unknown provider');
    const msg = getAIErrorMessage(error);
    expect(msg).toContain('unexpected error');
  });
});
