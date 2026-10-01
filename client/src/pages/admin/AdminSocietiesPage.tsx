import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { invalidateSocietyQueries } from '@/lib/queryInvalidations';
import { useDebounce } from '@/hooks/useDebounce';
import { getSocietyLogo, getAdvisorLogo } from '@/lib/utils';
import {
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Ban,
  Edit3,
  Plus,
  ArrowLeft,
  Trash2,
  MoreVertical,
  ExternalLink,
  Eye,
  X,
} from 'lucide-react';
import {
  adminService,
  type AdminSocietyItem,
  type AdminSocietyStatusType,
} from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { BackButton } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { OnboardSocietyModal } from '@/components/admin/OnboardSocietyModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AxiosError } from 'axios';

export const AdminSocietiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 250);

  // Actions Dropdown State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Dialog & Modal States
  const [isAddSocietyModalOpen, setIsAddSocietyModalOpen] = useState(false);
  const [editingSociety, setEditingSociety] = useState<AdminSocietyItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAdvisorId, setEditAdvisorId] = useState('');

  const [deactivatingSociety, setDeactivatingSociety] = useState<AdminSocietyItem | null>(null);
  const [reactivatingSociety, setReactivatingSociety] = useState<AdminSocietyItem | null>(null);
  const [deletingSociety, setDeletingSociety] = useState<AdminSocietyItem | null>(null);

  // Close actions menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.society-actions-menu')) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Lock body scroll when modals are open
  useEffect(() => {
    if (isAddSocietyModalOpen || editingSociety || deactivatingSociety || reactivatingSociety || deletingSociety) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isAddSocietyModalOpen, editingSociety, deactivatingSociety, reactivatingSociety, deletingSociety]);

  // Query categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

  // Query advisors
  const { data: advisors = [] } = useQuery({
    queryKey: ['availableAdvisors'],
    queryFn: adminService.getAvailableAdvisors,
  });

  // Query societies list
  const {
    data: societiesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminSocietiesList', page, statusFilter, categoryFilter, debouncedSearch],
    queryFn: () =>
      adminService.getAllSocieties({
        page,
        limit: 10,
        status: (statusFilter as AdminSocietyStatusType) || undefined,
        category: categoryFilter || undefined,
        search: debouncedSearch || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const societies = societiesData?.items || [];
  const meta = societiesData?.meta;

  // Edit Mutation
  const updateMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: { id: string; payload: { name?: string; categoryId?: string; advisorId?: string | null } }) =>
      adminService.updateSociety(data.id, data.payload),
    onSuccess: (_, variables) => {
      void invalidateSocietyQueries(queryClient, variables.id);
      setEditingSociety(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      console.error('Update failed:', error);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    meta: { notify: true },
    mutationFn: (id: string) => adminService.deleteSociety(id),
    onSuccess: (_, id) => {
      void invalidateSocietyQueries(queryClient, id);
      setDeletingSociety(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      console.error('Delete failed:', error);
    },
  });

  // Deactivate (Ban) Mutation
  const deactivateMutation = useMutation({
    meta: { notify: true },
    mutationFn: (id: string) => adminService.deactivateSociety(id),
    onSuccess: (_, id) => {
      void invalidateSocietyQueries(queryClient, id);
      setDeactivatingSociety(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      console.error('Deactivate failed:', error);
    },
  });

  // Reactivate Mutation
  const reactivateMutation = useMutation({
    meta: { notify: true },
    mutationFn: (id: string) => adminService.reactivateSociety(id),
    onSuccess: (_, id) => {
      void invalidateSocietyQueries(queryClient, id);
      setReactivatingSociety(null);
    },
    onError: (error: any) => {
      console.error('Reactivate failed:', error);
    },
  });

  const handleOpenEdit = (society: AdminSocietyItem) => {
    setEditingSociety(society);
    setEditName(society.name);
    setEditCategoryId(society.category?.id || '');
    setEditAdvisorId(society.advisor?.id || '');
  };

  const handleSaveEdit = () => {
    if (!editingSociety) return;
    updateMutation.mutate({
      id: editingSociety.id,
      payload: {
        name: editName.trim() || undefined,
        categoryId: editCategoryId || undefined,
        advisorId: editAdvisorId || null,
      },
    });
  };

  const renderStatusBadge = (status: AdminSocietyStatusType) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active</span>
          </span>
        );
      case 'UNCONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Unconfigured</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
            <Ban className="w-3.5 h-3.5" />
            <span>Banned</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4 relative px-4">
      {/* Top Back Navigation */}
      <BackButton />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 sm:py-6">
        <div>
          <h1 className="font-extrabold text-4xl sm:text-5xl text-text-primary tracking-tight leading-tight">
            Societies Management
          </h1>
          <p className="text-text-secondary text-sm mt-2 font-medium">
            Manage campus student societies, faculty advisor allocations, and account access.
          </p>
        </div>

        <button
          onClick={() => setIsAddSocietyModalOpen(true)}
          className="bg-brand-primary text-white border-none py-2.5 px-5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-brand-primary-hover hover:-translate-y-0.5 shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Society</span>
        </button>
      </div>

      {/* Main Glass Table Container */}
      <div className="w-full bg-surface-card backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-card border border-border-subtle">
        {/* Integrated Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search societies by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-elevated/60 hover:bg-surface-elevated focus:bg-surface-elevated border border-border-medium focus:border-brand-primary rounded-xl pl-10 pr-9 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>


          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            <div className="w-44">
              <CustomDropdown
                value={categoryFilter}
                onChange={(e: any) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c: any) => ({ value: c.id, label: c.name })),
                ]}
                placeholder="Category: All"
              />
            </div>

            {/* Status Filter */}
            <div className="w-40">
              <CustomDropdown
                value={statusFilter}
                onChange={(e: any) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Banned' },
                  { value: 'UNCONFIGURED', label: 'Unconfigured' },
                ]}
                placeholder="Status: All"
              />
            </div>

            {/* Clear All Filters */}
            {(searchQuery || categoryFilter || statusFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  setStatusFilter('');
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-surface-elevated hover:bg-surface-hover border border-border-subtle transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Reset filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-text-muted font-semibold animate-pulse">
            Loading societies...
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} compact />
        ) : societies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Societies Found"
            description={
              statusFilter || categoryFilter || searchQuery
                ? 'No campus societies match the selected filters.'
                : 'No campus societies are currently registered in the system.'
            }
            onClearFilters={
              statusFilter || categoryFilter || searchQuery
                ? () => {
                    setStatusFilter('');
                    setCategoryFilter('');
                    setSearchQuery('');
                    setPage(1);
                  }
                : undefined
            }
            compact
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left min-w-[850px]">
              <thead>
                <tr>
                  <th className="p-[15px] text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border-subtle w-[7%]">
                    Sr.
                  </th>
                  <th className="p-[15px] text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border-subtle w-[38%]">
                    Society
                  </th>
                  <th className="p-[15px] text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border-subtle w-[28%]">
                    Assigned Advisor
                  </th>
                  <th className="p-[15px] text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border-subtle w-[17%] text-center">
                    Status
                  </th>
                  <th className="p-[15px] text-text-muted text-xs uppercase tracking-wider font-semibold border-b border-border-subtle w-[10%] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {societies.map((society, index) => (
                  <tr
                    key={society.id}
                    onClick={() => navigate(`/admin/societies/${society.id}`)}
                    className="hover:bg-surface-hover/50 transition-colors group cursor-pointer"
                  >
                    {/* 1. Sr. */}
                    <td className="py-[16px] px-[15px] text-sm border-b border-border-subtle/50 text-text-secondary group-last:border-b-0">
                      {String(index + 1 + (page - 1) * 10).padStart(2, '0')}
                    </td>

                    {/* 2. Society Info */}
                    <td className="py-[16px] px-[15px] text-sm border-b border-border-subtle/50 text-text-primary group-last:border-b-0">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getSocietyLogo(society.logoUrl)}
                          alt={society.name}
                          className="w-10 h-10 rounded-full border border-border-subtle object-cover shrink-0 bg-surface-elevated group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/default-society.jpg';
                          }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-text-primary text-sm truncate group-hover:text-brand-primary transition-colors">
                            {society.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {society.category && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-elevated text-text-secondary border border-border-subtle shrink-0">
                                {society.category.name}
                              </span>
                            )}
                            {society.presidentEmail && (
                              <span className="text-xs text-text-muted truncate">
                                {society.presidentEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Advisor Info */}
                    <td className="py-[16px] px-[15px] text-sm border-b border-border-subtle/50 text-text-secondary group-last:border-b-0">
                      {society.advisor ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getAdvisorLogo(society.advisor.user?.avatarUrl)}
                            alt={society.advisor.user?.fullName}
                            className="w-8 h-8 rounded-full border border-border-subtle object-cover shrink-0 bg-surface-elevated"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/default-advisor.jpg';
                            }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-text-primary truncate">
                              {society.advisor.user?.fullName}
                            </span>
                            <span className="text-xs text-text-muted font-mono">
                              {society.advisor.department}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-surface-elevated text-text-muted border border-border-subtle italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* 4. Status Badge */}
                    <td className="py-[16px] px-[15px] text-sm border-b border-border-subtle/50 text-center group-last:border-b-0">
                      <div className="flex justify-center">
                        {renderStatusBadge(society.status)}
                      </div>
                    </td>

                    {/* 5. Floating 3-Dots Action Menu */}
                    <td className="py-[16px] px-[15px] text-sm border-b border-border-subtle/50 text-center group-last:border-b-0">
                      <div className="flex justify-center relative society-actions-menu">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === society.id ? null : society.id);
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            openMenuId === society.id
                              ? 'bg-surface-elevated border-brand-primary text-text-primary shadow-sm'
                              : 'bg-surface-elevated hover:bg-surface-hover border-border-subtle text-text-secondary hover:text-text-primary'
                          }`}
                          title="Society Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popover */}
                        {openMenuId === society.id && (
                          <div
                            className="absolute right-0 top-full mt-2 w-52 bg-surface-elevated/95 backdrop-blur-2xl border border-border-subtle rounded-2xl shadow-elevation-2 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. View Full Details */}
                            <Link
                              to={`/admin/societies/${society.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                              <span>View Full Details</span>
                            </Link>

                            {/* 2. Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleOpenEdit(society);
                              }}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 text-brand-primary" />
                              <span>Edit Society</span>
                            </button>

                            {/* 3. View Public Page */}
                            <Link
                              to={`/societies/${society.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setOpenMenuId(null)}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                              <span>View Public Page</span>
                            </Link>

                            {/* 3. Ban or Reactivate */}
                            {society.status === 'INACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setReactivatingSociety(society);
                                }}
                                className="w-full px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Reactivate Society</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeactivatingSociety(society);
                                }}
                                className="w-full px-4 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                              >
                                <Ban className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>Ban Society</span>
                              </button>
                            )}

                            {/* Divider */}
                            <div className="my-1.5 border-t border-border-subtle" />

                            {/* 4. Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeletingSociety(society);
                              }}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                              <span>Delete Society</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {(meta?.totalPages || 1) > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-border-subtle gap-3 text-text-muted text-sm">
            <span className="text-xs text-text-muted font-medium">
              Showing {societies.length} of {meta?.total || societies.length} societies
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="px-2 text-xs font-semibold text-text-secondary">
                Page {page} of {meta?.totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta?.totalPages || 1, p + 1))}
                disabled={page === (meta?.totalPages || 1)}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Edit & Reassign Advisor Modal (Glassmorphic Design System) */}
      {editingSociety &&
        createPortal(
          <div className="modal-overlay active">
            <div className="modal-box max-w-xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="modal-title flex items-center gap-2 m-0 text-text-primary font-bold">
                  <Building2 className="w-5 h-5 text-brand-primary" />
                  <span>Edit Society & Reassign Advisor</span>
                </h3>
                <button
                  onClick={() => setEditingSociety(null)}
                  className="p-1.5 text-text-muted hover:text-text-primary rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Society Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. SoftDesk"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Category
                  </label>
                  <CustomDropdown
                    value={editCategoryId}
                    onChange={(e: any) => setEditCategoryId(e.target.value)}
                    options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                    placeholder="Select Category"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Assigned Faculty Advisor
                  </label>
                  <CustomDropdown
                    value={editAdvisorId}
                    onChange={(e: any) => setEditAdvisorId(e.target.value)}
                    options={[
                      { value: '', label: 'None / Unassign Advisor' },
                      ...advisors.map((a: any) => ({
                        value: a.id,
                        label: `${a.user?.fullName || 'Unknown'} (${a.department || 'N/A'})`,
                      })),
                    ]}
                    placeholder="Select Faculty Advisor"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSociety(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  isLoading={updateMutation.isPending}
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 2. Ban Society Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deactivatingSociety}
        onClose={() => setDeactivatingSociety(null)}
        onConfirm={() => {
          if (deactivatingSociety) {
            deactivateMutation.mutate(deactivatingSociety.id);
          }
        }}
        title="Ban Society Account?"
        message={`Are you sure you want to ban "${deactivatingSociety?.name}"? This will suspend login access for the society president. Historical events, posts, and records will remain safely intact.`}
        confirmText="Ban Society"
        variant="warning"
        isLoading={deactivateMutation.isPending}
      />

      {/* 3. Reactivate Society Confirmation Modal */}
      <ConfirmModal
        isOpen={!!reactivatingSociety}
        onClose={() => setReactivatingSociety(null)}
        onConfirm={() => {
          if (reactivatingSociety) {
            reactivateMutation.mutate(reactivatingSociety.id);
            setReactivatingSociety(null);
          }
        }}
        title="Reactivate Society Account?"
        message={`Are you sure you want to reactivate "${reactivatingSociety?.name}"? This will immediately restore login access and all privileges for the society president.`}
        confirmText="Reactivate Society"
        variant="success"
        isLoading={reactivateMutation.isPending}
      />

      {/* 4. Delete Society Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingSociety}
        onClose={() => setDeletingSociety(null)}
        onConfirm={() => {
          if (deletingSociety) {
            deleteMutation.mutate(deletingSociety.id);
          }
        }}
        title="Delete Society Permanently?"
        message={`Are you sure you want to permanently delete "${deletingSociety?.name}"? This will permanently delete the society, all associated events, posts, and yearly plans. This action cannot be undone.`}
        confirmText="Delete Society"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* 5. Onboard Society Modal */}
      <OnboardSocietyModal
        isOpen={isAddSocietyModalOpen}
        onClose={() => setIsAddSocietyModalOpen(false)}
      />
    </div>
  );
};
