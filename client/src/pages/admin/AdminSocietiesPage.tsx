import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active</span>
          </span>
        );
      case 'UNCONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Unconfigured</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
            <Ban className="w-3.5 h-3.5" />
            <span>Banned</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4 relative px-4">
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <div>
          <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight">
            Societies Management
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            Manage campus student societies, faculty advisor allocations, and account access.
          </p>
        </div>

        <button
          onClick={() => setIsAddSocietyModalOpen(true)}
          className="bg-white text-black border-none py-2.5 px-5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:-translate-y-0.5 shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Society</span>
        </button>
      </div>

      {/* Main Glass Table Container */}
      <div className="w-full bg-white/[0.08] backdrop-blur-[20px] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/20">
        
        {/* Integrated Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search societies by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white/[0.06] hover:bg-white/[0.09] focus:bg-white/[0.1] border border-white/15 focus:border-white/40 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div className="p-12 text-center text-slate-400 font-semibold animate-pulse">
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
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[7%]">
                    Sr.
                  </th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[38%]">
                    Society
                  </th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[28%]">
                    Assigned Advisor
                  </th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[17%] text-center">
                    Status
                  </th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[10%] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {societies.map((society, index) => (
                  <tr
                    key={society.id}
                    onClick={() => navigate(`/admin/societies/${society.id}`)}
                    className="hover:bg-white/[0.05] transition-colors group cursor-pointer"
                  >
                    {/* 1. Sr. */}
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-300 group-last:border-b-0">
                      {String(index + 1 + (page - 1) * 10).padStart(2, '0')}
                    </td>

                    {/* 2. Society Info */}
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-white group-last:border-b-0">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getSocietyLogo(society.logoUrl)}
                          alt={society.name}
                          className="w-10 h-10 rounded-full border border-white/20 object-cover shrink-0 bg-white/5 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/default-society.jpg';
                          }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white text-[15px] truncate group-hover:text-blue-300 transition-colors">
                            {society.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {society.category && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-gray-300 border border-white/10 shrink-0">
                                {society.category.name}
                              </span>
                            )}
                            {society.presidentEmail && (
                              <span className="text-xs text-gray-400 truncate">
                                {society.presidentEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Advisor Info */}
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-300 group-last:border-b-0">
                      {society.advisor ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={getAdvisorLogo(society.advisor.user?.avatarUrl)}
                            alt={society.advisor.user?.fullName}
                            className="w-8 h-8 rounded-full border border-white/20 object-cover shrink-0 bg-white/5"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/default-advisor.jpg';
                            }}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-white truncate">
                              {society.advisor.user?.fullName}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              {society.advisor.department}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10 italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* 4. Status Badge */}
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-center group-last:border-b-0">
                      <div className="flex justify-center">
                        {renderStatusBadge(society.status)}
                      </div>
                    </td>

                    {/* 5. Floating 3-Dots Action Menu */}
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-center group-last:border-b-0">
                      <div className="flex justify-center relative society-actions-menu">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === society.id ? null : society.id);
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            openMenuId === society.id
                              ? 'bg-white/20 border-white/40 text-white shadow-lg'
                              : 'bg-white/5 hover:bg-white/15 border-white/10 text-gray-300 hover:text-white'
                          }`}
                          title="Society Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popover */}
                        {openMenuId === society.id && (
                          <div
                            className="absolute right-0 top-full mt-2 w-52 bg-[#181a20]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. View Full Details */}
                            <Link
                              to={`/admin/societies/${society.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-purple-400" />
                              <span>View Full Details</span>
                            </Link>

                            {/* 2. Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleOpenEdit(society);
                              }}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 text-blue-400" />
                              <span>Edit Society</span>
                            </button>

                            {/* 3. View Public Page */}
                            <Link
                              to={`/societies/${society.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setOpenMenuId(null)}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4 text-emerald-400" />
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
                                className="w-full px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Reactivate Society</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeactivatingSociety(society);
                                }}
                                className="w-full px-4 py-2.5 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                              >
                                <Ban className="w-4 h-4 text-amber-400" />
                                <span>Ban Society</span>
                              </button>
                            )}

                            {/* Divider */}
                            <div className="my-1.5 border-t border-white/10" />

                            {/* 4. Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeletingSociety(society);
                              }}
                              className="w-full px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
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
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-white/10 gap-3 text-slate-400 text-sm">
            <span className="text-xs text-gray-400 font-medium">
              Showing {societies.length} of {meta?.total || societies.length} societies
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="px-2 text-xs font-semibold text-slate-300">
                Page {page} of {meta?.totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta?.totalPages || 1, p + 1))}
                disabled={page === (meta?.totalPages || 1)}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs text-white transition-colors flex items-center gap-1 cursor-pointer"
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
            <div className="modal-box" style={{ maxWidth: '520px' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="modal-title flex items-center gap-2 m-0">
                  <Building2 className="w-5 h-5 text-slate-300" />
                  <span>Edit Society & Reassign Advisor</span>
                </h3>
                <button
                  onClick={() => setEditingSociety(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-full transition-colors cursor-pointer"
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
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

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  className="btn-cancel"
                  style={{ width: 'auto' }}
                  onClick={() => setEditingSociety(null)}
                >
                  Cancel
                </button>
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
