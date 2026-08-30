import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import React from 'react';
import { Building2, User, Globe } from 'lucide-react';
const Instagram = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const Facebook = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Linkedin = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
import { useAuth } from '@/hooks/useAuth';

interface BannerHeaderProps {
  socials?: { instagram?: string | null, facebook?: string | null, linkedin?: string | null, website?: string | null };
  title: string;
  subtitle?: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  fallbackImage?: string;
}

export const BannerHeader: React.FC<BannerHeaderProps> = ({
  title,
  subtitle,
  bannerUrl = '/default-banner.png',
  logoUrl,
  fallbackImage = '/default-society.jpg',
  socials,
}) => {
  const { user } = useAuth();
  
  return (
    <>
      <style>{`
        .shared-banner {
          width: 100vw;
          height: 320px;
          position: relative;
          background-color: #f3f4f6;
          border-radius: 0;
          overflow: visible;
          margin-left: -50vw;
          left: 50%;
          margin-top: -2rem;
        }

        .shared-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .shared-banner::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%);
          z-index: 2;
        }

        .shared-profile-container {
          position: absolute;
          left: 48px;
          bottom: -90px;
          z-index: 20;
        }

        .shared-profile-img {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 5px solid #ffffff;
          object-fit: cover;
          background-color: #e0e0e0;
          display: block;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        
        .shared-profile-fallback {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 5px solid #ffffff;
          background-color: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .shared-name-text {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: max-content;
          max-width: calc(100% - 496px);
          text-align: center;
          word-wrap: break-word;
          font-size: 30px;
          line-height: 1.2;
          font-weight: bold;
          color: #ffffff;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
          pointer-events: none;
          z-index: 10;
        }

        .shared-content-spacer {
          height: 110px;
          width: 100%;
        }

        @media (max-width: 900px) {
          .shared-name-text {
            max-width: calc(100% - 496px);
            font-size: 24px;
          }
        }

        @media (max-width: 768px) {
          .shared-banner {
            height: 280px;
          }
          
          .shared-profile-container {
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            bottom: auto;
          }

          .shared-profile-img, .shared-profile-fallback {
            width: 110px;
            height: 110px;
            border-width: 3px;
          }

          .shared-name-text {
            top: calc(45% + 65px);
            bottom: auto;
            width: 90%;
            max-width: 90%;
            font-size: 24px;
          }
          
          .shared-content-spacer {
            height: 20px;
          }
        }
      `}</style>

      <div className="shared-banner">
        <img src={getSocietyBanner(bannerUrl)} alt="Banner Image" className="shared-banner-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-banner.png'; }} />

        {/* Profile Circle */}
        <div className="shared-profile-container">
          <img src={logoUrl || fallbackImage} alt="Logo" className="shared-profile-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage; }} />
        </div>

        {/* Name */}
        {socials && (socials.instagram || socials.facebook || socials.linkedin || socials.website) && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            {socials.instagram && <a href={socials.instagram.startsWith('http') ? socials.instagram : `https://${socials.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"><Instagram className="w-5 h-5" /></a>}
            {socials.facebook && <a href={socials.facebook.startsWith('http') ? socials.facebook : `https://${socials.facebook}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"><Facebook className="w-5 h-5" /></a>}
            {socials.linkedin && <a href={socials.linkedin.startsWith('http') ? socials.linkedin : `https://${socials.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"><Linkedin className="w-5 h-5" /></a>}
            {socials.website && <a href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20"><Globe className="w-5 h-5" /></a>}
          </div>
        )}
        <div className="shared-name-text">
          {title}
          {subtitle && <div className="text-sm font-normal mt-1 opacity-80">{subtitle}</div>}
        </div>
      </div>
      
      <div className="shared-content-spacer" />
    </>
  );
};






