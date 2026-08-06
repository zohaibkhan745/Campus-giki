import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  Calendar,
  Loader2,
  LogOut,
  MapPin,
  MicVocal,
  CalendarDays,
  Settings,
  Megaphone,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { advisorService } from '@/services/advisor.service';
import type { PlanStatus } from '@/types/yearly-plan.types';
import type { AdvisorPostItem } from '@/types/advisor.types';
import { Alert } from '@/components/ui/Alert';
import { usePendingCounts } from '@/hooks/usePendingCounts';

export const AdvisorQueuePage: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'plans' | 'events' | 'posts'>('events');
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectionComments, setRejectionComments] = useState<string>('');
  const { pendingEventsCount, pendingPlansCount, pendingPostsCount } = usePendingCounts();

  const { data: profileData } = useQuery({
    queryKey: ['advisorProfile'],
    queryFn: advisorService.getMe,
  });

  const assignedSocietyName = profileData?.societies?.[0]?.name || 'Assigned Society';
  const assignedSocietyLogo = profileData?.societies?.[0]?.logoUrl;

  const {
    data: queueData,
    isLoading: isPlansLoading,
    isError: isPlansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['advisorYearlyPlansQueue', page, statusFilter],
    queryFn: () =>
      advisorService.getMySocietyYearlyPlans({
        page,
        limit: 10,
        status: (statusFilter as PlanStatus) || undefined,
      }),
    enabled: activeTab === 'plans',
  });

  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['advisorEventsQueue', page, statusFilter],
    queryFn: () =>
      advisorService.getMySocietyEvents({
        page,
        limit: 10,
        status: statusFilter || undefined,
      }),
    enabled: activeTab === 'events',
  });

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['advisorPostsQueue', page, statusFilter],
    queryFn: () =>
      advisorService.getMySocietyPosts({
        page,
        limit: 10,
        status: statusFilter || undefined,
      }),
    enabled: activeTab === 'posts',
  });

  const updatePostStatusMutation = useMutation({
    mutationFn: ({ postId, status, comments }: { postId: string; status: 'APPROVED' | 'REJECTED'; comments?: string }) =>
      advisorService.updatePostStatus(postId, { status, comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisorPostsQueue'] });
      queryClient.invalidateQueries({ queryKey: ['advisorPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setProcessingPostId(null);
      setRejectingPostId(null);
      setRejectionComments('');
    },
    onError: () => {
      setProcessingPostId(null);
    },
  });

  const handleApprovePost = (postId: string) => {
    setProcessingPostId(postId);
    updatePostStatusMutation.mutate({ postId, status: 'APPROVED' });
  };

  const handleRejectPostSubmit = (postId: string) => {
    setProcessingPostId(postId);
    updatePostStatusMutation.mutate({
      postId,
      status: 'REJECTED',
      comments: rejectionComments || undefined,
    });
  };

  const plans = queueData?.items || [];
  const events = eventsData?.items || [];
  const posts = postsData?.items || [];

  const meta =
    activeTab === 'plans'
      ? queueData?.meta
      : activeTab === 'events'
      ? eventsData?.meta
      : postsData?.meta;

  const isLoading =
    activeTab === 'plans' ? isPlansLoading : activeTab === 'events' ? isEventsLoading : isPostsLoading;
  const isError =
    activeTab === 'plans' ? isPlansError : activeTab === 'events' ? isEventsError : isPostsError;
  const refetch =
    activeTab === 'plans' ? refetchPlans : activeTab === 'events' ? refetchEvents : refetchPosts;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-forest-ink text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{status === 'PUBLISHED' ? 'PUBLISHED' : 'APPROVED'}</span>
          </span>
        );
      case 'PENDING':
      case 'PENDING_ADVISOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-ember-glow text-ember-glow rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING</span>
          </span>
        );
      case 'REJECTED':
      case 'CHANGES_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-red-400 text-red-400 rounded-inputs text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{status === 'REJECTED' ? 'REJECTED' : 'CHANGES REQ.'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lumen-stone text-vast-ink rounded-inputs text-xs font-semibold">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* 1. Welcome Banner — matches Society & Admin Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-transparent p-6 rounded-cards border border-vast-ink/20 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-16 h-16 rounded-full border border-vast-ink/20 object-cover shrink-0"
            />
          ) : assignedSocietyLogo ? (
            <img
              src={assignedSocietyLogo}
              alt={assignedSocietyName}
              className="w-16 h-16 rounded-full object-cover border border-vast-ink/20 bg-lumen-cream shrink-0"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-lumen-stone border border-vast-ink/20 rounded-full text-vast-ink shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-vast-ink line-clamp-1">
              Welcome back, {user?.fullName || 'Advisor'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-fog font-medium">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-ember-glow shrink-0" />
                Faculty Advisor • <span className="text-vast-ink font-semibold">{assignedSocietyName}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-vast-ink/20 hover:bg-lumen-stone rounded-inputs text-vast-ink text-sm font-bold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-transparent border border-vast-ink/20 hover:bg-red-500/10 rounded-inputs text-red-500 text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* 2. Command Center — matching Society & Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-lumen-cream p-6 rounded-cards border border-vast-ink/20 flex flex-col justify-center space-y-5">
          <h3 className="font-extrabold text-lg text-vast-ink flex items-center gap-2">
            Command Center
          </h3>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={() => { setActiveTab('events'); setPage(1); setStatusFilter(''); }}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-inputs font-bold transition-all relative text-xs sm:text-sm ${
                activeTab === 'events'
                  ? 'bg-vast-ink text-pure-white'
                  : 'bg-transparent text-vast-ink border border-vast-ink/20 hover:bg-lumen-stone'
              }`}
            >
              {pendingEventsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 bg-ember-glow text-pure-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                  {pendingEventsCount > 9 ? '9+' : pendingEventsCount}
                </span>
              )}
              <MicVocal className="w-5 h-5" />
              <span>Events</span>
            </button>
            <button
              onClick={() => { setActiveTab('plans'); setPage(1); setStatusFilter(''); }}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-inputs font-bold transition-all relative text-xs sm:text-sm ${
                activeTab === 'plans'
                  ? 'bg-vast-ink text-pure-white'
                  : 'bg-transparent text-vast-ink border border-vast-ink/20 hover:bg-lumen-stone'
              }`}
            >
              {pendingPlansCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 bg-ember-glow text-pure-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                  {pendingPlansCount > 9 ? '9+' : pendingPlansCount}
                </span>
              )}
              <CalendarDays className="w-5 h-5" />
              <span>Plans</span>
            </button>
            <button
              onClick={() => { setActiveTab('posts'); setPage(1); setStatusFilter(''); }}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-inputs font-bold transition-all relative text-xs sm:text-sm ${
                activeTab === 'posts'
                  ? 'bg-vast-ink text-pure-white'
                  : 'bg-transparent text-vast-ink border border-vast-ink/20 hover:bg-lumen-stone'
              }`}
            >
              {pendingPostsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-5 h-5 bg-ember-glow text-pure-white text-[10px] font-bold rounded-full shadow-sm animate-pulse">
                  {pendingPostsCount > 9 ? '9+' : pendingPostsCount}
                </span>
              )}
              <Megaphone className="w-5 h-5" />
              <span>Posts</span>
            </button>
          </div>
        </div>

        {/* At a Glance */}
        <div className="bg-lumen-cream p-6 rounded-cards border border-vast-ink/20 flex flex-col justify-center space-y-5 relative overflow-hidden group">
          <h3 className="font-extrabold text-lg text-vast-ink flex items-center gap-2 z-10">
            Review Queue
          </h3>
          <p className="text-sm font-medium text-fog z-10 leading-snug">
            Review, evaluate, and provide official feedback on {assignedSocietyName}'s event proposals, annual plans, and posts.
          </p>

          {/* Status Filter */}
          <div className="relative z-10">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fog pointer-events-none">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full bg-transparent text-vast-ink text-sm font-semibold rounded-inputs border border-vast-ink/20 px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {activeTab === 'plans' && <option value="PENDING">Pending Review</option>}
              {activeTab === 'events' && <option value="PENDING_ADVISOR">Pending Review</option>}
              {activeTab === 'posts' && <option value="PENDING_ADVISOR">Pending Review</option>}
              {activeTab === 'posts' ? (
                <>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </>
              ) : (
                <>
                  <option value="CHANGES_REQUESTED">Changes Requested</option>
                  <option value="APPROVED">Approved</option>
                </>
              )}
              {activeTab === 'plans' && <option value="DRAFT">Draft</option>}
              {activeTab === 'events' && <option value="PUBLISHED">Published</option>}
            </select>
          </div>

          {/* Decorative background */}
          <FileText className="absolute -right-4 -bottom-4 w-40 h-40 text-vast-ink opacity-[0.03] z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="space-y-3">
          <Alert
            variant="error"
            message="Failed to load review queue. Ensure you are an assigned faculty advisor."
          />
          <button
            onClick={() => refetch()}
            className="text-xs text-ember-glow hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Queue Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-transparent p-5 rounded-cards border border-vast-ink/20 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-lumen-stone rounded w-1/3" />
                <div className="h-6 bg-lumen-stone rounded w-24" />
              </div>
              <div className="h-4 bg-lumen-stone rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : activeTab === 'plans' && plans.length === 0 ? (
        <div className="bg-transparent p-12 rounded-cards border border-vast-ink/20 text-center space-y-3 flex flex-col items-center">
          <FileText className="w-12 h-12 text-fog opacity-30" />
          <h3 className="font-bold text-vast-ink text-base">No Yearly Plans Found</h3>
          <p className="text-xs text-fog max-w-sm">
            There are no yearly calendar submissions matching your current filter.
          </p>
        </div>
      ) : activeTab === 'events' && events.length === 0 ? (
        <div className="bg-transparent p-12 rounded-cards border border-vast-ink/20 text-center space-y-3 flex flex-col items-center">
          <Calendar className="w-12 h-12 text-fog opacity-30" />
          <h3 className="font-bold text-vast-ink text-base">No Events Found</h3>
          <p className="text-xs text-fog max-w-sm">
            There are no events matching your current filter for {assignedSocietyName}.
          </p>
        </div>
      ) : activeTab === 'posts' && posts.length === 0 ? (
        <div className="bg-transparent p-12 rounded-cards border border-vast-ink/20 text-center space-y-3 flex flex-col items-center">
          <Megaphone className="w-12 h-12 text-fog opacity-30" />
          <h3 className="font-bold text-vast-ink text-base">No Posts Found</h3>
          <p className="text-xs text-fog max-w-sm">
            There are no announcement posts matching your current filter for {assignedSocietyName}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'plans' ? (
            plans.map((plan) => (
              <Link
                key={plan.id}
                to={`/advisor/yearly-plans/${plan.id}`}
                className="bg-transparent p-5 rounded-cards border border-vast-ink/20 hover:bg-lavender-whisper transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {plan.society?.logoUrl ? (
                    <img
                      src={plan.society.logoUrl}
                      alt={plan.society.name}
                      className="w-12 h-12 rounded-inputs object-cover border border-vast-ink/20 shrink-0"
                    />
                  ) : (
                    <div className="p-3 bg-lumen-stone border border-vast-ink/20 text-vast-ink rounded-inputs shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-vast-ink text-base group-hover:text-ember-glow transition-colors">
                        {plan.society?.name || 'Assigned Society'}
                      </h3>
                      <span className="text-xs font-semibold text-fog">
                        ({plan.year} Calendar)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-fog">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{plan.totalPlannedEvents} Planned Events</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-fog" />
                        <span>
                          Updated:{' '}
                          {new Date(plan.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-vast-ink">
                  {renderStatusBadge(plan.status as any)}

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-ember-glow group-hover:translate-x-1 transition-transform">
                    <span>{plan.status === 'PENDING' ? 'Review Plan' : 'View Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          ) : activeTab === 'events' ? (
            events.map((event: any) => (
              <Link
                key={event.id}
                to={`/advisor/events/${event.id}`}
                className="bg-transparent p-5 rounded-cards border border-vast-ink/20 hover:bg-lavender-whisper transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {event.society?.logoUrl ? (
                    <img
                      src={event.society.logoUrl}
                      alt={event.society.name}
                      className="w-12 h-12 rounded-inputs object-cover border border-vast-ink/20 shrink-0"
                    />
                  ) : (
                    <div className="p-3 bg-lumen-stone border border-vast-ink/20 text-vast-ink rounded-inputs shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-bold text-vast-ink text-base group-hover:text-ember-glow transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-fog">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-vast-ink" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-vast-ink">
                  {renderStatusBadge(event.approvalStatus)}

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-ember-glow group-hover:translate-x-1 transition-transform">
                    <span>{event.approvalStatus === 'PENDING_ADVISOR' ? 'Review Event' : 'View Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            posts.map((post: AdvisorPostItem) => (
              <div
                key={post.id}
                className="bg-transparent p-5 rounded-cards border border-vast-ink/20 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    {post.author?.society?.logoUrl ? (
                      <img
                        src={post.author.society.logoUrl}
                        alt={post.author.society.name}
                        className="w-10 h-10 rounded-inputs object-cover border border-vast-ink/20 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-lumen-stone border border-vast-ink/20 text-vast-ink rounded-inputs shrink-0 font-bold text-sm">
                        {post.author?.society?.name?.[0] || 'S'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-vast-ink text-sm">
                        {post.author?.society?.name || assignedSocietyName}
                      </h4>
                      <p className="text-xs text-fog">
                        Created {new Date(post.createdAt).toLocaleDateString()} at{' '}
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(post.approvalStatus)}
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-sm font-medium text-vast-ink whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                {/* Media Preview */}
                {post.imageUrl && (
                  <div className="rounded-inputs overflow-hidden border border-vast-ink/20 max-h-64 bg-lumen-stone">
                    <img src={post.imageUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                  </div>
                )}
                {post.videoUrl && (
                  <div className="rounded-inputs overflow-hidden border border-vast-ink/20 max-h-64 bg-black">
                    <video src={post.videoUrl} controls className="w-full max-h-64 object-contain" />
                  </div>
                )}

                {/* Advisor Comments if rejected/approved */}
                {post.advisorComments && (
                  <div className="p-3 bg-lumen-stone rounded-inputs border border-vast-ink/20 text-xs space-y-1">
                    <span className="font-bold text-vast-ink flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-ember-glow" /> Advisor Feedback:
                    </span>
                    <p className="text-fog font-medium">{post.advisorComments}</p>
                  </div>
                )}

                {/* Action Buttons for Advisor Review */}
                {post.approvalStatus === 'PENDING_ADVISOR' && (
                  <div className="pt-3 border-t border-vast-ink/20 flex flex-wrap items-center justify-end gap-3">
                    {rejectingPostId === post.id ? (
                      <div className="w-full space-y-3 p-3 bg-lumen-stone rounded-inputs border border-vast-ink/20">
                        <textarea
                          placeholder="Provide optional rejection comments..."
                          value={rejectionComments}
                          onChange={(e) => setRejectionComments(e.target.value)}
                          className="w-full p-2.5 text-xs bg-lumen-cream border border-vast-ink/20 rounded-inputs focus:outline-none focus:ring-1 focus:ring-red-500 text-vast-ink"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setRejectingPostId(null); setRejectionComments(''); }}
                            className="px-3 py-1.5 text-xs font-bold text-fog hover:text-vast-ink"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={processingPostId === post.id}
                            onClick={() => handleRejectPostSubmit(post.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-pure-white text-xs font-bold rounded-inputs hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {processingPostId === post.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          disabled={processingPostId === post.id}
                          onClick={() => setRejectingPostId(post.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent border border-red-400 text-red-500 hover:bg-red-500/10 text-xs font-bold rounded-inputs transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          disabled={processingPostId === post.id}
                          onClick={() => handleApprovePost(post.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-ink text-pure-white hover:bg-forest-ink/90 text-xs font-bold rounded-inputs transition-colors disabled:opacity-50"
                        >
                          {processingPostId === post.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Post</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between pt-4 border-t-2 border-vast-ink text-xs font-semibold text-fog">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} items)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border border-vast-ink/20 rounded-inputs hover:bg-lavender-whisper disabled:opacity-40 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border border-vast-ink/20 rounded-inputs hover:bg-lavender-whisper disabled:opacity-40 transition-colors"
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
