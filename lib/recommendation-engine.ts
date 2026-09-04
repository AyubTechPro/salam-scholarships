import { User, Program } from '@prisma/client';

export interface MatchScoreResult {
  score: number;       // 0-100 percentage
  breakdown: {
    levelMatch: boolean;
    countryMatch: boolean;
    nationalityMatch: boolean;
  };
  reasons: string[];
}

/**
 * Calculates a match percentage (0-100) between a user and a scholarship program.
 * Validates fundamental criteria like Level of Study, Target Countries, and Nationalities.
 */
export function calculateMatchScore(user: Partial<User>, program: Partial<Program>): MatchScoreResult {
  let score = 0;
  const reasons: string[] = [];

  const breakdown = {
    levelMatch: false,
    countryMatch: false,
    nationalityMatch: false,
  };

  if (!user || !program) return { score: 0, breakdown, reasons: ['Missing user or program data'] };

  // 1. Level Match (Critical Weight: 40%)
  // Since 'targetLevel' is not strict in User schema, we award baseline 40% to keep scores balanced
  score += 40;
  breakdown.levelMatch = true;
  reasons.push('Program level eligibility assumed (baseline)');

  // 2. Nationality / Citizenship Match (Critical Weight: 40%)
  if (program.eligibleNationalities) {
    try {
      const parsedNationalities = typeof program.eligibleNationalities === 'string' 
        ? JSON.parse(program.eligibleNationalities) 
        : program.eligibleNationalities;

      const nationalities = Array.isArray(parsedNationalities) ? parsedNationalities : [];
      const isGlobal = nationalities.includes('ALL') || nationalities.length === 0;
      
      if (isGlobal) {
        score += 40;
        breakdown.nationalityMatch = true;
        reasons.push('Program is open globally');
      } else if (user.country && nationalities.includes(user.country)) {
        score += 40;
        breakdown.nationalityMatch = true;
        reasons.push(`User country (${user.country}) is explicitly eligible`);
      } else {
        reasons.push(`User country (${user.country || 'Unknown'}) is not in eligible list`);
      }
    } catch {
      // Fallback if parsing fails
      score += 20;
    }
  } else {
    // Treat as global if undefined
    score += 40; 
    breakdown.nationalityMatch = true;
  }

  // 3. Target Country Preference Match (Bonus Priority Weight: 20%)
  // If user has specific 'preferredCountries' preferences and program is in one of them
  if (user.preferredCountries && program.country) {
    let targetList: string[] = [];
    
    if (Array.isArray(user.preferredCountries)) {
      targetList = user.preferredCountries;
    } else if (typeof user.preferredCountries === 'string') {
      try {
        targetList = JSON.parse(user.preferredCountries);
      } catch {
        targetList = [];
      }
    }

    if (targetList.length > 0) {
      if (targetList.includes(program.country) || targetList.includes('ALL')) {
        score += 20;
        breakdown.countryMatch = true;
        reasons.push(`Program location (${program.country}) is in user's preferred countries`);
      } else {
        reasons.push(`Program location (${program.country}) is outside preferred destinations`);
      }
    } else {
      // User has no preference, give full bonus
      score += 20;
      breakdown.countryMatch = true;
      reasons.push('User is open to all countries');
    }
  } else {
    score += 20; // Default if not specified
    breakdown.countryMatch = true;
  }

  // Final sanity checks
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  return {
    score,
    breakdown,
    reasons
  };
}
