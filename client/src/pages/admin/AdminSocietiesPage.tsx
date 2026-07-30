import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Tag,
  KeyRound,
  UserX,
  Edit,
  Plus,
  Copy,
  Check,
  Sparkles,
  FilterX,
  ArrowLeft,
} from 'lucide-react';
import {
  adminService,
  type AdminSocietyItem,
  type AdminSocietyStatusType,
  type ResetPasswordResult,
} from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const AdminSocietiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog & Modal States
  const [editingSociety, setEditingSociety] = useState<AdminSocietyItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAdvisorId, setEditAdvisorId] = useState('');

  const [deactivatingSociety, setDeactivatingSociety] = useState<AdminSocietyItem | null>(null);
  const [resetCredentialsData, setResetCredentialsData] = useState<ResetPasswordResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
    refetch,
  } = useQuery({
    queryKey: ['adminSocietiesList', page, statusFilter, categoryFilter, searchQuery],
    queryFn: () =>
      adminService.getAllSocieties({
        page,
        limit: 10,
        status: (statusFilter as AdminSocietyStatusType) || undefined,
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
      }),
  });

  const societies = societiesData?.items || [];
  const meta = societiesData?.meta;

  // Edit Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; payload: { name?: string; categoryId?: string; advisorId?: string | null } }) =>
      adminService.updateSociety(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
      setEditingSociety(null);
      setActionError(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update society.');
    },
  });

  // Reset Credentials Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => adminService.resetSocietyPassword(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
      setResetCredentialsData(data);
      setActionError(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to reset password.');
    },
  });

  // Deactivate Mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminService.deactivateSociety(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
      setDeactivatingSociety(null);
      setActionError(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to deactivate society.');
    },
  });

  const handleOpenEdit = (society: AdminSocietyItem) => {
    setEditingSociety(society);
    setEditName(society.name);
    setEditCategoryId(society.category?.id || '');
    setEditAdvisorId(society.advisor?.id || '');
    setActionError(null);
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

  const handleCopyResetCredentials = () => {
    if (!resetCredentialsData) return;
    const textToCopy = `Society: ${resetCredentialsData.societyName}\nSociety Email: ${resetCredentialsData.presidentEmail}\nNew Password: ${resetCredentialsData.temporaryPassword}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderStatusBadge = (status: AdminSocietyStatusType) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-forest-ink border border-emerald-500/20 text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ACTIVE</span>
          </span>
        );
      case 'UNCONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-ember-glow border border-amber-500/20 text-ember-glow rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>UNCONFIGURED</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pure-white border border-vast-ink border border-red-500/20 text-red-400 rounded-inputs text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>INACTIVE</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-pure-white hover:bg-lumen-stone border-2 border-vast-ink text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Campus Directorate</span>
          </div>
          <h1 className="text-2xl font-extrabold text-vast-ink">
            Society Management Center
          </h1>
          <p className="text-sm text-fog">
            Manage society profiles, reassign faculty advisors, reset credentials, and soft-deactivate accounts.
          </p>
        </div>

        <Link to="/admin/societies/create">
          <Button
            variant="primary"
            size="md"
            className="shrink-0"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Onboard New Society
          </Button>
        </Link>
      </div>

      {actionError && <Alert variant="error" message={actionError} />}

      {/* Filter Toolbar */}
      <div className="bg-lumen-cream p-4 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72 flex items-center">
          <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search societies by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex items-center w-full sm:w-44">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNCONFIGURED">Unconfigured</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="relative flex items-center w-full sm:w-48">
            <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 pl-10 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {(statusFilter || categoryFilter || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setCategoryFilter('');
                setSearchQuery('');
                setPage(1);
              }}
              className="p-2 text-fog hover:text-vast-ink bg-lumen-stone rounded-inputs transition-colors shrink-0"
              title="Clear filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Callout */}
      {isError && (
        <div className="space-y-3">
          <Alert variant="error" message="Failed to load society records. DSA_ADMIN role required." />
          <button
            onClick={() => refetch()}
            className="text-xs text-vast-ink hover:underline font-semibold"
          >
            Retry Loading Societies
          </button>
        </div>
      )}

      {/* Societies List Grid / Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink space-y-3 animate-pulse">
              <div className="h-5 bg-lumen-stone rounded w-1/3" />
              <div className="h-4 bg-lumen-stone rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : societies.length === 0 ? (
        <div className="bg-pure-white p-12 rounded-cards border-2 border-vast-ink text-center space-y-3">
          <Building2 className="w-12 h-12 text-fog mx-auto" />
          <h3 className="font-bold text-vast-ink text-base">No Societies Found</h3>
          <p className="text-xs text-fog max-w-sm mx-auto">
            No campus societies match the selected search or category filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {societies.map((society) => (
            <div
              key={society.id}
              className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start md:items-center gap-4">
                {society.logoUrl ? (
                  <img
                    src={society.logoUrl}
                    alt={society.name}
                    className="w-12 h-12 rounded-inputs object-cover border-2 border-vast-ink shrink-0"
                  />
                ) : (
                  <div className="p-3 bg-lavender-whisper border border-vast-ink text-vast-ink rounded-inputs border border-indigo-500/20 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/societies/${society.id}`} className="font-bold text-vast-ink text-base hover:underline hover:text-blue-600 transition-colors">
                      {society.name}
                    </Link>
                    {renderStatusBadge(society.status)}
                    {society.category && (
                      <span className="text-[11px] font-semibold text-vast-ink bg-lavender-whisper border border-vast-ink px-2.5 py-0.5 rounded-inputs border border-indigo-500/20">
                        {society.category.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-fog">
                    <span>Society Email: <strong className="text-vast-ink font-medium">{society.presidentEmail}</strong></span>

                    {society.advisor && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-vast-ink" />
                        <span>Advisor: {society.advisor.user.fullName} ({society.advisor.department})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-vast-ink">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(society)}
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                  title="Edit details / Reassign Advisor"
                >
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-ember-glow hover:bg-pure-white border border-ember-glow"
                  onClick={() => resetPasswordMutation.mutate(society.id)}
                  isLoading={resetPasswordMutation.isPending && resetPasswordMutation.variables === society.id}
                  leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                  title="Reset President Password"
                >
                  Reset Credentials
                </Button>

                {society.status !== 'INACTIVE' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-pure-white border border-vast-ink"
                    onClick={() => setDeactivatingSociety(society)}
                    leftIcon={<UserX className="w-3.5 h-3.5" />}
                    title="Soft Deactivate Account"
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t-2 border-vast-ink text-xs font-semibold text-fog">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} societies)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border-2 border-vast-ink rounded-inputs hover:bg-lumen-stone disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-lumen-stone border-2 border-vast-ink rounded-inputs hover:bg-lumen-stone disabled:opacity-40 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Edit & Reassign Advisor Modal */}
      {editingSociety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lumen-cream/80 backdrop-blur-sm p-4">
          <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border-2 border-vast-ink max-w-md w-full space-y-5 bg-lumen-stone text-left">
            <h3 className="font-extrabold text-vast-ink text-lg border-b-2 border-vast-ink pb-3">
              Edit Society &amp; Reassign Advisor
            </h3>

            <div className="space-y-4">
              <Input
                label="Society Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-vast-ink font-medium">Category</label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3 py-2 outline-none focus:border-amber-500"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-vast-ink font-medium">Assigned Faculty Advisor</label>
                <select
                  value={editAdvisorId}
                  onChange={(e) => setEditAdvisorId(e.target.value)}
                  className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3 py-2 outline-none focus:border-amber-500"
                >
                  <option value="">None / Unassign Advisor</option>
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.user.fullName} ({a.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
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
        </div>
      )}

      {/* 2. Reset Password Modal */}
      {resetCredentialsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lumen-cream/80 backdrop-blur-sm p-4">
          <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-amber-500/30 max-w-md w-full space-y-5 bg-lumen-stone text-left">
            <div className="flex items-center gap-3 border-b-2 border-vast-ink pb-3">
              <Sparkles className="w-6 h-6 text-ember-glow" />
              <h3 className="font-extrabold text-vast-ink text-lg">
                President Password Reset!
              </h3>
            </div>

            <div className="space-y-3 bg-lumen-cream/80 p-4 rounded-cards border-2 border-vast-ink text-xs">
              <div>
                <span className="text-fog">Society:</span>
                <p className="font-bold text-vast-ink text-sm">{resetCredentialsData.societyName}</p>
              </div>

              <div>
                <span className="text-fog">Society Email:</span>
                <p className="font-bold text-vast-ink font-mono text-sm">{resetCredentialsData.presidentEmail}</p>
              </div>

              <div>
                <span className="text-fog">New Temporary Password:</span>
                <p className="font-extrabold text-ember-glow font-mono text-base tracking-wider mt-1 bg-lumen-stone px-3 py-1 rounded-inputs border border-amber-500/30 inline-block">
                  {resetCredentialsData.temporaryPassword}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyResetCredentials}
                leftIcon={copied ? <Check className="w-4 h-4 text-forest-ink" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy New Credentials'}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setResetCredentialsData(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Deactivate Confirmation Dialog */}
      {deactivatingSociety && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lumen-cream/80 backdrop-blur-sm p-4">
          <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-red-500/30 max-w-md w-full space-y-4 bg-lumen-stone text-left">
            <h3 className="font-extrabold text-vast-ink text-lg text-red-400 flex items-center gap-2">
              <UserX className="w-5 h-5" />
              <span>Deactivate Society Account?</span>
            </h3>

            <p className="text-xs text-vast-ink font-medium leading-relaxed">
              Are you sure you want to deactivate <strong className="text-vast-ink">{deactivatingSociety.name}</strong>?
              This will suspend login access for the society president. Historical events and yearly plans will remain intact.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeactivatingSociety(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                isLoading={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate(deactivatingSociety.id)}
              >
                Confirm Deactivation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
