/**
 * Business Rules Utility
 * Fetches business rules from database with caching and fallback defaults
 */

import { prisma } from './prisma';

interface BusinessRules {
  urgentBadgeThresholdDays: number;
  paginationLimits: {
    opportunities: number;
    admin: number;
    events: number;
    achievements: number;
  };
  rateLimitRequests: number;
  rateLimitWindowSeconds: number;
  passwordResetLinkExpiryHours: number;
  otpExpiryMinutes: number;
  topDeadlinesLimit: number;
  featuredOpportunitiesLimit: number;
}

const DEFAULT_RULES: BusinessRules = {
  urgentBadgeThresholdDays: 7,
  paginationLimits: {
    opportunities: 12,
    admin: 20,
    events: 10,
    achievements: 12,
  },
  rateLimitRequests: 5,
  rateLimitWindowSeconds: 60,
  passwordResetLinkExpiryHours: 1,
  otpExpiryMinutes: 10,
  topDeadlinesLimit: 3,
  featuredOpportunitiesLimit: 6,
};

// Cache for business rules (refresh every 5 minutes)
let cachedRules: BusinessRules | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get business rules from database with caching
 */
export async function getBusinessRules(): Promise<BusinessRules> {
  const now = Date.now();
  
  // Return cached rules if still valid
  if (cachedRules && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedRules;
  }

  try {
    const rules = await prisma.businessRules.findUnique({
      where: { id: 'global' },
    });

    if (rules) {
      // Parse pagination limits JSON
      const paginationLimits = typeof rules.paginationLimits === 'string'
        ? JSON.parse(rules.paginationLimits as string)
        : rules.paginationLimits as any;

      const parsedRules: BusinessRules = {
        urgentBadgeThresholdDays: rules.urgentBadgeThresholdDays,
        paginationLimits: {
          opportunities: paginationLimits?.opportunities || DEFAULT_RULES.paginationLimits.opportunities,
          admin: paginationLimits?.admin || DEFAULT_RULES.paginationLimits.admin,
          events: paginationLimits?.events || DEFAULT_RULES.paginationLimits.events,
          achievements: paginationLimits?.achievements || DEFAULT_RULES.paginationLimits.achievements,
        },
        rateLimitRequests: rules.rateLimitRequests,
        rateLimitWindowSeconds: rules.rateLimitWindowSeconds,
        passwordResetLinkExpiryHours: rules.passwordResetLinkExpiryHours,
        otpExpiryMinutes: rules.otpExpiryMinutes,
        topDeadlinesLimit: rules.topDeadlinesLimit,
        featuredOpportunitiesLimit: rules.featuredOpportunitiesLimit,
      };

      // Cache the rules
      cachedRules = parsedRules;
      cacheTimestamp = now;
      
      return parsedRules;
    }

    // No rules in DB, create default
    await prisma.businessRules.create({
      data: {
        id: 'global',
        ...DEFAULT_RULES,
        paginationLimits: DEFAULT_RULES.paginationLimits,
      },
    });

    cachedRules = DEFAULT_RULES;
    cacheTimestamp = now;
    return DEFAULT_RULES;
  } catch (error) {
    console.error('Error fetching business rules:', error);
    // Return defaults on error
    return DEFAULT_RULES;
  }
}

/**
 * Clear business rules cache (call after updating rules)
 */
export function clearBusinessRulesCache() {
  cachedRules = null;
  cacheTimestamp = 0;
}

/**
 * Get urgent badge threshold (days)
 */
export async function getUrgentBadgeThreshold(): Promise<number> {
  const rules = await getBusinessRules();
  return rules.urgentBadgeThresholdDays;
}

/**
 * Get pagination limit for a specific page type
 */
export async function getPaginationLimit(pageType: 'opportunities' | 'admin' | 'events' | 'achievements'): Promise<number> {
  const rules = await getBusinessRules();
  return rules.paginationLimits[pageType];
}

/**
 * Get rate limit configuration
 */
export async function getRateLimitConfig(): Promise<{ maxRequests: number; windowMs: number }> {
  const rules = await getBusinessRules();
  return {
    maxRequests: rules.rateLimitRequests,
    windowMs: rules.rateLimitWindowSeconds * 1000,
  };
}

