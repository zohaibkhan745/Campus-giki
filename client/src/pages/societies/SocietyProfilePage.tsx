import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Tag,
  History,
  Loader2,
  Megaphone,
  Calendar as CalendarIcon,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import type { EventFeedItem } from '@/types/feed.types';
import { Alert } from '@/components/ui/Alert';
import { EventCard } from '@/components/feed/EventCard';
import { PostCard } from '@/components/feed/PostCard';

export const SocietyProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'upcoming' | 'past'>('posts');

  const {
    data: society,
    isLoading: isLoadingSociety,
    isError: isErrorSociety,
  } = useQuery({
    queryKey: ['publicSociety', id],
    queryFn: () => societyService.getPublicSocietyById(id!),
    enabled: !!id,
  });

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['publicSocietyEvents', id],
    queryFn: () => societyService.getPublicSocietyEvents(id!),
    enabled: !!id,
  });

  const { data: postsData = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['publicSocietyPosts', id],
    queryFn: () => societyService.getPublicSocietyPosts(id!),
    enabled: !!id,
  });

  const upcomingEvents = eventsData?.upcoming || [];
  const pastEvents = eventsData?.past || [];

  if (isLoadingSociety) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading society profile...</p>
      </div>
    );
  }

  if (isErrorSociety || !society) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <Alert variant="error" message="Society not found or profile is not published." />
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full text-left font-sans">
      
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Breakout full width banner */}
      <div className="w-full max-w-[1000px] mx-auto relative mt-4 rounded-3xl overflow-visible">
        <div className="w-full h-[280px] sm:h-[320px] relative bg-[#1e3c72] rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10">
          {society.bannerUrl ? (
            <img
              src={society.bannerUrl}
              alt={society.name}
              className="w-full h-full object-cover object-center block"
            />
          ) : (
            <div className="w-full h-full bg-[#1e3c72]" />
          )}

          {/* Warning Badge */}
          {society.hasWarning && (
            <div className="absolute top-4 left-20 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 border border-red-500 text-white rounded-full text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>WARNING ISSUED</span>
              </span>
            </div>
          )}

          {/* Tags (Top Right) */}
          <div className="absolute top-4 right-4 sm:right-8 flex gap-2 z-10 flex-wrap justify-end max-w-[60%]">
            {society.type === 'CLUB' && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-500/80 text-white border border-purple-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                🎨 Club
              </span>
            )}
            {society.type === 'TEAM' && (
              <span className="inline-flex items-center px-3 py-1 bg-emerald-500/80 text-white border border-emerald-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                🚀 Team
              </span>
            )}
            {(!society.type || society.type === 'SOCIETY') && (
              <span className="inline-flex items-center px-3 py-1 bg-[#1e3c72]/80 text-white border border-blue-400 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                🏛️ Society
              </span>
            )}
            {society.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-black/50 text-white border border-white/20 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm">
                <Tag className="w-3.5 h-3.5" />
                {society.category.name}
              </span>
            )}
          </div>

          {/* Profile Picture */}
          <div className="absolute -bottom-[65px] left-1/2 -translate-x-1/2 sm:-bottom-[90px] sm:left-12 sm:translate-x-0 z-20">
            {society.logoUrl ? (
              <img
                src={society.logoUrl}
                alt={society.name}
                className="w-[110px] h-[110px] sm:w-[180px] sm:h-[180px] rounded-full border-[3px] sm:border-[5px] border-white object-cover bg-[#e0e0e0] block shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
              />
            ) : (
              <div className="w-[110px] h-[110px] sm:w-[180px] sm:h-[180px] rounded-full border-[3px] sm:border-[5px] border-white bg-[#e0e0e0] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)]">
                <Building2 className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>

          {/* Society Name */}
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 w-max max-w-[90%] sm:max-w-[calc(100%-496px)] text-center text-white font-bold text-[20px] sm:text-[30px] leading-[1.2] drop-shadow-[0_4px_12px_rgba(0,0,0,1)] pointer-events-none z-10">
            {society.name}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-[1000px] mx-auto pt-[80px] sm:pt-[110px] px-5 sm:px-[138px] pb-12 text-center sm:text-left">
        <div className="text-[18px] sm:text-[22px] font-bold text-gray-100 mb-3">About</div>
        <p className="text-[14px] sm:text-[16px] leading-[1.6] text-gray-300">
          {society.longDescription || society.shortDescription || 'No detailed overview provided.'}
        </p>

        {/* Navigation Tabs (Centered and Stretched) */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'posts'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Posts & Announcements ({postsData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Upcoming Events ({upcomingEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'past'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Events ({pastEvents.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {isLoadingPosts ? (
                <div className="py-8 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading posts...</span>
                </div>
              ) : postsData.length === 0 ? (
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center space-y-2">
                  <Megaphone className="w-10 h-10 text-gray-500 mx-auto" />
                  <h3 className="font-semibold text-white text-sm">No Posts Available</h3>
                  <p className="text-xs text-gray-400">
                    {society.name} has not posted any announcements or updates yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {postsData.map((post) => (
                    <PostCard key={post.id} item={post} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {isLoadingEvents ? (
                <div className="py-8 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading society events...</span>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center space-y-2">
                  <CalendarIcon className="w-10 h-10 text-gray-500 mx-auto" />
                  <h3 className="font-semibold text-white text-sm">No Upcoming Events</h3>
                  <p className="text-xs text-gray-400">
                    {society.name} has no scheduled upcoming campus events right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      item={
                        {
                          ...event,
                          type: 'event',
                          society: event.society || society,
                        } as EventFeedItem
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
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center text-xs text-gray-400">
                  No past events recorded for this society.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
                  {pastEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      item={
                        {
                          ...event,
                          type: 'event',
                          society: event.society || society,
                        } as EventFeedItem
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
