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
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-white tracking-tight mb-6">
          <UIDictionaryText 
            dictKey="opportunitiesSection.title" 
            fallback={locale === 'tj' ? 'Имкониятҳои охирин' : locale === 'ru' ? 'Последние возможности' : 'Latest Opportunities'} 
          />
        </h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          {t('subtitle')}
        </p>
      </div>

      {/* Smart Filter */}
      <SmartFilter onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-gold/20 blur-xl rounded-full" />
            <Loader2 className="relative z-10 w-12 h-12 text-brand-gold animate-spin" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-2xl mx-auto">
          <p className="text-red-500 font-medium text-lg">{error}</p>
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

