import { getSocietyBanner } from '@/lib/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export interface BannerHeaderProps {
  title: string;
  subtitle?: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  fallbackImage?: string;
  socials?: {
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    website?: string | null;
  };
  editUrl?: string;
  warningBadge?: React.ReactNode;
  topRightContent?: React.ReactNode;
  avatarOverlay?: React.ReactNode;
  backButton?: React.ReactNode;
  hideSpacer?: boolean;
}

export const BannerHeader: React.FC<BannerHeaderProps> = ({
  title,
  subtitle,
  bannerUrl = '/default-banner.png',
  logoUrl,
  fallbackImage = '/default-society.jpg',
  socials,
  editUrl,
  warningBadge,
  topRightContent,
  avatarOverlay,
  backButton,
  hideSpacer = false,
}) => {
  const hasSocials = socials && (socials.instagram || socials.facebook || socials.linkedin || socials.website);

  return (
    <>
      {backButton}

      <div className="shared-banner">
        <img
          src={getSocietyBanner(bannerUrl)}
          alt={`${title} banner`}
          className="shared-banner-img"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/default-banner.png';
          }}
        />

        {/* Optional Warning Badge (e.g. Society Profile) */}
        {warningBadge}

        {/* Profile Circle */}
        <div className="shared-profile-container group/avatar relative">
          <img
            src={logoUrl || fallbackImage}
            alt={`${title} avatar`}
            className="shared-profile-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
          />

          {avatarOverlay}

          {editUrl && !avatarOverlay && (
            <Link
              to={editUrl}
              className="absolute inset-0 rounded-full cursor-pointer hover:bg-black/20 transition-all"
              aria-label="Edit Profile"
            />
          )}
        </div>

        {/* Top Right Controls & Social Links */}
        {(topRightContent || hasSocials) && (
          <div className="absolute top-4 right-4 sm:right-8 z-20 flex flex-col items-end gap-2 max-w-[65%]">
            {topRightContent}

            {hasSocials && (
              <div className="flex gap-2 flex-wrap justify-end">
                {socials.instagram && (
                  <a
                    href={socials.instagram.startsWith('http') ? socials.instagram : `https://${socials.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"
                    aria-label="Instagram profile"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {socials.facebook && (
                  <a
                    href={socials.facebook.startsWith('http') ? socials.facebook : `https://${socials.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"
                    aria-label="Facebook page"
                  >
                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {socials.linkedin && (
                  <a
                    href={socials.linkedin.startsWith('http') ? socials.linkedin : `https://${socials.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"
                    aria-label="LinkedIn profile"
                  >
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {socials.website && (
                  <a
                    href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"
                    aria-label="Official website"
                  >
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="shared-name-text">
          <div>{title}</div>
          {subtitle && <div className="text-sm font-normal mt-1 opacity-85">{subtitle}</div>}
        </div>
      </div>

      {!hideSpacer && <div className="shared-content-spacer" />}
    </>
  );
};
