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
  Ban,
  Edit,
  Plus,
  Copy,
  Check,
  Sparkles,
  FilterX,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import {
  adminService,
  type AdminSocietyItem,
  type AdminSocietyStatusType,
} from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OnboardSocietyModal } from '@/components/ui/OnboardSocietyModal';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const AdminSocietiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddSocietyModalOpen, setIsAddSocietyModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'ban' | 'reactivate' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'ban' | 'reactivate' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Dialog & Modal States
  const [editingSociety, setEditingSociety] = useState<AdminSocietyItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editAdvisorId, setEditAdvisorId] = useState('');

  const [deactivatingSociety, setDeactivatingSociety] = useState<AdminSocietyItem | null>(null);
  const [reactivatingSociety, setReactivatingSociety] = useState<AdminSocietyItem | null>(null);
  const [deletingSociety, setDeletingSociety] = useState<AdminSocietyItem | null>(null);
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

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteSociety(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
      setDeletingSociety(null);
      setActionError(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to delete society.');
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

    // Warning Mutation
  const warningMutation = useMutation({
    mutationFn: (data: { id: string; hasWarning: boolean }) => adminService.toggleWarning(data.id, data.hasWarning),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update warning status.');
    },
  });

  // Reactivate Mutation
  const reactivateMutation = useMutation({
    mutationFn: (id: string) => adminService.reactivateSociety(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message;
      setActionError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to reactivate society.');
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



  const renderStatusBadge = (status: AdminSocietyStatusType) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-forest-ink border border-emerald-500/20 text-forest-ink rounded-inputs text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ACTIVE</span>
          </span>
        );
      case 'UNCONFIGURED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-ember-glow border border-amber-500/20 text-ember-glow rounded-inputs text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>UNCONFIGURED</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-transparent border border-vast-ink border border-red-500/20 text-red-400 rounded-inputs text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>INACTIVE</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4 relative px-4">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <h1 className="text-4xl font-extrabold text-white">Societies Management</h1>
        <button
          onClick={() => setIsAddSocietyModalOpen(true)}
          className="bg-white text-black border-none py-[10px] px-[18px] rounded-[12px] text-[14px] font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:-translate-y-[2px] shadow-lg"
        >
          + Onboard Society
        </button>
      </div>

      <div className="w-full bg-white/[0.08] backdrop-blur-[20px] rounded-[24px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/20 overflow-x-auto">
        <div className="mb-[25px]">
          <h2 className="text-lg font-bold text-white m-0 border-b border-white/10 pb-3">Societies</h2>
        </div>

        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-semibold animate-pulse">Loading societies...</div>
        ) : societies.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Building2 className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No Societies Found</h3>
            <p className="text-sm text-slate-400 font-medium max-w-md">
              No campus societies match the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[900px]">
              <thead>
                <tr>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[8%]">Sr.</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[20%]">Society</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[20%]">Advisor</th>
                  
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[15%] text-center">Status</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[22%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {societies.map((society, index) => {
                  let statusText = 'Active';
                  let statusClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                  
                  if (society.status === 'INACTIVE') {
                    statusText = 'Banned';
                    statusClass = 'bg-red-500/20 text-red-400 border-red-500/30';
                  } else if (society.hasWarning) {
                    statusText = 'Warning';
                    statusClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  }

                  return (
                    <tr key={society.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleOpenEdit(society)}>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0">
                        {String(index + 1 + (page - 1) * 10).padStart(2, '0')}
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-white font-bold group-last:border-b-0">
                        {society.name}
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-300 group-last:border-b-0">
                        {society.advisor?.user.fullName || <span className="text-slate-500 italic">None</span>}
                      </td>
                      
                      
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-center group-last:border-b-0">
                        <span className={`inline-block px-[14px] py-[6px] rounded-[20px] text-[12px] font-bold border ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-center group-last:border-b-0" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
{society.status === 'INACTIVE' ? (
                            <button
                              onClick={() => setReactivatingSociety(society)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 bg-green-500 text-white hover:bg-green-600 shadow-md"
                              title="Reactivate Society"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Reactivate
                            </button>
                          ) : (
                            <button
                                onClick={() => setDeactivatingSociety(society)}
                                className="px-3 py-1.5 rounded-[12px] text-[11px] font-bold transition-all flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 shadow-md"
                                title="Ban Society"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Ban
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {((meta?.totalPages || 1) > 1) && (
          <div className="flex justify-center items-center mt-6 gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-slate-300 hover:text-white disabled:opacity-50 font-bold px-4 py-2">Prev</button>
            <span className="text-slate-400 text-sm">Page {page} of {(meta?.totalPages || 1)}</span>
            <button onClick={() => setPage(p => Math.min((meta?.totalPages || 1), p + 1))} disabled={page === (meta?.totalPages || 1)} className="text-slate-300 hover:text-white disabled:opacity-50 font-bold px-4 py-2">Next</button>
          </div>
        )}
      </div>
      
      {/* 1. Edit & Reassign Advisor Modal */}
      {editingSociety && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-lumen-cream/80 backdrop-blur-sm p-4">
          <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-vast-ink/20 max-w-md w-full space-y-5 bg-lumen-stone text-left">
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
                  className="w-full bg-transparent text-vast-ink text-sm rounded-inputs border border-vast-ink/20 px-3 py-2 outline-none focus:border-amber-500"
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
                  className="w-full bg-transparent text-vast-ink text-sm rounded-inputs border border-vast-ink/20 px-3 py-2 outline-none focus:border-amber-500"
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

            <div className="modal-actions">
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

      {/* 2. Delete Confirmation Dialog */}
      {deletingSociety && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-lumen-cream/80 backdrop-blur-sm p-4">
          <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-red-500/30 max-w-md w-full space-y-4 bg-lumen-stone text-left">
            <h3 className="font-extrabold text-vast-ink text-lg text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Delete Society Account?</span>
            </h3>

            <p className="text-xs text-vast-ink font-medium leading-relaxed">
              Are you sure you want to completely delete <strong className="text-vast-ink">{deletingSociety.name}</strong>?
              This will permanently delete the society, all associated events, posts, and yearly plans. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingSociety(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingSociety.id)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Deactivate Confirmation Dialog */}
      {deactivatingSociety && (<div className="modal-overlay active">
          <div className="modal-box">
            <h3 className="modal-title" style={{ color: '#fca5a5' }}>
              <Ban className="w-5 h-5" />
              <span>Deactivate Society Account?</span>
            </h3>

            <p className="modal-description">
              Are you sure you want to deactivate <strong style={{color: '#ffffff'}}>{deactivatingSociety.name}</strong>?
              This will suspend login access for the society president. Historical events and yearly plans will remain intact.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setDeactivatingSociety(null)}
                style={{width:"auto"}}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm danger"
                disabled={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate(deactivatingSociety.id)}
                style={{width:"auto"}}
              >
                {deactivateMutation.isPending ? 'Processing...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Reactivate Confirmation Dialog */}
      {reactivatingSociety && (<div className="modal-overlay active">
          <div className="modal-box">
            <h3 className="modal-title" style={{ color: '#6ee7b7' }}>
              <CheckCircle2 className="w-5 h-5" />
              <span>Reactivate Society Account?</span>
            </h3>

            <p className="modal-description">
              Are you sure you want to reactivate <strong style={{color: '#ffffff'}}>{reactivatingSociety.name}</strong>?
              This will restore login access and all privileges for the society president.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setReactivatingSociety(null)}
                style={{width:"auto"}}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm success"
                disabled={reactivateMutation.isPending}
                onClick={() => {
                  reactivateMutation.mutate(reactivatingSociety.id);
                  setReactivatingSociety(null);
                }}
                style={{width:"auto"}}
              >
                {reactivateMutation.isPending ? 'Processing...' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <OnboardSocietyModal
        isOpen={isAddSocietyModalOpen}
        onClose={() => setIsAddSocietyModalOpen(false)}
        
      />
    </div>
  );
};