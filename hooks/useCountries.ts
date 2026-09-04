/**
 * Custom hook for fetching countries from the database
 * Uses SWR-like pattern with caching
 */

import { useState, useEffect } from 'react';

export interface Country {
  name: string;
  nameRu?: string | null;
  nameTj?: string | null;
  code?: string;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try opportunities/countries first (countries from active programs)
        const response = await fetch('/api/opportunities/countries');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCountries(result.data);
        } else {
          // Fallback to data-dictionary/countries
          const fallbackResponse = await fetch('/api/data-dictionary/countries');
          const fallbackResult = await fallbackResponse.json();
          
          if (fallbackResult.success && fallbackResult.data) {
            setCountries(fallbackResult.data);
          } else {
            throw new Error('Failed to fetch countries');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
        // Set empty array on error
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
}

