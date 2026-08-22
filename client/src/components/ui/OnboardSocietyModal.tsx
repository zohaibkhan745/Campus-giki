import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Mail, UserCheck, Tag, CheckCircle2, Info, X } from 'lucide-react';
import { adminService, type OnboardSocietyResult } from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import { onboardSocietySchema, type OnboardSocietyFormData } from '@/lib/validations/onboard-society.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import type { AxiosError } from 'axios';

interface OnboardSocietyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardSocietyModal: React.FC<OnboardSocietyModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [provisionedData, setProvisionedData] = useState<OnboardSocietyResult | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
    enabled: isOpen,
  });

  const { data: advisors = [] } = useQuery({
    queryKey: ['availableAdvisors'],
    queryFn: adminService.getAvailableAdvisors,
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardSocietyFormData>({
    resolver: zodResolver(onboardSocietySchema),
    defaultValues: { name: '', categoryId: '', presidentEmail: '', advisorId: '' },
  });

  const categoryId = watch('categoryId');
  const advisorId = watch('advisorId');
  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
  const advisorOptions = advisors.map(adv => ({ value: adv.id, label: `${adv.user.fullName} (${adv.designation})` }));

  const onboardMutation = useMutation({
    meta: { notify: true },
    mutationFn: (payload: OnboardSocietyFormData) => adminService.onboardSociety(payload),
    onSuccess: (data) => {
      setProvisionedData(data);
      queryClient.invalidateQueries({ queryKey: ['adminSocietiesList'] });
      reset();
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setServerError('');
    },
  });

  const onSubmit: SubmitHandler<OnboardSocietyFormData> = (data) => {
    setServerError('');
    onboardMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setProvisionedData(null);
    setServerError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active z-[200]">
      <div className="modal-box" style={{ maxWidth: "800px", maxHeight: "90vh", overflow: "hidden" }}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="modal-title">Onboard New Society</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {!provisionedData ? (
            <div className="space-y-6">
              

              {null}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="space-y-4">
                  <Input
                    label="Society Name *"
                    placeholder="e.g. SoftDesk Society"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative z-50 mb-2">
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-white" />
                        <span>Society Category *</span>
                      </label>
                      <CustomDropdown 
                        options={categoryOptions} 
                        value={categoryId} 
                        onChange={(e: any) => setValue('categoryId', e.target.value, { shouldValidate: true })} 
                        placeholder="Select Category..." 
                      />
                      {errors.categoryId?.message && (
                        <p className="text-xs text-red-500 font-medium">{errors.categoryId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2 relative z-40 mb-2">
                      <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-white" />
                        <span>Assigned Faculty Advisor *</span>
                      </label>
                      <CustomDropdown 
                        options={advisorOptions} 
                        value={advisorId} 
                        onChange={(e: any) => setValue('advisorId', e.target.value, { shouldValidate: true })} 
                        placeholder="Select Advisor..." 
                      />
                      {errors.advisorId?.message && (
                        <p className="text-xs text-red-500 font-medium">{errors.advisorId.message}</p>
                      )}
                    </div>
                  </div>

                  <Input
                    label="Society Email *"
                    type="email"
                    placeholder="e.g. acm.giki@gmail.com"
                    error={errors.presidentEmail?.message}
                    {...register('presidentEmail')}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={onboardMutation.isPending}
                    leftIcon={<Building2 className="w-5 h-5" />}
                  >
                    Provision Society Account
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-forest-ink/10 border-2 border-forest-ink text-forest-ink rounded-full shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">Society Created</h3>
                  <p className="text-xs text-gray-400 font-medium">{provisionedData.name} has been provisioned successfully.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#141416] p-4 rounded-inputs border border-white/20 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Society Name</span>
                  <p className="text-sm font-bold text-white">{provisionedData.name}</p>
                </div>
                <div className="bg-[#141416] p-4 rounded-inputs border border-white/20 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Activation Email Dispatched To
                  </span>
                  <p className="text-sm font-bold text-white font-mono">{provisionedData.presidentEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-gray-400 bg-white/5 border border-white/20 p-3 rounded-inputs">
                <Info className="w-4 h-4 text-ember-glow shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">An activation link has been sent to the society email. The society president must click the link within 48 hours to set their password.</p>
              </div>

              <Button type="button" variant="primary" className="w-full" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
