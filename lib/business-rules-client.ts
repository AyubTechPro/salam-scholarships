/**
 * Client-side business rules cache
 * Single fetch shared across all components to reduce /api/business-rules calls
 */

export interface BusinessRulesClient {
  urgentBadgeThresholdDays: number;
  paginationLimits: {
    opportunities: number;
    admin: number;
    events: number;
    achievements: number;
  };
  topDeadlinesLimit: number;
  featuredOpportunitiesLimit: number;
}

const DEFAULT_RULES: BusinessRulesClient = {
  urgentBadgeThresholdDays: 7,
  paginationLimits: {
    opportunities: 12,
    admin: 20,
    events: 10,
    achievements: 10,
  },
  topDeadlinesLimit: 5,
  featuredOpportunitiesLimit: 6,
};

let cache: BusinessRulesClient | null = null;
let fetchPromise: Promise<BusinessRulesClient> | null = null;

export async function getBusinessRulesClient(): Promise<BusinessRulesClient> {
  if (cache) return cache;
  if (!fetchPromise) {
    fetchPromise = fetch('/api/business-rules')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          cache = {
            urgentBadgeThresholdDays: data.data.urgentBadgeThresholdDays ?? DEFAULT_RULES.urgentBadgeThresholdDays,
            paginationLimits: data.data.paginationLimits ?? DEFAULT_RULES.paginationLimits,
            topDeadlinesLimit: data.data.topDeadlinesLimit ?? DEFAULT_RULES.topDeadlinesLimit,
            featuredOpportunitiesLimit: data.data.featuredOpportunitiesLimit ?? DEFAULT_RULES.featuredOpportunitiesLimit,
          };
          return cache!;
        }
        cache = DEFAULT_RULES;
        return cache;
      })
      .catch(() => {
        cache = DEFAULT_RULES;
        return cache;
      });
  }
  return fetchPromise;
}

/** Sync getter - returns cached value or default. Use after initial fetch. */
export function getCachedBusinessRules(): BusinessRulesClient {
  return cache ?? DEFAULT_RULES;
}

/** Check if we have a cached (fetched) value */
export function hasCachedBusinessRules(): boolean {
  return cache !== null;
}
