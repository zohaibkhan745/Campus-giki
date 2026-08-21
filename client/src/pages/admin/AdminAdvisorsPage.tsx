import React, {  useState  } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCircle2, ArrowLeft } from 'lucide-react';
import { adminService, type AdvisorOption, type CreateAdvisorPayload } from '@/services/admin.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import type { AxiosError } from 'axios';

export const AdminAdvisorsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAdvisorPayload>({
    fullName: '',
    email: '',
    password: '',
    department: '',
    designation: '',
  });

  const { data: advisors = [], isLoading } = useQuery({
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
    if (!formData.fullName || !formData.email || !formData.password || !formData.department || !formData.designation) {
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
          <h1 className="text-4xl font-extrabold text-white">Society Advisors</h1>
        </div>
        <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black border-none py-[10px] px-[18px] rounded-[12px] text-[14px] font-semibold cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:-translate-y-[2px] shadow-lg"
          >
            + Add Advisor
        </button>
      </div>

      <div className="w-[95%] max-w-[1200px] bg-white/[0.08] backdrop-blur-[20px] rounded-[24px] p-[30px] shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-white/20">
        <div className="mb-[25px]">
          <h2 className="text-lg font-bold text-white m-0 border-b border-white/10 pb-3 text-left">Advisors List</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-semibold animate-pulse">Loading advisors...</div>
        ) : advisors.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center mb-4">
              <UserCircle2 className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Advisors Found</h3>
            <p className="text-sm text-slate-400 font-medium max-w-md">
              There are no faculty advisors in the system. Create one to assign them to societies.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[10%]">Sr.</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[20%]">Advisor Name</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[25%]">Email</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[15%]">Faculty</th>
                  <th className="p-[15px] text-slate-400 text-[13px] uppercase tracking-[1px] border-b border-white/10 w-[30%]">Assigned Societies</th>
                </tr>
              </thead>
              <tbody>
                {advisors.map((advisor: AdvisorOption, index: number) => (
                  <tr key={advisor.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-slate-200 group-last:border-b-0">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-[18px] px-[15px] text-[15px] border-b border-white/5 text-white font-semibold group-last:border-b-0">
                      {advisor.user.fullName}
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
              null /* Removed error alert */
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

              <Input
                label="Temporary Password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleInputChange}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Designation
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'Lecturer', label: 'Lecturer' },
                      { value: 'Assistant Professor', label: 'Assistant Professor' },
                      { value: 'Associate Professor', label: 'Associate Professor' },
                      { value: 'Professor', label: 'Professor' }
                    ]}
                    value={formData.designation}
                    onChange={(val) => setFormData(prev => ({ ...prev, designation: val }))}
                    placeholder="Select..."
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Faculty
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'FCSE', label: 'FCSE' },
                      { value: 'FEE', label: 'FEE' },
                      { value: 'FCVE', label: 'FCVE' },
                      { value: 'FME', label: 'FME' },
                      { value: 'FCME', label: 'FCME' },
                      { value: 'FMTE', label: 'FMTE' },
                      { value: 'MGS', label: 'MGS' }
                    ]}
                    value={formData.department}
                    onChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                    placeholder="Select..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError(null);
                  }}
                  className="btn-cancel" style={{width:"auto"}}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createMutation.isPending}
                  className="btn-cancel" style={{width:"auto", background:"#fff", color:"#000"}}
                >
                  Create Advisor
                </Button>
              </div>
            </form>
          </div>
        </div>, document.body)}
    </div>
  );
};
