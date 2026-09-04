'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import SmartFilter from '@/components/opportunities/SmartFilter';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import { Loader2 } from 'lucide-react';
import UIDictionaryText from '@/components/common/UIDictionaryText';

type Opportunity = {
  id: string;
  title: string;
  titleRu?: string | null;
  titleTj?: string | null;
  description: string;
  descriptionRu?: string | null;
  descriptionTj?: string | null;
  level: 'SCHOOL' | 'BACHELOR' | 'MASTER' | 'PHD';
  category: 'SCHOLARSHIP' | 'FORUM' | 'SUMMER_SCHOOL' | 'CONFERENCE';
  fundingType: 'FULL' | 'PARTIAL' | 'NONE';
  country: string;
  deadline: string;
  isVerified: boolean;
  imageUrl?: string | null;
};

export default function OpportunitiesSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    level: '',
    country: '',
    fundingType: '',
    category: '',
  });

  // Fetch opportunities from API
  const fetchOpportunities = async (filterParams: typeof filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterParams.level) params.append('level', filterParams.level);
      if (filterParams.category) params.append('category', filterParams.category);
      if (filterParams.fundingType) params.append('fundingType', filterParams.fundingType);
      if (filterParams.country) params.append('country', filterParams.country);
      params.append('limit', '6'); // Show 6 on homepage

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setOpportunities(result.data);
      } else {
        setError(result.error || 'Failed to load opportunities');
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load opportunities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOpportunities(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchOpportunities(newFilters);
  };

  // Get localized title and description
  const getLocalizedContent = (opp: Opportunity) => {
    if (locale === 'ru' && opp.titleRu) {
      return {
        title: opp.titleRu,
        description: opp.descriptionRu || opp.description,
      };
    }
    if (locale === 'tj' && opp.titleTj) {
      return {
        title: opp.titleTj,
        description: opp.descriptionTj || opp.description,
      };
    }
    return {
      title: opp.title,
      description: opp.description,
    };
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-navy mb-4">
          <UIDictionaryText 
            dictKey="opportunitiesSection.title" 
            fallback={locale === 'tj' ? 'Имкониятҳои охирин' : locale === 'ru' ? 'Последние возможности' : 'Latest Opportunities'} 
          />
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Smart Filter */}
      <SmartFilter onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      )}

      {/* Opportunities Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => {
              const localized = getLocalizedContent(opportunity);
              return (
                <OpportunityCard
                  key={opportunity.id}
                  id={opportunity.id}
                  title={localized.title}
                  description={localized.description}
                  level={opportunity.level}
                  category={opportunity.category}
                  fundingType={opportunity.fundingType}
                  country={opportunity.country}
                  deadline={new Date(opportunity.deadline)}
                  isVerified={opportunity.isVerified}
                  imageUrl={opportunity.imageUrl || undefined}
                />
              );
            })}
          </div>

          {opportunities.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {t('noOpportunities', { default: 'No opportunities found matching your filters.' })}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

