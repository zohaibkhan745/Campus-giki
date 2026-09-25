import { getSocietyLogo } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  FilterX,
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import { SocietyCardSkeleton } from '@/components/societies/SocietyCardSkeleton';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { useDebounce } from '@/hooks/useDebounce';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { OrganizationType } from '@/types/society.types';

export const SocietyDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<OrganizationType | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Query predefined categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
    placeholderData: keepPreviousData,
  });

  // Query paginated public societies
  const {
    data: directoryData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['publicSocieties', page, selectedCategory, selectedType, debouncedSearch],
    queryFn: () =>
      societyService.getPublicSocieties({
        page,
        limit: 100,
        category: selectedCategory || undefined,
        type: selectedType || undefined,
        search: debouncedSearch || undefined,
      }),
    placeholderData: keepPreviousData,
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

  return (
    <div className="w-full max-w-full px-6 sm:px-10 mx-auto space-y-8 text-left py-6">
      {/* Header Banner */}
      <div className="space-y-3">
        <h1 className="font-extrabold text-4xl sm:text-5xl text-text-primary tracking-tight leading-tight">
          Explore Campus GIKI Societies
        </h1>
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
          Discover student societies, competition project teams, and special interest clubs active at GIKI.
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        {/* Primary Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface-glass backdrop-blur-md border border-border-subtle rounded-2xl w-full md:w-auto shadow-elevation-1">
          <button
            onClick={() => handleTypeChange('')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              selectedType === ''
                ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            All Societies
          </button>

          <button
            onClick={() => handleTypeChange('SOCIETY')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              selectedType === 'SOCIETY'
                ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Societies
          </button>

          <button
            onClick={() => handleTypeChange('CLUB')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              selectedType === 'CLUB'
                ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Clubs
          </button>

          <button
            onClick={() => handleTypeChange('TEAM')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              selectedType === 'TEAM'
                ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Teams
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:flex-1 flex items-center">
          <div className="absolute left-4 text-text-muted pointer-events-none flex items-center justify-center z-10">
            <Search className="w-5 h-5 text-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search by organization name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-surface-glass backdrop-blur-md text-text-primary placeholder:text-text-muted text-sm rounded-2xl border border-border-subtle px-4 py-3 pl-12 transition-all outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-strong shadow-elevation-1"
          />
        </div>

        {/* Category Dropdown Filter */}
        <div className="w-full md:w-auto shrink-0 flex items-center">
          <CustomDropdown
            value={selectedCategory}
            onChange={(e: any) => handleCategoryChange(e.target.value)}
            placeholder="All Domains"
            options={[
              { value: '', label: 'All Domains' },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
            className="w-full md:w-[190px]"
          />
        </div>
      </div>

      {(selectedCategory || selectedType || searchQuery) && (
        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-text-secondary bg-surface-glass rounded-xl border border-border-subtle hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors focus:outline-none shadow-sm cursor-pointer"
          >
            <FilterX className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Directory Content Views */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SocietyCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          secondaryAction={{
            label: 'Upcoming Events',
            to: '/upcoming-events',
          }}
        />
      ) : societies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Societies Found"
          description={
            selectedCategory || selectedType || searchQuery
              ? "We couldn't find any active student societies, clubs, or teams matching your selected filters."
              : 'There are currently no student societies listed in the directory.'
          }
          onClearFilters={
            selectedCategory || selectedType || searchQuery
              ? handleClearFilters
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {societies.map((society) => (
            <div
              key={society.id}
              onClick={() => navigate(`/societies/${society.id}`)}
              className="relative group cursor-pointer h-full"
            >
              {/* Subtle ambient hover glow */}
              <div className="absolute -inset-0.5 bg-brand-primary/15 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>

              {/* Main Card Container */}
              <div className="relative h-full flex flex-col bg-surface-card rounded-3xl shadow-card group-hover:shadow-card-hover overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 border border-border-subtle group-hover:border-border-medium">
                <div className="relative overflow-hidden group/img image-container">
                  <img
                    src={getSocietyLogo(society.logoUrl)}
                    alt={society.name}
                    className="w-full aspect-square object-cover transition-transform duration-500 ease-out group-hover/img:scale-[1.03]"
                    onError={(e) => {
                      e.currentTarget.src = '/default-society.jpg';
                    }}
                  />

                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                  <div className="absolute top-5 left-5 pr-14 max-w-full">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight line-clamp-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {society.name}
                    </h2>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between bg-surface-card flex-1 gap-3 border-t border-border-subtle">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden transition-transform duration-300 hover:scale-105 ring-2 ring-border-subtle flex-shrink-0 bg-surface-elevated flex items-center justify-center">
                      <img
                        src={getSocietyLogo(society.logoUrl)}
                        alt={`${society.name} avatar`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/default-society.jpg';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-text-secondary truncate">
                        @{society.name.toLowerCase().replace(/[^a-z0-9]/g, '')}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 text-right shrink-0">
                    <div className="text-lg font-bold leading-none text-text-primary">
                      {(() => {
                        try {
                          const s = society as any;
                          return (
                            (s.executiveCouncil ? JSON.parse(s.executiveCouncil).length : 0) +
                            (s.presidentName ? 1 : 0)
                          );
                        } catch {
                          return 1;
                        }
                      })()}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-text-muted mt-0.5">
                      EC Members
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
