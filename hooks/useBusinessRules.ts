'use client';

import { useState, useEffect } from 'react';
import {
  getBusinessRulesClient,
  getCachedBusinessRules,
  hasCachedBusinessRules,
  type BusinessRulesClient,
} from '@/lib/business-rules-client';

/**
 * Shared hook for business rules - fetches once, caches, and shares across all components.
 * Reduces excessive /api/business-rules calls.
 */
export function useBusinessRules() {
  const [data, setData] = useState<BusinessRulesClient>(getCachedBusinessRules);
  const [loading, setLoading] = useState(!hasCachedBusinessRules());

  useEffect(() => {
    getBusinessRulesClient().then((rules) => {
      setData(rules);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
