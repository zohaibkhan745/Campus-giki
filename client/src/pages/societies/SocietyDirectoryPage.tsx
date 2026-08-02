import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Tag,
  ArrowRight,
  FilterX,
  Sparkles,
  Users,
  Rocket,
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import { SocietyCardSkeleton } from '@/components/societies/SocietyCardSkeleton';
import { Alert } from '@/components/ui/Alert';
import type { OrganizationType } from '@/types/society.types';

export const SocietyDirectoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<OrganizationType | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Query predefined categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

  // Query paginated public societies
  const {
    data: directoryData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['publicSocieties', page, selectedCategory, selectedType, searchQuery],
    queryFn: () =>
      societyService.getPublicSocieties({
        page,
        limit: 100,
        category: selectedCategory || undefined,
        type: selectedType || undefined,
        search: searchQuery || undefined,
      }),
  });

  const societies = directoryData?.items || [];

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
  };

  const handleTypeChange = (val: OrganizationType | '') => {
    setSelectedType(val);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedType('');
    setSearchQuery('');
    setPage(1);
  };

  const renderTypeBadge = (type?: OrganizationType) => {
    switch (type) {
      case 'CLUB':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-300 rounded-full text-xs font-bold uppercase tracking-wider shrink-0">
            🎨 Club
          </span>
        );
      case 'TEAM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider shrink-0">
            🚀 Team
          </span>
        );
      case 'SOCIETY':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 border border-blue-300 rounded-full text-xs font-bold uppercase tracking-wider shrink-0">
            🏛️ Society
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left py-8">
      {/* Header Banner */}
      <div className="space-y-4">
        <h1 className="font-eb-garamond text-heading-lg text-vast-ink leading-tight">
          Explore Campus GIKI Communities
        </h1>
        <p className="text-body text-vast-ink/80 max-w-2xl">
          Discover student societies, competition project teams, and special interest clubs active at GIKI.
        </p>
      </div>

      {/* Primary Type Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-lumen-cream border border-vast-ink/20 rounded-cards w-fit">
        <button
          onClick={() => handleTypeChange('')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-inputs transition-all ${
            selectedType === ''
              ? 'bg-vast-ink text-pure-white shadow-sm'
              : 'text-vast-ink hover:bg-lumen-stone'
          }`}
        >
          All Communities
        </button>

        <button
          onClick={() => handleTypeChange('SOCIETY')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-inputs transition-all ${
            selectedType === 'SOCIETY'
              ? 'bg-vast-ink text-pure-white shadow-sm'
              : 'text-vast-ink hover:bg-lumen-stone'
          }`}
        >
          Societies
        </button>

        <button
          onClick={() => handleTypeChange('CLUB')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-inputs transition-all ${
            selectedType === 'CLUB'
              ? 'bg-vast-ink text-pure-white shadow-sm'
              : 'text-vast-ink hover:bg-lumen-stone'
          }`}
        >
          Clubs
        </button>

        <button
          onClick={() => handleTypeChange('TEAM')}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-inputs transition-all ${
            selectedType === 'TEAM'
              ? 'bg-vast-ink text-pure-white shadow-sm'
              : 'text-vast-ink hover:bg-lumen-stone'
          }`}
        >
          Teams
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col space-y-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96 flex items-center">
          <div className="absolute left-4 text-vast-ink pointer-events-none flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by organization name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-transparent text-vast-ink placeholder:text-fog text-body-sm rounded-inputs border border-vast-ink/20 px-4 py-3 pl-12 transition-all outline-none focus:ring-2 focus:ring-vast-ink focus:ring-offset-2 focus:ring-offset-lumen-cream"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-badges border transition-all focus:outline-none ${
              selectedCategory === ''
                ? 'bg-vast-ink text-pure-white border-vast-ink shadow-sm'
                : 'bg-transparent text-vast-ink border-vast-ink/20 hover:bg-lumen-stone'
            }`}
          >
            All Domains
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-badges border transition-all focus:outline-none ${
                selectedCategory === cat.slug
                  ? 'bg-vast-ink text-pure-white border-vast-ink shadow-sm'
                  : 'bg-transparent text-vast-ink border-vast-ink/20 hover:bg-lumen-stone'
              }`}
            >
              {cat.name}
            </button>
          ))}

          {(selectedCategory || selectedType || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-vast-ink bg-transparent rounded-buttons border border-vast-ink/20 hover:bg-ember-glow hover:text-white transition-colors focus:outline-none"
              title="Clear all filters"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Callout */}
      {isError && (
        <div className="space-y-3">
          <Alert variant="error" message="Failed to load society directory. Please try again." />
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-vast-ink underline hover:no-underline focus:outline-none"
          >
            Retry Loading Directory
          </button>
        </div>
      )}

      {/* Directory Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SocietyCardSkeleton key={i} />
          ))}
        </div>
      ) : societies.length === 0 ? (
        <div className="p-12 rounded-cards border border-vast-ink/20 bg-transparent text-center space-y-4">
          <Building2 className="w-16 h-16 text-vast-ink/50 mx-auto" />
          <h3 className="font-eb-garamond text-heading-sm text-vast-ink">No Communities Found</h3>
          <p className="text-body-sm text-vast-ink max-w-sm mx-auto">
            We couldn't find any active communities matching your selected filters.
          </p>
          {(selectedCategory || selectedType || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-lavender-whisper text-vast-ink border border-vast-ink/20 rounded-buttons text-sm font-bold hover:bg-lumen-stone transition-colors mt-4"
            >
              Clear Search Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {societies.map((society) => (
            <Link
              key={society.id}
              to={`/societies/${society.id}`}
              className="flex flex-col h-full bg-lumen-cream border border-vast-ink/20 rounded-cards p-6 transition-all hover:border-vast-ink hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-vast-ink focus-visible:ring-offset-4 focus-visible:ring-offset-lumen-cream group"
              aria-label={`View profile for ${society.name}`}
            >
              <div className="space-y-4 flex-1">
                <div className="flex items-start justify-between gap-3">
                  {society.logoUrl ? (
                    <img
                      src={society.logoUrl}
                      alt={society.name}
                      className="w-14 h-14 rounded-buttons object-cover border border-vast-ink/20 shrink-0 bg-lumen-stone"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-lavender-whisper border border-vast-ink/20 rounded-buttons flex items-center justify-center text-vast-ink shrink-0">
                      <Building2 className="w-7 h-7" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-eb-garamond text-heading-sm text-vast-ink leading-tight mb-2 group-hover:underline decoration-2 underline-offset-4">
                    {society.name}
                  </h3>
                  <p className="text-body-sm text-vast-ink/80 line-clamp-3 leading-relaxed">
                    {society.shortDescription || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-vast-ink/20">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-vast-ink group-hover:text-ember-glow transition-colors">
                  <span>View Organization Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
