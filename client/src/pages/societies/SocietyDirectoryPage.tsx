import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  FilterX,
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import { SocietyCardSkeleton } from '@/components/societies/SocietyCardSkeleton';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import type { OrganizationType } from '@/types/society.types';

export const SocietyDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left py-8">
      {/* Header Banner */}
      <div className="space-y-4">
        <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight">
          Explore Campus GIKI Societies
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          Discover student societies, competition project teams, and special interest clubs active at GIKI.
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        
        {/* Primary Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/[0.08] backdrop-blur-[20px] border border-white/20 rounded-[18px] w-full md:w-auto shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
          <button
            onClick={() => handleTypeChange('')}
            className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
              selectedType === ''
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            All Societies
          </button>

          <button
            onClick={() => handleTypeChange('SOCIETY')}
            className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
              selectedType === 'SOCIETY'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Societies
          </button>

          <button
            onClick={() => handleTypeChange('CLUB')}
            className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
              selectedType === 'CLUB'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Clubs
          </button>

          <button
            onClick={() => handleTypeChange('TEAM')}
            className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
              selectedType === 'TEAM'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Teams
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:flex-1 flex items-center">
          <div className="absolute left-4 text-gray-400 pointer-events-none flex items-center justify-center z-10">
            <Search className="w-5 h-5 text-white" />
          </div>
          <input
            type="text"
            placeholder="Search by organization name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-white/[0.08] backdrop-blur-[20px] text-white placeholder:text-gray-300 text-sm rounded-[18px] border border-white/20 px-4 py-[14px] pl-12 transition-all outline-none focus:ring-2 focus:ring-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
          />
        </div>

        {/* Category Dropdown Filter */}
        <div className="w-full md:w-auto shrink-0 flex items-center">
          <CustomDropdown value={selectedCategory} 
            onChange={(e: any) => handleCategoryChange(e.target.value)} 
            placeholder="All Domains" 
            options={[
              { value: '', label: 'All Domains' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
            className="w-full md:w-[180px]"
          />
        </div>
      </div>
      
      {(selectedCategory || selectedType || searchQuery) && (
        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-gray-300 bg-transparent rounded-lg border border-white/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-colors focus:outline-none shadow-sm"
          >
            <FilterX className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Error Callout */}
      {isError && (
        <div className="space-y-3">
          null /* Removed error alert */
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold text-white underline hover:no-underline focus:outline-none"
          >
            Retry Loading Directory
          </button>
        </div>
      )}

      {/* Directory Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SocietyCardSkeleton key={i} />
          ))}
        </div>
      ) : societies.length === 0 ? (
        <div className="p-12 rounded-[24px] border border-white/20 bg-white/[0.08] backdrop-blur-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-center space-y-4">
          <Building2 className="w-16 h-16 text-gray-500 mx-auto" />
          <h3 className="font-semibold text-2xl text-white">No Societies Found</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            We couldn't find any active communities matching your selected filters.
          </p>
          {(selectedCategory || selectedType || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-white/5 text-white border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors mt-4"
            >
              Clear Search Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {societies.map((society) => (
            <div
              key={society.id}
              onClick={() => navigate(`/societies/${society.id}`)}
              className="relative group cursor-pointer h-full"
            >
              {/* Ambient Dark Greenish Glow Layer */}
              <div className="absolute -inset-0.5 bg-white rounded-3xl blur-lg opacity-0 group-hover:opacity-90 transition-all duration-500 group-hover:duration-200"></div>
              
              {/* Main Card Container */}
              <div className="relative h-full flex flex-col bg-zinc-900 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.015] border border-zinc-800/80 group-hover:border-emerald-950/40">
                
                <div className="relative overflow-hidden group/img image-container">
                  {society.logoUrl ? (
                    <img 
                      src={society.logoUrl} 
                      alt={society.name} 
                      className="w-full aspect-square object-cover transition-transform duration-700 ease-out group-hover/img:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center transition-transform duration-700 ease-out group-hover/img:scale-[1.04] text-gray-600 bg-zinc-800">
                      <Building2 className="w-16 h-16" />
                    </div>
                  )}
                  
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                  
                  <div className="absolute top-6 left-6 pr-20 max-w-full">
                    <h2 className="text-3xl font-extrabold text-white leading-tight line-clamp-3 drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">{society.name}</h2>
                  </div>

                  <div className="absolute top-6 right-6 text-right text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <div className="text-xl font-bold leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{society._count?.members || Math.floor(Math.random()*150 + 20)}</div>
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">members</div>
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between bg-zinc-900 flex-1 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden transition-transform duration-500 hover:scale-110 ring-2 ring-zinc-700 flex-shrink-0 bg-zinc-800 flex items-center justify-center">
                      {society.logoUrl ? (
                        <img 
                          src={society.logoUrl} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="transition-transform duration-500 hover:translate-x-1 min-w-0 flex-1">
                      <div className="text-sm font-medium text-zinc-200 truncate">@{society.name.toLowerCase().replace(/[^a-z0-9]/g, '')}</div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
                        <span className="truncate">new post</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="relative z-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-black/50 cursor-pointer border border-white/5 shrink-0"
                  >
                    Follow
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
