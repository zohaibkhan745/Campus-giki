import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateSocietyQueries } from '@/lib/queryInvalidations';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Ban,
  Trash2,
  Edit3,
  ExternalLink,
  GraduationCap,
  UserCheck,
  Mail,
  Phone,
  Globe,
  Users,
  Copy,
  Check,
  X,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  adminService,
  type AdminSocietyDetail,
  type ExecutiveCouncilMember,
} from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { getSocietyLogo, getAdvisorLogo } from '@/lib/utils';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { BackButton } from '@/components/ui';
import { globalNotification } from '@/contexts/NotificationContext';
import type { AxiosError } from 'axios';

// Social Icon SVGs
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const AdminSocietyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Clipboard copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAdvisorId, setEditAdvisorId] = useState('');

  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch society detail
  const {
    data: society,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminSocietyDetail', id],
    queryFn: () => adminService.getSocietyById(id!),
    enabled: !!id,
  });

  // Query categories for edit modal
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

  // Query available advisors for edit modal
  const { data: advisors = [] } = useQuery({
    queryKey: ['availableAdvisors'],
    queryFn: adminService.getAvailableAdvisors,
  });

  // Mutation: Update Society
  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; categoryId?: string; advisorId?: string | null }) =>
      adminService.updateSociety(id!, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietyDetail', id] });
      void invalidateSocietyQueries(queryClient, id);
      setIsEditModalOpen(false);
      globalNotification.triggerSuccess(`Society "${updated.name}" updated successfully.`);
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      globalNotification.triggerFailed(
        err.response?.data?.message || 'Failed to update society details.',
      );
    },
  });

  // Mutation: Deactivate (Ban)
  const deactivateMutation = useMutation({
    mutationFn: () => adminService.deactivateSociety(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietyDetail', id] });
      void invalidateSocietyQueries(queryClient, id);
      setIsBanModalOpen(false);
      globalNotification.triggerSuccess('Society account has been banned/deactivated.');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      globalNotification.triggerFailed(
        err.response?.data?.message || 'Failed to ban society.',
      );
    },
  });

  // Mutation: Reactivate
  const reactivateMutation = useMutation({
    mutationFn: () => adminService.reactivateSociety(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietyDetail', id] });
      void invalidateSocietyQueries(queryClient, id);
      setIsReactivateModalOpen(false);
      globalNotification.triggerSuccess('Society account has been reactivated successfully.');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      globalNotification.triggerFailed(
        err.response?.data?.message || 'Failed to reactivate society.',
      );
    },
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteSociety(id!),
    onSuccess: () => {
      void invalidateSocietyQueries(queryClient, id);
      setIsDeleteModalOpen(false);
      globalNotification.triggerSuccess('Society has been permanently removed.');
      navigate('/admin/societies', { replace: true });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      globalNotification.triggerFailed(
        err.response?.data?.message || 'Failed to delete society.',
      );
    },
  });

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOpenEdit = () => {
    if (!society) return;
    setEditName(society.name || '');
    setEditCategoryId(society.category?.id || '');
    setEditAdvisorId(society.advisor?.id || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      globalNotification.triggerFailed('Society name cannot be empty.');
      return;
    }
    updateMutation.mutate({
      name: editName.trim(),
      categoryId: editCategoryId || undefined,
      advisorId: editAdvisorId || null,
    });
  };

  // Helper to parse executive council
  const parseCouncil = (rawCouncil?: string | null): ExecutiveCouncilMember[] => {
    if (!rawCouncil) return [];
    try {
      const parsed = JSON.parse(rawCouncil);
      if (!Array.isArray(parsed)) return [];
      const mandatoryOrder = [
        'Vice President',
        'Event Coordinator',
        'General Secretary',
        'Treasurer',
        'Director Liaison',
      ];
      return parsed.sort((a: ExecutiveCouncilMember, b: ExecutiveCouncilMember) => {
        const aIdx = mandatoryOrder.indexOf(a.role);
        const bIdx = mandatoryOrder.indexOf(b.role);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return (a.role || '').localeCompare(b.role || '');
      });
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-blue-500" />
        <p className="text-sm font-semibold text-text-secondary">Loading society profile details...</p>
      </div>
    );
  }

  if (isError || !society) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <ErrorState
          error={error}
          title={isError ? undefined : 'Society Not Found'}
          message={
            isError
              ? 'Could not retrieve society information from the server.'
              : 'The requested society does not exist or may have been removed.'
          }
          onRetry={isError ? () => refetch() : undefined}
          secondaryAction={{
            label: 'Back to Societies',
            to: '/admin/societies',
          }}
        />
      </div>
    );
  }

  const councilMembers = parseCouncil(society.executiveCouncil);
  const totalCouncilCount = (society.presidentName ? 1 : 0) + councilMembers.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4 relative px-4">
      {/* Top Back Button */}
      <div className="flex items-center">
        <BackButton to="/admin/societies" title="Back to Societies" variant="inline" />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary pl-1">
        <Link to="/admin/societies" className="hover:text-text-primary transition-colors">
          Societies Management
        </Link>
        <span>/</span>
        <span className="text-text-primary truncate max-w-[200px] sm:max-w-md">{society.name}</span>
      </div>

      {/* Hero Header Glass Card */}
      <div className="relative rounded-3xl overflow-hidden bg-surface-glass backdrop-blur-xl border border-border-medium shadow-elevation-2">
        {/* Banner Backdrop */}
        <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900/60">
          {society.bannerUrl ? (
            <img
              src={society.bannerUrl}
              alt={`${society.name} Banner`}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
        </div>

        {/* Profile Info Row */}
        <div className="relative px-6 sm:px-8 pb-8 pt-0 -mt-16 sm:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Society Logo */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-surface-elevated border-2 border-border-medium shadow-2xl p-1.5 shrink-0 overflow-hidden">
              <img
                src={getSocietyLogo(society.logoUrl)}
                alt={society.name}
                className="w-full h-full rounded-[20px] object-cover bg-white/5"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/default-society.jpg';
                }}
              />
            </div>

            {/* Title & Metadata */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary tracking-tight leading-tight">
                  {society.name}
                </h1>
                {society.shortform && society.shortform !== 'NA' && (
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-surface-glass text-blue-600 dark:text-blue-300 border border-border-subtle">
                    {society.shortform}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {society.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-glass text-text-secondary border border-border-subtle">
                    {society.category.name}
                  </span>
                )}

                {/* Status Badge */}
                {society.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
                {society.status === 'UNCONFIGURED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Setup Pending</span>
                  </span>
                )}
                {society.status === 'INACTIVE' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                    <Ban className="w-3.5 h-3.5" />
                    <span>Banned / Inactive</span>
                  </span>
                )}

                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  Registered {new Date(society.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            {/* View Public Page Link */}
            <Link
              to={`/societies/${society.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover border border-border-medium text-text-primary transition-all shadow-elevation-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Public Page</span>
            </Link>

            {/* Edit Society Button */}
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover border border-border-medium text-text-primary transition-all shadow-elevation-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Edit Details</span>
            </button>

            {/* Ban / Reactivate Button */}
            {society.status === 'INACTIVE' ? (
              <button
                type="button"
                onClick={() => setIsReactivateModalOpen(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reactivate</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsBanModalOpen(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 transition-all shadow-md cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Ban Society</span>
              </button>
            )}

            {/* Delete Society Button */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 transition-all shadow-md cursor-pointer"
              title="Delete Society"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-2xl p-4 flex items-center gap-3.5 shadow-elevation-1">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xl sm:text-2xl font-black text-text-primary block leading-none">
              {society._count?.events ?? 0}
            </span>
            <span className="text-xs text-text-secondary font-medium">Total Events</span>
          </div>
        </div>

        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-2xl p-4 flex items-center gap-3.5 shadow-elevation-1">
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xl sm:text-2xl font-black text-text-primary block leading-none">
              {society._count?.yearlyPlans ?? 0}
            </span>
            <span className="text-xs text-text-secondary font-medium">Yearly Plans</span>
          </div>
        </div>

        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-2xl p-4 flex items-center gap-3.5 shadow-elevation-1">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xl sm:text-2xl font-black text-text-primary block leading-none">
              {totalCouncilCount}
            </span>
            <span className="text-xs text-text-secondary font-medium">Cabinet Members</span>
          </div>
        </div>

        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-2xl p-4 flex items-center gap-3.5 shadow-elevation-1">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              society.isSetupComplete
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400'
            }`}
          >
            {society.isSetupComplete ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <span
              className={`text-sm sm:text-base font-bold block leading-tight truncate ${
                society.isSetupComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {society.isSetupComplete ? 'Complete' : 'Pending'}
            </span>
            <span className="text-xs text-text-secondary font-medium">Profile Setup</span>
          </div>
        </div>
      </div>

      {/* Primary Leadership Cards: Advisor & President */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faculty Advisor Card */}
        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards p-6 shadow-elevation-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary leading-tight">Faculty Advisor</h2>
                  <p className="text-xs text-text-secondary">Official DSA academic supervisor</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenEdit}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>

            {society.advisor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={getAdvisorLogo(society.advisor.user?.avatarUrl)}
                    alt={society.advisor.user?.fullName}
                    className="w-14 h-14 rounded-2xl border border-border-medium object-cover bg-surface-hover shrink-0 shadow-md"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/default-advisor.jpg';
                    }}
                  />
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-extrabold text-lg text-text-primary truncate">
                      {society.advisor.user?.fullName || 'N/A'}
                    </h3>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-300">
                      {society.advisor.designation}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {society.advisor.department}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {society.advisor.user?.email && (
                    <div className="bg-surface-hover/50 border border-border-subtle rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-text-muted shrink-0" />
                        <a
                          href={`mailto:${society.advisor.user.email}`}
                          className="text-xs text-text-primary hover:underline truncate font-medium"
                        >
                          {society.advisor.user.email}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(society.advisor!.user!.email, 'advisor-email')}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedField === 'advisor-email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {society.advisor.phoneNumber && (
                    <div className="bg-surface-hover/50 border border-border-subtle rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="text-xs text-text-primary font-mono truncate">
                          {society.advisor.phoneNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(society.advisor!.phoneNumber!, 'advisor-phone')}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedField === 'advisor-phone' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">No Advisor Assigned</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Assign a faculty advisor to enable yearly plans & event approvals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm cursor-pointer"
                >
                  Assign Advisor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Society President Card */}
        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards p-6 shadow-elevation-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary leading-tight">Society President</h2>
                  <p className="text-xs text-text-secondary">Elected student representative & account lead</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                President
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-300 text-xl font-black shrink-0 shadow-md">
                  {(society.presidentName || society.user?.fullName || society.name)
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="font-extrabold text-lg text-text-primary truncate">
                    {society.presidentName || society.user?.fullName || 'Not Specified'}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {society.presidentFaculty && (
                      <span className="font-medium text-amber-600 dark:text-amber-300">
                        {society.presidentFaculty}
                      </span>
                    )}
                    {society.presidentRegNum && (
                      <span className="font-mono text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-border-subtle">
                        Reg: {society.presidentRegNum}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {society.presidentEmail && (
                  <div className="bg-surface-hover/50 border border-border-subtle rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-text-muted shrink-0" />
                      <a
                        href={`mailto:${society.presidentEmail}`}
                        className="text-xs text-text-primary hover:underline truncate font-medium"
                      >
                        {society.presidentEmail}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(society.presidentEmail, 'pres-email')}
                      className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === 'pres-email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {society.presidentContact && (
                  <div className="bg-surface-hover/50 border border-border-subtle rounded-xl p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="w-4 h-4 text-text-muted shrink-0" />
                      <span className="text-xs text-text-primary font-mono truncate">
                        {society.presidentContact}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(society.presidentContact!, 'pres-phone')}
                      className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === 'pres-phone' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Council (EC) Section */}
      <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards p-6 shadow-elevation-1 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-brand-primary" />
              <h2 className="text-xl font-bold text-text-primary">Executive Council (EC) Cabinet</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                {totalCouncilCount} Members
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Active office bearers managing society operations for the current tenure.
            </p>
          </div>
        </div>

        {totalCouncilCount === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Users className="w-10 h-10 text-text-muted mx-auto" />
            <p className="text-sm font-semibold text-text-secondary">No Executive Council Submitted</p>
            <p className="text-xs text-text-muted">
              The society has not finalized or submitted its cabinet roster in the portal yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left min-w-[750px]">
              <thead>
                <tr>
                  <th className="p-3 text-text-secondary text-xs uppercase tracking-wider border-b border-border-subtle font-semibold w-[7%]">
                    Sr.
                  </th>
                  <th className="p-3 text-text-secondary text-xs uppercase tracking-wider border-b border-border-subtle font-semibold w-[25%]">
                    Member Name
                  </th>
                  <th className="p-3 text-text-secondary text-xs uppercase tracking-wider border-b border-border-subtle font-semibold w-[20%]">
                    Designated Role
                  </th>
                  <th className="p-3 text-text-secondary text-xs uppercase tracking-wider border-b border-border-subtle font-semibold w-[20%]">
                    Faculty / Dept
                  </th>
                  <th className="p-3 text-text-secondary text-xs uppercase tracking-wider border-b border-border-subtle font-semibold w-[28%]">
                    Contact & Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* 1. President */}
                {society.presidentName && (
                  <tr className="border-b border-border-subtle hover:bg-surface-hover transition-colors bg-amber-500/[0.03]">
                    <td className="p-3.5 text-xs font-bold text-amber-600 dark:text-amber-400">01</td>
                    <td className="p-3.5 text-sm font-bold text-text-primary">
                      {society.presidentName}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        President
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-text-secondary">
                      {society.presidentFaculty || 'N/A'}
                    </td>
                    <td className="p-3.5 text-xs text-text-secondary">
                      <div className="flex flex-col">
                        <a
                          href={`mailto:${society.presidentEmail}`}
                          className="text-brand-primary hover:underline transition-colors"
                        >
                          {society.presidentEmail}
                        </a>
                        {society.presidentContact && (
                          <span className="text-[11px] text-text-muted font-mono mt-0.5">
                            {society.presidentContact}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {/* 2. Council Members */}
                {councilMembers.map((member, idx) => {
                  const srNum = (society.presidentName ? idx + 2 : idx + 1)
                    .toString()
                    .padStart(2, '0');
                  const isCoreRole = [
                    'Vice President',
                    'Event Coordinator',
                    'General Secretary',
                    'Treasurer',
                    'Director Liaison',
                  ].includes(member.role);

                  return (
                    <tr
                      key={idx}
                      className="border-b border-border-subtle hover:bg-surface-hover transition-colors last:border-b-0"
                    >
                      <td className="p-3.5 text-xs text-text-muted font-mono">{srNum}</td>
                      <td className="p-3.5 text-sm font-semibold text-text-primary">
                        {member.name || 'N/A'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isCoreRole
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-surface-glass text-text-secondary border border-border-subtle'
                          }`}
                        >
                          {member.role || 'Member'}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-text-secondary">
                        {member.faculty || 'N/A'}
                      </td>
                      <td className="p-3.5 text-xs text-text-secondary">
                        <div className="flex flex-col">
                          {member.email ? (
                            <a
                              href={`mailto:${member.email}`}
                              className="text-brand-primary hover:underline transition-colors"
                            >
                              {member.email}
                            </a>
                          ) : (
                            <span className="text-text-muted italic">No email provided</span>
                          )}
                          {member.contact && (
                            <span className="text-[11px] text-text-muted font-mono mt-0.5">
                              {member.contact}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Faculty Advisor Row at Bottom of Roster */}
                {society.advisor && (
                  <tr className="border-t-2 border-border-medium bg-purple-500/[0.04] hover:bg-purple-500/[0.07] transition-colors">
                    <td className="p-3.5 text-xs font-bold text-purple-600 dark:text-purple-400">FA</td>
                    <td className="p-3.5 text-sm font-bold text-text-primary">
                      {society.advisor.user?.fullName || 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                        Faculty Advisor
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-text-secondary">
                      {society.advisor.department}
                    </td>
                    <td className="p-3.5 text-xs text-text-secondary">
                      <div className="flex flex-col">
                        <a
                          href={`mailto:${society.advisor.user?.email}`}
                          className="text-purple-600 dark:text-purple-300 hover:underline transition-colors"
                        >
                          {society.advisor.user?.email}
                        </a>
                        {society.advisor.phoneNumber && (
                          <span className="text-[11px] text-text-muted font-mono mt-0.5">
                            {society.advisor.phoneNumber}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* About & Social Media Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description (2 cols) */}
        <div className="lg:col-span-2 bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Building2 className="w-5 h-5 text-text-muted" />
            <h2 className="text-lg font-bold text-text-primary">About the Society</h2>
          </div>

          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            {society.shortDescription && (
              <p className="font-medium text-text-primary bg-surface-hover/50 p-4 rounded-2xl border border-border-subtle">
                {society.shortDescription}
              </p>
            )}

            {society.longDescription ? (
              <p className="whitespace-pre-line text-text-secondary">
                {society.longDescription}
              </p>
            ) : !society.shortDescription ? (
              <p className="text-text-muted italic py-4">
                No description or mission statement has been provided yet.
              </p>
            ) : null}
          </div>
        </div>

        {/* Contact & Social Links (1 col) */}
        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
            <Globe className="w-5 h-5 text-text-muted" />
            <h2 className="text-lg font-bold text-text-primary">Online Presence</h2>
          </div>

          <div className="space-y-2.5">
            {society.email && (
              <a
                href={`mailto:${society.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all text-xs"
              >
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{society.email}</span>
              </a>
            )}

            {society.website && (
              <a
                href={society.website.startsWith('http') ? society.website : `https://${society.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all text-xs"
              >
                <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Official Website</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
              </a>
            )}

            {society.instagram && (
              <a
                href={society.instagram.startsWith('http') ? society.instagram : `https://instagram.com/${society.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all text-xs"
              >
                <InstagramIcon className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="truncate">Instagram</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
              </a>
            )}

            {society.linkedin && (
              <a
                href={society.linkedin.startsWith('http') ? society.linkedin : `https://linkedin.com/company/${society.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all text-xs"
              >
                <LinkedinIcon className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">LinkedIn</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
              </a>
            )}

            {society.facebook && (
              <a
                href={society.facebook.startsWith('http') ? society.facebook : `https://facebook.com/${society.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all text-xs"
              >
                <FacebookIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">Facebook</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
              </a>
            )}

            {!society.email && !society.website && !society.instagram && !society.linkedin && !society.facebook && (
              <p className="text-xs text-text-muted italic py-4 text-center">
                No social links or public email configured yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Events & Yearly Plans Summary Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events Preview */}
        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-text-primary">Recent Events</h2>
            </div>
            <Link
              to="/admin/events"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              All Events
            </Link>
          </div>

          {society.events && society.events.length > 0 ? (
            <div className="space-y-3">
              {society.events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-surface border border-border-subtle hover:border-border-medium rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-bold text-text-primary truncate">{ev.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : ev.approvalStatus === 'PENDING_ADMIN'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-surface-hover text-text-muted border border-border-subtle'
                      }`}
                    >
                      {ev.approvalStatus.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/admin/events/${ev.id}`}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
                      title="Review Event"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-text-muted text-xs italic">
              No campus events submitted by this society yet.
            </div>
          )}
        </div>

        {/* Yearly Plans Preview */}
        <div className="bg-surface-glass backdrop-blur-xl border border-border-medium rounded-cards p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-text-primary">Yearly Calendar Plans</h2>
            </div>
            <Link
              to="/admin/yearly-plans"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              All Plans
            </Link>
          </div>

          {society.yearlyPlans && society.yearlyPlans.length > 0 ? (
            <div className="space-y-3">
              {society.yearlyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-surface border border-border-subtle hover:border-border-medium rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-bold text-text-primary">Academic Calendar {plan.year}</h3>
                    <p className="text-xs text-text-secondary">
                      Created on {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        plan.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : plan.status === 'PENDING_ADMIN'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-surface-hover text-text-muted border border-border-subtle'
                      }`}
                    >
                      {plan.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/admin/yearly-plans/${plan.id}`}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
                      title="View Plan Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-text-muted text-xs italic">
              No yearly calendar plans submitted yet.
            </div>
          )}
        </div>
      </div>

      {/* Edit Society Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !updateMutation.isPending && setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-surface backdrop-blur-2xl border border-border-medium rounded-cards shadow-elevation-3 p-6 overflow-hidden flex flex-col gap-5 text-text-primary">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-500 dark:text-blue-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Edit Society Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                disabled={updateMutation.isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Society Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface border border-border-medium focus:border-brand-primary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <CustomDropdown
                  options={[
                    { value: '', label: 'No Category Assigned' },
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  value={editCategoryId}
                  onChange={(val: string) => setEditCategoryId(val)}
                  placeholder="Select Category"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Faculty Advisor
                </label>
                <CustomDropdown
                  options={[
                    { value: '', label: 'Unassigned (No Advisor)' },
                    ...advisors.map((adv) => ({
                      value: adv.id,
                      label: `${adv.user?.fullName} (${adv.designation}, ${adv.department})`,
                    })),
                  ]}
                  value={editAdvisorId}
                  onChange={(val: string) => setEditAdvisorId(val)}
                  placeholder="Select Faculty Advisor"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-text-primary text-text-inverse hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-elevation-1 disabled:opacity-50"
                >
                  {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Ban Society */}
      <ConfirmModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={() => deactivateMutation.mutate()}
        title="Ban Society"
        message={`Are you sure you want to ban "${society.name}"? The society portal access will be suspended and upcoming events hidden from public view.`}
        confirmText="Ban Society"
        cancelText="Cancel"
        isLoading={deactivateMutation.isPending}
        variant="warning"
      />

      {/* Confirmation Modal: Reactivate Society */}
      <ConfirmModal
        isOpen={isReactivateModalOpen}
        onClose={() => setIsReactivateModalOpen(false)}
        onConfirm={() => reactivateMutation.mutate()}
        title="Reactivate Society"
        message={`Restore active status for "${society.name}"? The president and society administrators will regain login access.`}
        confirmText="Reactivate Society"
        cancelText="Cancel"
        isLoading={reactivateMutation.isPending}
        variant="success"
      />

      {/* Confirmation Modal: Delete Society */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Society Permanently"
        message={`Are you completely sure you want to delete "${society.name}"? This will permanently wipe the society profile and its linked credentials.`}
        confirmText="Yes, Delete Permanently"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
};
