import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  Building2,
  Search,
  FilterX,
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import { SocietyCard } from '@/components/societies/SocietyCard';
import { SocietyCardSkeleton } from '@/components/societies/SocietyCardSkeleton';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { useDebounce } from '@/hooks/useDebounce';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { OrganizationType } from '@/types/society.types';

export const SocietyDirectoryPage: React.FC = () => {
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

      {/* Directory Content Views (Consistently 4 columns on desktop) */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SocietyCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          secondaryAction={{
            label: 'Campus Events',
            to: '/events',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {societies.map((society) => (
            <SocietyCard key={society.id} society={society} />
          ))}
        </div>
      )}
    </div>
  );
};
