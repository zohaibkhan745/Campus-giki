import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCircle2, Briefcase, Mail, Building, ArrowLeft } from 'lucide-react';
import { adminService, type AdvisorOption, type CreateAdvisorPayload } from '@/services/admin.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-transparent hover:bg-lumen-stone border border-vast-ink/20 text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-vast-ink tracking-tight">Faculty Advisors</h1>
          <p className="text-sm font-semibold text-fog mt-1">
            Manage society faculty advisors
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Advisor
        </Button>
      </div>

      <div className="bg-lumen-cream border border-vast-ink/20 rounded-cards overflow-hidden shadow-[4px_4px_0px_0px_#1B1B18]">
        {isLoading ? (
          <div className="p-8 text-center text-vast-ink font-semibold animate-pulse">Loading advisors...</div>
        ) : advisors.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-transparent rounded-full border border-vast-ink/20 flex items-center justify-center mb-4">
              <UserCircle2 className="w-8 h-8 text-vast-ink opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-vast-ink mb-1">No Advisors Found</h3>
            <p className="text-sm text-fog font-medium max-w-md">
              There are no faculty advisors in the system. Create one to assign them to societies.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-lumen-stone border-b-2 border-vast-ink text-vast-ink font-bold text-sm">
                  <th className="py-3 px-4 border-r-2 border-vast-ink">Advisor Name</th>
                  <th className="py-3 px-4 border-r-2 border-vast-ink">Email</th>
                  <th className="py-3 px-4 border-r-2 border-vast-ink">Designation</th>
                  <th className="py-3 px-4">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-vast-ink">
                {advisors.map((advisor: AdvisorOption) => (
                  <tr key={advisor.id} className="hover:bg-transparent/50 transition-colors">
                    <td className="py-3 px-4 border-r-2 border-vast-ink">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="w-4 h-4 text-fog" />
                        <span className="font-semibold text-vast-ink">{advisor.user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-r-2 border-vast-ink">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-fog" />
                        <span className="text-sm font-medium text-fog">{advisor.user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-r-2 border-vast-ink">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-fog" />
                        <span className="text-sm font-medium text-vast-ink">{advisor.designation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-fog" />
                        <span className="text-sm font-medium text-vast-ink">{advisor.department}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lumen-cream/80 backdrop-blur-sm p-4">
          <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-vast-ink/20 max-w-md w-full space-y-5 shadow-[4px_4px_0px_0px_#1B1B18] text-left">
            <h3 className="font-extrabold text-vast-ink text-xl border-b-2 border-vast-ink pb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Onboard New Advisor
            </h3>

            {formError && (
              <Alert variant="error" className="mb-4" message={formError} />
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
                <Input
                  label="Designation"
                  name="designation"
                  placeholder="e.g. Asst. Professor"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Department"
                  name="department"
                  placeholder="e.g. FCSE"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
        </div>
      )}
    </div>
  );
};
