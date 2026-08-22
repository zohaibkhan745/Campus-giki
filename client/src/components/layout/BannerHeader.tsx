import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import React from 'react';
import { Building2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface BannerHeaderProps {
  title: string;
  subtitle?: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
}

export const BannerHeader: React.FC<BannerHeaderProps> = ({
  title,
  subtitle,
  bannerUrl = '/default-banner.jpg',
  logoUrl,
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
            left: 50%;
            bottom: -55px;
            transform: translateX(-50%);
          }

          .shared-profile-img, .shared-profile-fallback {
            width: 110px;
            height: 110px;
            border-width: 3px;
          }

          .shared-name-text {
            bottom: 16px;
            font-size: 20px;
            max-width: 90%;
          }
          
          .shared-content-spacer {
            height: 70px;
          }
        }
      `}</style>

      <div className="shared-banner">
        <img src={getSocietyBanner(bannerUrl)} alt="Banner Image" className="shared-banner-img" />

        {/* Profile Circle */}
        <div className="shared-profile-container">
          <img src={logoUrl || `/giki-mono.jpg`} alt="Logo" className="shared-profile-img" />
        </div>

        {/* Name */}
        <div className="shared-name-text">
          {title}
          {subtitle && <div className="text-sm font-normal mt-1 opacity-80">{subtitle}</div>}
        </div>
      </div>
      
      <div className="shared-content-spacer" />
    </>
  );
};

