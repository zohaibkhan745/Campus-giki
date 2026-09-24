import { getSocietyLogo, getSocietyBanner } from '@/lib/utils';
import React, { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  History,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Tag,
  Globe,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { societyService } from '@/services/society.service';
import { EventCard } from '@/components/feed/EventCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

const Instagram = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const Facebook = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Linkedin = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;

export const SocietyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'council'>('upcoming');

  const {
    data: society,
    isLoading: isLoadingSociety,
    isError: isErrorSociety,
    error: errorSociety,
    refetch: refetchSociety,
  } = useQuery({
    queryKey: ['publicSociety', id],
    queryFn: () => societyService.getPublicSocietyById(id!),
    enabled: !!id,
    placeholderData: keepPreviousData,
    initialData: () => {
      if (!id) return undefined;
      // 1. Direct cache
      const cached = queryClient.getQueryData<any>(['publicSociety', id]);
      if (cached) return cached;
      // 2. Check publicSocieties directory queries
      const directoryQueries = queryClient.getQueriesData<any>({ queryKey: ['publicSocieties'] });
      for (const [, data] of directoryQueries) {
        if (data?.items) {
          const found = data.items.find((s: any) => s.id === id);
          if (found) return found;
        }
      }
      // 3. Check societies list filter cache
      const listData = queryClient.getQueryData<any>(['societiesListForFilter']);
      if (listData?.items) {
        const found = listData.items.find((s: any) => s.id === id);
        if (found) return found;
      }
      return undefined;
    },
  });

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
    error: errorEvents,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['publicSocietyEvents', id],
    queryFn: () => societyService.getPublicSocietyEvents(id!),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

  const upcomingEvents = eventsData?.upcoming || [];
  const pastEvents = eventsData?.past || [];

  if (isLoadingSociety && !society) {
    return (
      <div className="w-full text-left font-sans bg-transparent animate-pulse">
        <div className="w-screen h-[280px] md:h-[320px] bg-white/5 relative -ml-[50vw] left-1/2 -mt-8">
          <div className="absolute bottom-[-60px] md:bottom-[-90px] left-6 md:left-12 w-[120px] md:w-[180px] h-[120px] md:h-[180px] rounded-full bg-white/10 border-4 border-[#121318]" />
        </div>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-20 md:pt-28 space-y-4">
          <div className="h-8 w-64 bg-white/10 rounded-lg" />
          <div className="h-4 w-96 bg-white/5 rounded" />
          <div className="h-24 w-full max-w-2xl bg-white/5 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (isErrorSociety || !society) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <ErrorState
          error={errorSociety}
          title={isErrorSociety ? undefined : 'Society Not Found'}
          description={
            isErrorSociety
              ? undefined
              : "This campus society could not be found or may have been deactivated."
          }
          badge={isErrorSociety ? undefined : 'Society Unavailable'}
          onRetry={isErrorSociety ? () => refetchSociety() : undefined}
          actionText="Try Reconnecting"
          secondaryAction={{
            label: 'Browse Society Directory',
            to: '/societies',
          }}
          showBackAction
        />
      </div>
    );
  }

  return (
    <div className="w-full text-left font-sans bg-transparent">
      <style>{`
        .society-banner {
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

        .society-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .society-profile-container {
          position: absolute;
          bottom: -90px;
          left: 48px;
          z-index: 20;
        }

        .society-profile-img {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 5px solid #ffffff;
          object-fit: cover;
          background-color: #e0e0e0;
          display: block;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        
        .society-profile-fallback {
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

        .society-name-text {
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

        .society-content-section {
          padding-top: 110px;
          padding-left: 48px;
          padding-right: 48px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .society-about-heading {
          font-size: 22px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .society-about-text {
          font-size: 16px;
          line-height: 1.6;
          color: #d1d5db;
        }

        @media (max-width: 900px) {
          .society-name-text {
            max-width: calc(100% - 496px);
            font-size: 24px;
          }
        }

        @media (max-width: 768px) {
          .society-banner {
            height: 280px;
          }

          .society-profile-container {
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            bottom: auto;
          }

          .society-profile-img, .society-profile-fallback {
            width: 110px;
            height: 110px;
            border-width: 3px;
          }

          .society-name-text {
            top: 75%;
            bottom: auto;
            left: 50%;
            transform: translateX(-50%);
            font-size: 20px;
            max-width: 90%;
          }

          .society-content-section {
            padding-top: 30px;
            padding-left: 20px;
            padding-right: 20px;
          }

          .society-about-heading {
            font-size: 18px;
          }

          .society-about-text {
            font-size: 14px;
          }
        }
      `}</style>

      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Banner */}
      <div className="society-banner">
        <img src={getSocietyBanner(society.bannerUrl)} alt="Banner Image" className="society-banner-img" onError={(e) => { e.currentTarget.src = '/default-banner.png'; }} />
        
        {/* Warning Badge */}
        {society.hasWarning && (
          <div className="absolute top-4 left-20 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 border border-red-500 text-white rounded-full text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>WARNING ISSUED</span>
            </span>
          </div>
        )}

        {/* Tags */}
        <div className="absolute top-4 right-4 sm:right-8 flex flex-col gap-3 z-10 items-end max-w-[60%]">
          <div className="flex gap-2 flex-wrap justify-end">
            {society.type === 'CLUB' && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-500/80 text-white border border-purple-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">Club</span>
            )}
            {society.type === 'TEAM' && (
              <span className="inline-flex items-center px-3 py-1 bg-emerald-500/80 text-white border border-emerald-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">Team</span>
            )}
            {(!society.type || society.type === 'SOCIETY') && (
              <span className="inline-flex items-center px-3 py-1 bg-[#1e3c72]/80 text-white border border-blue-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">Society</span>
            )}
            {society.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-black/50 text-white border border-white/20 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                <Tag className="w-3.5 h-3.5" />
                {society.category.name}
              </span>
            )}
          </div>
          
          {/* Social Links */}
          <div className="flex gap-2">
            {society.instagram && (
              <a href={society.instagram.startsWith('http') ? society.instagram : `https://${society.instagram}`} target="_blank" rel="noopener noreferrer" className="p-1.5 md:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20">
                <Instagram className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </a>
            )}
            {society.facebook && (
              <a href={society.facebook.startsWith('http') ? society.facebook : `https://${society.facebook}`} target="_blank" rel="noopener noreferrer" className="p-1.5 md:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20">
                <Facebook className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </a>
            )}
            {society.linkedin && (
              <a href={society.linkedin.startsWith('http') ? society.linkedin : `https://${society.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-1.5 md:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20">
                <Linkedin className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </a>
            )}
            {society.website && (
              <a href={society.website.startsWith('http') ? society.website : `https://${society.website}`} target="_blank" rel="noopener noreferrer" className="p-1.5 md:p-2.5 bg-black/50 hover:bg-black/80 hover:scale-110 hover:text-blue-400 hover:border-blue-400/50 text-white rounded-full backdrop-blur-sm transition-all border border-white/20">
                <Globe className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </a>
            )}
          </div>
        </div>

        <div className="society-profile-container group/avatar relative">
          <img src={getSocietyLogo(society.logoUrl)} alt="Society Logo" className="society-profile-img" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
          {((user?.role === 'SOCIETY' && user.society?.id === society.id) || user?.role === 'DSA_ADMIN') && (
            <Link
              to="/society/setup"
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px] cursor-pointer"
              aria-label="Change society logo"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all shadow-md">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </Link>
          )}
        </div>

        {/* Society Name */}
        <div className="society-name-text">{society.name}</div>
      </div>

      {/* Content Section */}
      <div className="society-content-section">
        <div className="society-about-heading">About</div>
          {(society.presidentName || society.presidentFaculty) && (
            <p className="society-about-text mb-2">
              President:{' '}
              {society.presidentName && <strong className="text-white font-bold">{society.presidentName}</strong>}
              {society.presidentName && society.presidentFaculty && ' '}
              {society.presidentFaculty && <span>({society.presidentFaculty})</span>}
            </p>
          )}
          {society.advisor?.user?.fullName && (
            <p className="society-about-text mb-4">
              Advisor:{' '}
              <strong className="text-white font-bold">{society.advisor.user.fullName}</strong>
              {society.advisor.department && <span> ({society.advisor.department})</span>}
            </p>
          )}
          <p className="society-about-text">
          {society.longDescription || society.shortDescription || 'No detailed overview provided.'}
        </p>

        {/* Navigation Tabs */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Upcoming Events</span>
          </button>


          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'past'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Past Events</span>
            </button>
            <button
              onClick={() => setActiveTab('council')}
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'council'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag className="w-5 h-5" />
              <span>Executive Council</span>
            </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {isLoadingEvents ? (
                <div className="py-8 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading society events...</span>
                </div>
              ) : isErrorEvents ? (
                <ErrorState
                  error={errorEvents}
                  onRetry={refetchEvents}
                  compact
                />
              ) : upcomingEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="No Upcoming Events"
                  description={`${society.name} has no scheduled upcoming campus events right now. Check out the Executive Council tab or explore other societies.`}
                  compact
                />
              ) : (
                <div className="cards-container">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      item={
                        {
                          ...event,
                          type: 'event',
                          society: event.society || society,
                        } as any
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}


          {activeTab === 'past' && (
            <div className="space-y-4">
              {pastEvents.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No Past Events Recorded"
                  description={`No archive events have been recorded for ${society.name} yet.`}
                  compact
                />
              ) : (
                <div className="cards-container">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      item={
                        {
                          ...event,
                          type: 'event',
                          society: event.society || society,
                        } as any
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'council' && (
              <div className="space-y-4 max-w-5xl mx-auto pb-10">

                <div className="bg-[#1e2025]/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[650px] whitespace-nowrap">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Sr. No</th>
                        <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Post</th>
                        <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Faculty</th>
                        <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-5 text-sm text-gray-300">01</td>
                        <td className="py-4 px-5 text-sm font-bold text-white">{society.presidentName || 'N/A'}</td>
                        <td className="py-4 px-5 text-sm text-amber-400 font-semibold">President</td>
                        <td className="py-4 px-5 text-sm text-gray-300">{society.presidentFaculty || 'N/A'}</td>
                        <td className="py-4 px-5 text-sm text-gray-300">{society.presidentEmail || 'N/A'}</td>
                      </tr>
                      {(() => {
                        try {
                          const council = JSON.parse(society.executiveCouncil || '[]');
                          const mandatoryOrder = ['Vice President', 'Event Coordinator', 'General Secretary', 'Treasurer', 'Director Liaison'];
                          
                          council.sort((a: any, b: any) => {
                            const aIdx = mandatoryOrder.indexOf(a.role);
                            const bIdx = mandatoryOrder.indexOf(b.role);
                            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                            if (aIdx !== -1) return -1;
                            if (bIdx !== -1) return 1;
                            return 0;
                          });

                          return council.map((member: any, idx: number) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                              <td className="py-4 px-5 text-sm text-gray-300">{(idx + 2).toString().padStart(2, '0')}</td>
                              <td className="py-4 px-5 text-sm font-semibold text-gray-200">{member.name || 'N/A'}</td>
                              <td className={`py-4 px-5 text-sm font-semibold ${['Vice President', 'Event Coordinator', 'General Secretary', 'Treasurer', 'Director Liaison'].includes(member.role) ? 'text-blue-400' : 'text-white'}`}>{member.role}</td>
                              <td className="py-4 px-5 text-sm text-gray-300">{member.faculty || 'N/A'}</td>
                              <td className="py-4 px-5 text-sm text-gray-300">{member.email || 'N/A'}</td>
                            </tr>
                          ));
                        } catch {
                          return null;
                        }
                      })()}
                      {society.advisor && (
                        <tr className="hover:bg-white/[0.03] transition-colors border-t border-white/20">
                          <td className="py-4 px-5 text-sm text-gray-300">--</td>
                          <td className="py-4 px-5 text-sm font-bold text-white">{society.advisor.user?.fullName || 'N/A'}</td>
                          <td className="py-4 px-5 text-sm text-purple-400 font-semibold">Faculty Advisor</td>
                          <td className="py-4 px-5 text-sm text-gray-300">{society.advisor.department || 'N/A'}</td>
                          <td className="py-4 px-5 text-sm text-gray-300">{society.advisor.user?.email || 'N/A'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};









