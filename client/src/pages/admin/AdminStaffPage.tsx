import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  UserPlus,
  Trash2,
  Mail,
  ArrowLeft,
  Crown,
  ShieldCheck,
  X,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { BackButton } from '@/components/ui';
import type { AxiosError } from 'axios';

export const AdminStaffPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isModalOpen || deleteModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isModalOpen, deleteModalOpen]);

  // Guard: Director access only
  const isDirector = user?.dsaRole === 'DIRECTOR';

  const {
    data: staffList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminStaffList'],
    queryFn: adminService.getStaffList,
    enabled: isDirector,
  });

  const createMutation = useMutation({
    mutationFn: (data: { fullName: string; email: string }) => adminService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStaffList'] });
      setIsModalOpen(false);
      setFormData({ fullName: '', email: '' });
      setFormError(null);
    },
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
      const msg = err.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to invite DDSA staff.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStaffList'] });
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    },
  });

  if (!isDirector) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 font-sans">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Director Authority Required</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
          Staff management is reserved exclusively for the Director of Student Affairs (DSA).
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface hover:bg-surface-hover text-text-primary border border-border-medium font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DSA Dashboard</span>
        </button>
      </div>
    );
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setFormError('Full Name and Official Email are required.');
      return;
    }
    createMutation.mutate(formData);
  };

  const filteredStaff = staffList.filter((m: any) =>
    (m.fullName + ' ' + m.email).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-10 font-sans">
      {/* Floating Back Button */}
      <BackButton />

      {/* Page Header */}
      <div className="w-[95%] max-w-[1200px] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 text-left">
        <div>
          <h1 className="font-extrabold text-5xl sm:text-6xl text-text-primary tracking-tight leading-tight mb-2">
            DSA & DDSA Staff
          </h1>
          <p className="text-text-secondary text-sm">
            Manage Directorate personnel and provision accounts for Deputy Directors of Student Affairs.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="shrink-0"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Invite DDSA Staff
        </Button>
      </div>

      {/* Main Glass Card Table */}
      <div className="w-[95%] max-w-[1200px] bg-surface-glass backdrop-blur-xl rounded-cards p-6 sm:p-8 shadow-elevation-1 border border-border-medium">
        <div className="mb-[25px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-text-primary">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            <span>Active Administrative Accounts ({staffList.length})</span>
          </div>

          <div className="w-full sm:w-72">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search staff by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm transition-all outline-none bg-surface text-text-primary placeholder:text-text-muted rounded-inputs pl-10 pr-3.5 py-2.5 border border-border-medium focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-text-secondary font-semibold animate-pulse">
            Loading administrative personnel...
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={refetch} compact />
        ) : filteredStaff.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No Staff Records Found"
            description={
              searchQuery
                ? `No administrative personnel match your search query "${searchQuery}".`
                : 'No administrative staff accounts have been provisioned yet.'
            }
            onClearFilters={searchQuery ? () => setSearchQuery('') : undefined}
            action={
              !searchQuery
                ? {
                    label: 'Invite Deputy Director (DDSA)',
                    onClick: () => setIsModalOpen(true),
                    icon: UserPlus,
                  }
                : undefined
            }
            compact
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-[15px] text-text-secondary text-[13px] uppercase tracking-[1px] border-b border-border-subtle font-semibold w-[8%]">
                    Sr.
                  </th>
                  <th className="p-[15px] text-text-secondary text-[13px] uppercase tracking-[1px] border-b border-border-subtle font-semibold w-[30%]">
                    Staff Member
                  </th>
                  <th className="p-[15px] text-text-secondary text-[13px] uppercase tracking-[1px] border-b border-border-subtle font-semibold w-[28%]">
                    Official Email
                  </th>
                  <th className="p-[15px] text-text-secondary text-[13px] uppercase tracking-[1px] border-b border-border-subtle font-semibold w-[20%]">
                    Role & Position
                  </th>
                  <th className="p-[15px] text-text-secondary text-[13px] uppercase tracking-[1px] border-b border-border-subtle font-semibold w-[14%] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member: any, index: number) => {
                  const isMemberDirector = member.dsaRole === 'DIRECTOR';
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-surface-hover transition-colors group border-b border-border-subtle last:border-b-0"
                    >
                      <td className="py-[18px] px-[15px] text-[14px] text-text-secondary font-medium">
                        {index + 1}
                      </td>

                      <td className="py-[18px] px-[15px] text-[15px] text-text-primary">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isMemberDirector
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                : 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30'
                            }`}
                          >
                            {isMemberDirector ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className="font-bold text-text-primary block">{member.fullName}</span>
                            {!member.isEmailVerified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                                <Clock className="w-3 h-3" />
                                <span>Invitation Pending</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Active Account</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-[18px] px-[15px] text-[14px] text-slate-300">
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{member.email}</span>
                        </a>
                      </td>

                      <td className="py-[18px] px-[15px] text-[14px] text-slate-200">
                        {isMemberDirector ? (
                          <span className="px-[12px] py-[6px] rounded-[20px] text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>Director (DSA)</span>
                          </span>
                        ) : (
                          <span className="px-[12px] py-[6px] rounded-[20px] text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 inline-flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Deputy Director (DDSA)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-[18px] px-[15px] text-center">
                        {!isMemberDirector ? (
                          <button
                            onClick={() => {
                              setStaffToDelete(member.id);
                              setDeleteModalOpen(true);
                            }}
                            className="px-4 py-2 flex items-center gap-1.5 mx-auto bg-red-500 text-white hover:bg-red-600 rounded-lg transition-transform hover:-translate-y-0.5 font-bold text-sm shadow-[0_4px_12px_rgba(239,68,68,0.4)]"
                            title="Remove DDSA Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs italic">Primary Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite DDSA Modal (Consistent with Onboard / Advisor modals) */}
      {isModalOpen &&
        createPortal(
          <div className="modal-overlay active z-[200]">
            <div className="modal-box max-w-xl w-full">
              <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-3">
                <h3 className="modal-title flex items-center gap-2.5">
                  <UserPlus className="w-5 h-5 text-slate-400" />
                  <span>Invite Deputy Director (DDSA)</span>
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError(null);
                  }}
                  className="p-1.5 text-text-secondary hover:text-text-primary rounded-full transition-colors hover:bg-surface-hover"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <Alert variant="error" message={formError} className="mb-4" />
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <Input
                  label="Full Name *"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Dr. Usman Tariq"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />

                <Input
                  label="Official GIKI Email *"
                  name="email"
                  type="email"
                  placeholder="e.g. ddsa@giki.edu.pk"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                />

                <div className="p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-xs text-blue-300 flex items-start gap-2.5 my-3">
                  <Mail className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                  <span className="leading-relaxed">
                    An official invitation activation link will be dispatched to their GIKI email address. The Deputy Director will click the single-use link to securely set their password and access the administrative portal.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={createMutation.isPending}
                  >
                    Dispatch Invitation
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove DDSA Staff Member"
        message="Are you sure you want to delete this Deputy Director of Student Affairs administrative account? All privileges will be permanently revoked."
        confirmText="Confirm Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={() => staffToDelete && deleteMutation.mutate(staffToDelete)}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
