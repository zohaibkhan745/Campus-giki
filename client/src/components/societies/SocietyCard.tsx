import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { getSocietyLogo, resolveImageUrl, cn } from '@/lib/utils';
import type { PublicSocietyItem } from '@/types/society.types';

interface SocietyCardProps {
  society: PublicSocietyItem;
  className?: string;
}

export const SocietyCard: React.FC<SocietyCardProps> = ({ society, className }) => {
  const navigate = useNavigate();

  const logoImage = getSocietyLogo(society.logoUrl);
  const bannerImage = (society as any).bannerUrl ? resolveImageUrl((society as any).bannerUrl) : null;
  const username = society.name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Calculate EC Members count safely
  const ecCount = (() => {
    try {
      const s = society as any;
      if (s.executiveCouncil) {
        const parsed = JSON.parse(s.executiveCouncil);
        return (Array.isArray(parsed) ? parsed.length : 0) + (s.presidentName ? 1 : 0);
      }
      return s.presidentName ? 1 : 0;
    } catch {
      return 1;
    }
  })();

  const categoryName = society.category?.name || 'Campus Society';
  const orgType = society.type || 'SOCIETY';

  const handleCardClick = () => {
    navigate(`/societies/${society.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/societies/${society.id}`);
    }
  };

  return (
    <article
      className={cn(
        'card-wrapper group relative flex flex-col w-full h-full rounded-[24px] overflow-hidden border border-border-medium bg-surface shadow-elevation-1 transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-elevation-2 active:scale-[0.99] cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-left',
        className
      )}
      tabIndex={0}
      role="article"
      aria-label={`Society: ${society.name}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* 1. Header Banner with Ambient Backdrop & Badges */}
      <div className="relative w-full h-24 overflow-hidden bg-gradient-to-br from-brand-primary/20 via-brand-secondary/15 to-surface-elevated shrink-0">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-xs opacity-60 scale-105 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/15 via-purple-500/10 to-brand-secondary/15" />
        )}

        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Top-Right Category Pill Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="card-tag !text-[9px] !py-0.5 !px-2.5 shrink-0 backdrop-blur-md bg-surface-glass border border-border-subtle font-extrabold uppercase tracking-wider text-text-primary">
            {categoryName}
          </span>
        </div>

        {/* Top-Left Organization Type Tag */}
        {orgType && orgType !== 'SOCIETY' && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand-primary/20 text-brand-primary border border-brand-primary/30 backdrop-blur-md">
              {orgType}
            </span>
          </div>
        )}
      </div>

      {/* 2. Elevated Logo & Identity */}
      <div className="px-4 -mt-8 flex items-end justify-between relative z-10">
        <div className="w-16 h-16 rounded-2xl overflow-hidden p-1 bg-surface border-2 border-border-medium shadow-elevation-1 group-hover:border-brand-primary/50 transition-colors shrink-0">
          <img
            src={logoImage}
            alt={`${society.name} logo`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-xl bg-surface-elevated"
            onError={(e) => {
              e.currentTarget.src = '/default-society.jpg';
            }}
          />
        </div>
      </div>

      {/* 3. Society Information Body */}
      <div className="flex flex-col flex-1 p-4 pt-2 text-left gap-1 min-h-0">
        <h2
          className="text-[17px] font-bold text-text-primary tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors"
          title={society.name}
        >
          {society.name}
        </h2>

        <p className="text-xs text-text-muted font-medium truncate">
          @{username}
        </p>

        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1.5 flex-1">
          {society.shortDescription || 'Active student organization at Ghulam Ishaq Khan Institute of Engineering Sciences and Technology.'}
        </p>
      </div>

      {/* 4. Lower Footer Section */}
      <div className="bg-surface/95 border-t border-border-subtle p-3 px-4 flex items-center justify-between gap-2 shrink-0 rounded-b-[24px] relative z-20">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <Users className="w-3.5 h-3.5 text-text-muted" />
          <span>{ecCount > 0 ? `${ecCount} Council` : 'Registered Society'}</span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary group-hover:translate-x-0.5 transition-transform">
          <span>Explore</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};

