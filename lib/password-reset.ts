/**
 * Password Reset Token Storage
 * In production, use Redis or database
 */

interface ResetTokenData {
  userId: string;
  expiresAt: number;
}

const resetTokens = new Map<string, ResetTokenData>();

// Cleanup expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expiresAt) {
      resetTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);

export function storeResetToken(token: string, userId: string, expiresInMs: number = 60 * 60 * 1000): void {
  resetTokens.set(token, {
    userId,
    expiresAt: Date.now() + expiresInMs,
  });
}

export function getResetToken(token: string): ResetTokenData | null {
  const data = resetTokens.get(token);
  if (!data || Date.now() > data.expiresAt) {
    resetTokens.delete(token);
    return null;
  }
  return data;
}

export function deleteResetToken(token: string): void {
  resetTokens.delete(token);
}

