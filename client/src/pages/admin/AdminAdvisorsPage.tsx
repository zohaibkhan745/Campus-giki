import { getAdvisorLogo } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Trash, UserPlus, Trash2, UserCircle2, ArrowLeft, Mail } from 'lucide-react';
import { adminService, type AdvisorOption, type CreateAdvisorPayload } from '@/services/admin.service';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AxiosError } from 'axios';

export const AdminAdvisorsPage: React.FC = () => {

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleDelete = (id: string) => {
    setAdvisorToDelete(id);
    setDeleteModalOpen(true);
  };

const deleteMutation = useMutation({
    mutationFn: adminService.deleteAdvisor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableAdvisors'] }); setDeleteModalOpen(false);
      
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [advisorToDelete, setAdvisorToDelete] = useState<string | null>(null);
  useEffect(() => {
    if (isModalOpen || deleteModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isModalOpen, deleteModalOpen]);

  const [formData, setFormData] = useState<CreateAdvisorPayload>({
    fullName: '',
    email: '',
    password: '',
    department: '',
    designation: '',
  });

  const {
    data: advisors = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['availableAdvisors'],
    queryFn: adminService.getAvailableAdvisors,
  });

  const createMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: CreateAdvisorPayload) => adminService.createAdvisor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableAdvisors'] });
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        department: '',
        designation: '',
      });
      setFormError(null);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create advisor.');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.department || !formData.designation) {
      setFormError('All fields are required.');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-10 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-[95%] max-w-[1200px] flex justify-between items-end mb-6 text-left">
        <div>
          <h1 className="font-extrabold text-5xl sm:text-6xl text-text-primary tracking-tight leading-tight mb-8">Society Advisors</h1>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Advisor
        </Button>
      </div>

      <div className="w-[95%] max-w-[1200px] bg-white/[0.08] backdrop-blur-[20px] rounded-[24px] p-[30px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/20">
        <div className="mb-[25px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
          <h2 className="text-lg font-bold text-white m-0 text-left">Advisors List</h2>
          <div className="w-full sm:w-72">
            <input 
              type="text"
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm transition-all outline-none bg-black/20 text-white placeholder:text-gray-500 rounded-inputs px-3.5 py-2.5 border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-semibold animate-pulse">Loading advisors...</div>
        ) : isError ? (
          <ErrorState
            error={error}
            onRetry={refetch}
            compact
          />
        ) : advisors.filter((a: AdvisorOption) => ((a.user?.fullName || '') + (a.user?.email || '')).toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
          <EmptyState
            icon={UserCircle2}
            title="No Advisors Found"
            description={
              searchQuery
                ? `No faculty advisors match your search query "${searchQuery}".`
                : 'There are no faculty advisors registered in the system.'
            }
            onClearFilters={searchQuery ? () => setSearchQuery('') : undefined}
            action={
              !searchQuery
                ? {
                    label: 'Onboard New Advisor',
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
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[10%]">Sr.</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[20%]">Advisor Name</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[25%]">Email</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[15%]">Faculty</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[20%]">Assigned Societies</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[10%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {advisors.filter((a: AdvisorOption) => ((a.user?.fullName || '') + (a.user?.email || '')).toLowerCase().includes(searchQuery.toLowerCase())).map((advisor: AdvisorOption, index: number) => (
                  <tr key={advisor.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-white font-semibold group-last:border-b-0">
<div className="flex items-center gap-3">
<img src={getAdvisorLogo(advisor.user?.avatarUrl)} alt={advisor.user?.fullName} className="w-8 h-8 rounded-full border border-white/20 object-cover" />
<span>{advisor.user?.fullName}</span>
</div>
</td>
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0">
                      <a href={`mailto:${advisor.user.email}`} className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                        {advisor.user.email}
                      </a>
                    </td>
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0">
                      {advisor.department}
                    </td>
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0">
                      {advisor.societies && advisor.societies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {advisor.societies.map((soc, idx) => (
                            <span key={idx} className="px-[12px] py-[6px] rounded-[20px] text-[12px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {soc.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-sm">Unassigned</span>
                      )}
                    </td>
<td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0 text-center">
<button onClick={() => handleDelete(advisor.id)} className="px-4 py-2 flex items-center gap-1.5 mx-auto bg-red-500 text-white hover:bg-red-600 rounded-lg transition-transform hover:-translate-y-0.5 font-bold text-sm shadow-[0_4px_12px_rgba(239,68,68,0.4)]"><Trash2 className="w-3.5 h-3.5" /><span>Delete</span></button>
</td>
</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && createPortal(
<div className="modal-overlay active">
          <div className="modal-box" style={{ maxWidth: "550px" }}>
            <h3 className="modal-title">
              <UserPlus className="w-5 h-5 text-slate-400" />
              Onboard New Advisor
            </h3>

            {formError && (
              <Alert variant="error" message={formError} className="mb-4" />
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="fullName"
                placeholder="e.g. Dr. Ahsan Khan"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="ahsan@giki.edu.pk"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-xl text-xs text-blue-300 flex items-start gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span className="leading-relaxed">
                  An official activation link will be sent to the professor's email. They will click the link to securely set their password and access their assigned society's pending plans and events.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Designation
                  </label>
                  <CustomDropdown
                      name="designation"
                      options={[
                        { value: 'Lecturer', label: 'Lecturer' },
                        { value: 'Assistant Professor', label: 'Assistant Professor' },
                        { value: 'Associate Professor', label: 'Associate Professor' },
                        { value: 'Professor', label: 'Professor' }
                      ]}
                      value={formData.designation}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, designation: e?.target?.value !== undefined ? e.target.value : e }))}
                      placeholder="Select Designation..."
                    />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Faculty
                  </label>
                  <CustomDropdown
                      name="department"
                      options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]}
                      value={formData.department}
                      onChange={(e: any) => setFormData(prev => ({ ...prev, department: e?.target?.value !== undefined ? e.target.value : e }))}
                      placeholder="Select Faculty..."
                    />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-medium">
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
                  Create Advisor
                </Button>
              </div>
            </form>
          </div>
        </div>, document.body)}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (advisorToDelete) {
            deleteMutation.mutate(advisorToDelete);
          }
        }}
        title="Delete Advisor"
        message="Are you sure you want to delete this advisor? This action cannot be undone and will permanently remove their access."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};








