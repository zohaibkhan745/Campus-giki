import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FilterX,
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import { SocietyCardSkeleton } from '@/components/societies/SocietyCardSkeleton';
import { Alert } from '@/components/ui/Alert';

export const SocietyDirectoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
    queryKey: ['publicSocieties', page, selectedCategory, searchQuery],
    queryFn: () =>
      societyService.getPublicSocieties({
        page,
        limit: 9,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      }),
  });

  const societies = directoryData?.items || [];
  const meta = directoryData?.meta;

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 text-left py-8">
      {/* Header Banner */}
      <div className="space-y-4">
        <h1 className="font-eb-garamond text-heading-lg text-vast-ink leading-tight">
          Explore Campus GIKI Societies
        </h1>
        <p className="text-body text-vast-ink/80 max-w-2xl">
          Discover student chapters, tech clubs, sports, and cultural societies active at GIKI.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col space-y-6">
        {/* Search Input */}
        <div className="relative w-full md:w-96 flex items-center">
          <div className="absolute left-4 text-vast-ink pointer-events-none flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search societies by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-lumen-cream text-vast-ink placeholder:text-fog text-body-sm rounded-inputs border-2 border-vast-ink px-4 py-3 pl-12 transition-all outline-none focus:ring-2 focus:ring-vast-ink focus:ring-offset-2 focus:ring-offset-lumen-cream"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 text-sm font-semibold rounded-badges border-2 border-vast-ink transition-colors focus:outline-none ${
              selectedCategory === ''
                ? 'bg-forest-ink text-lumen-cream'
                : 'bg-lumen-cream text-vast-ink hover:bg-lumen-stone'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 text-sm font-semibold rounded-badges border-2 border-vast-ink transition-colors focus:outline-none ${
                selectedCategory === cat.slug
                  ? 'bg-forest-ink text-lumen-cream'
                  : 'bg-lumen-cream text-vast-ink hover:bg-lumen-stone'
              }`}
            >
              {cat.name}
            </button>
          ))}

          {(selectedCategory || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-vast-ink bg-lumen-cream rounded-buttons border-2 border-vast-ink hover:bg-ember-glow transition-colors focus:outline-none"
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <FilterX className="w-4 h-4" />
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
        <div className="p-12 rounded-cards border-2 border-vast-ink bg-lumen-cream text-center space-y-4">
          <Building2 className="w-16 h-16 text-vast-ink/50 mx-auto" />
          <h3 className="font-eb-garamond text-heading-sm text-vast-ink">No Societies Found</h3>
          <p className="text-body-sm text-vast-ink max-w-sm mx-auto">
            We couldn't find any active societies matching your search or category filter.
          </p>
          {(selectedCategory || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-lavender-whisper text-vast-ink border-2 border-vast-ink rounded-buttons text-sm font-bold hover:bg-lumen-stone transition-colors mt-4"
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
              className="flex flex-col h-full bg-lumen-cream border-2 border-vast-ink rounded-cards p-8 transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-vast-ink focus-visible:ring-offset-4 focus-visible:ring-offset-lumen-cream group"
              aria-label={`View profile for ${society.name}`}
            >
              <div className="space-y-4 flex-1">
                <div className="flex items-start justify-between gap-4">
                  {society.logoUrl ? (
                    <img
                      src={society.logoUrl}
                      alt={society.name}
                      className="w-16 h-16 rounded-buttons object-cover border-2 border-vast-ink shrink-0 bg-lumen-stone"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-lavender-whisper border-2 border-vast-ink rounded-buttons flex items-center justify-center text-vast-ink shrink-0">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}
                  {society.category && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest-ink text-lumen-cream rounded-badges text-[13px] font-semibold tracking-wide shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                      {society.category.name}
                    </span>
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

              <div className="pt-6 mt-4">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-vast-ink group-hover:text-ember-glow transition-colors">
                  <span>View Society Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t-2 border-vast-ink/20 text-sm font-semibold text-vast-ink">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} societies)
          </span>

          <div className="flex items-center gap-3">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 bg-lumen-cream border-2 border-vast-ink rounded-buttons hover:bg-lumen-stone disabled:opacity-40 disabled:hover:bg-lumen-cream transition-colors focus:outline-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-lumen-cream border-2 border-vast-ink rounded-buttons hover:bg-lumen-stone disabled:opacity-40 disabled:hover:bg-lumen-cream transition-colors focus:outline-none"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
