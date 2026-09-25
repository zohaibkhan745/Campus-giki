import { getSocietyLogo } from '@/lib/utils';
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
  Camera,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { societyService } from '@/services/society.service';
import { EventCard } from '@/components/feed/EventCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { BannerHeader } from '@/components/layout/BannerHeader';

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
          <div className="absolute bottom-[-60px] md:bottom-[-90px] left-6 md:left-12 w-[120px] md:w-[180px] h-[120px] md:h-[180px] rounded-full bg-white/10 border-4 border-border-medium" />
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
              : 'This campus society could not be found or may have been deactivated.'
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

  const isSocietyManager =
    (user?.role === 'SOCIETY' && user.society?.id === society.id) || user?.role === 'DSA_ADMIN';

  return (
    <div className="w-full text-left font-sans bg-transparent">
      {/* Consolidated Shared Banner Header */}
      <BannerHeader
        title={society.name}
        bannerUrl={society.bannerUrl}
        logoUrl={getSocietyLogo(society.logoUrl)}
        fallbackImage="/default-society.jpg"
        hideSpacer
        backButton={
          <button
            onClick={() => navigate(-1)}
            className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        warningBadge={
          society.hasWarning ? (
            <div className="absolute top-4 left-16 sm:left-20 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 border border-red-500 text-white rounded-full text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>WARNING ISSUED</span>
              </span>
            </div>
          ) : undefined
        }
        topRightContent={
          <div className="flex gap-2 flex-wrap justify-end">
            {society.type === 'CLUB' && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-500/80 text-white border border-purple-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                Club
              </span>
            )}
            {society.type === 'TEAM' && (
              <span className="inline-flex items-center px-3 py-1 bg-emerald-500/80 text-white border border-emerald-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                Team
              </span>
            )}
            {(!society.type || society.type === 'SOCIETY') && (
              <span className="inline-flex items-center px-3 py-1 bg-[#1e3c72]/80 text-white border border-blue-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                Society
              </span>
            )}
            {society.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-black/50 text-white border border-white/20 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                <Tag className="w-3.5 h-3.5" />
                {society.category.name}
              </span>
            )}
          </div>
        }
        socials={{
          instagram: society.instagram,
          facebook: society.facebook,
          linkedin: society.linkedin,
          website: society.website,
        }}
        avatarOverlay={
          isSocietyManager ? (
            <Link
              to="/society/setup"
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px] cursor-pointer"
              aria-label="Change society logo"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all shadow-md">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </Link>
          ) : undefined
        }
      />

      {/* Content Section */}
      <div className="society-content-section">
        <h2 className="society-about-heading">About</h2>

        {(society.presidentName || society.presidentFaculty) && (
          <p className="society-about-text mb-2">
            President:{' '}
            {society.presidentName && (
              <strong className="text-text-primary font-bold">{society.presidentName}</strong>
            )}
            {society.presidentName && society.presidentFaculty && ' '}
            {society.presidentFaculty && (
              <span className="text-text-muted">({society.presidentFaculty})</span>
            )}
          </p>
        )}

        {society.advisor?.user?.fullName && (
          <p className="society-about-text mb-4">
            Advisor:{' '}
            <strong className="text-text-primary font-bold">{society.advisor.user.fullName}</strong>
            {society.advisor.department && (
              <span className="text-text-muted"> ({society.advisor.department})</span>
            )}
          </p>
        )}

        <p className="society-about-text">
          {society.longDescription || society.shortDescription || 'No detailed overview provided.'}
        </p>

        {/* Navigation Tabs */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-center bg-surface-card border border-border-subtle rounded-2xl p-1 gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Upcoming Events</span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Past Events</span>
          </button>

          <button
            onClick={() => setActiveTab('council')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'council'
                ? 'bg-surface-elevated text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
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
                <div className="py-8 text-center text-text-muted text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading society events...</span>
                </div>
              ) : isErrorEvents ? (
                <ErrorState error={errorEvents} onRetry={refetchEvents} compact />
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
              <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-card overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[650px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-surface-elevated/70 border-b border-border-subtle">
                      <th className="py-4 px-5 text-xs font-bold text-text-muted uppercase tracking-wider">
                        Sr. No
                      </th>
                      <th className="py-4 px-5 text-xs font-bold text-text-muted uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-4 px-5 text-xs font-bold text-text-muted uppercase tracking-wider">
                        Post
                      </th>
                      <th className="py-4 px-5 text-xs font-bold text-text-muted uppercase tracking-wider">
                        Faculty
                      </th>
                      <th className="py-4 px-5 text-xs font-bold text-text-muted uppercase tracking-wider">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-subtle/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="py-4 px-5 text-sm text-text-secondary">01</td>
                      <td className="py-4 px-5 text-sm font-bold text-text-primary">
                        {society.presidentName || 'N/A'}
                      </td>
                      <td className="py-4 px-5 text-sm text-amber-500 dark:text-amber-400 font-semibold">
                        President
                      </td>
                      <td className="py-4 px-5 text-sm text-text-secondary">
                        {society.presidentFaculty || 'N/A'}
                      </td>
                      <td className="py-4 px-5 text-sm text-text-secondary">
                        {society.presidentEmail || 'N/A'}
                      </td>
                    </tr>
                    {(() => {
                      try {
                        const council = JSON.parse(society.executiveCouncil || '[]');
                        const mandatoryOrder = [
                          'Vice President',
                          'Event Coordinator',
                          'General Secretary',
                          'Treasurer',
                          'Director Liaison',
                        ];

                        council.sort((a: any, b: any) => {
                          const aIdx = mandatoryOrder.indexOf(a.role);
                          const bIdx = mandatoryOrder.indexOf(b.role);
                          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                          if (aIdx !== -1) return -1;
                          if (bIdx !== -1) return 1;
                          return 0;
                        });

                        return council.map((member: any, idx: number) => (
                          <tr
                            key={idx}
                            className="border-b border-border-subtle/50 hover:bg-surface-hover/50 transition-colors"
                          >
                            <td className="py-4 px-5 text-sm text-text-secondary">
                              {(idx + 2).toString().padStart(2, '0')}
                            </td>
                            <td className="py-4 px-5 text-sm font-semibold text-text-primary">
                              {member.name || 'N/A'}
                            </td>
                            <td
                              className={`py-4 px-5 text-sm font-semibold ${
                                [
                                  'Vice President',
                                  'Event Coordinator',
                                  'General Secretary',
                                  'Treasurer',
                                  'Director Liaison',
                                ].includes(member.role)
                                  ? 'text-brand-primary'
                                  : 'text-text-primary'
                              }`}
                            >
                              {member.role}
                            </td>
                            <td className="py-4 px-5 text-sm text-text-secondary">
                              {member.faculty || 'N/A'}
                            </td>
                            <td className="py-4 px-5 text-sm text-text-secondary">
                              {member.email || 'N/A'}
                            </td>
                          </tr>
                        ));
                      } catch {
                        return null;
                      }
                    })()}
                    {society.advisor && (
                      <tr className="hover:bg-surface-hover/50 transition-colors border-t border-border-subtle">
                        <td className="py-4 px-5 text-sm text-text-secondary">--</td>
                        <td className="py-4 px-5 text-sm font-bold text-text-primary">
                          {society.advisor.user?.fullName || 'N/A'}
                        </td>
                        <td className="py-4 px-5 text-sm text-purple-600 dark:text-purple-400 font-semibold">
                          Faculty Advisor
                        </td>
                        <td className="py-4 px-5 text-sm text-text-secondary">
                          {society.advisor.department || 'N/A'}
                        </td>
                        <td className="py-4 px-5 text-sm text-text-secondary">
                          {society.advisor.user?.email || 'N/A'}
                        </td>
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
