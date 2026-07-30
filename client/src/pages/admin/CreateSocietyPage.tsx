import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  Mail,
  UserCheck,
  Tag,
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Info,
  KeyRound,
  X,
} from 'lucide-react';
import { adminService, type OnboardSocietyResult } from '@/services/admin.service';
import { societyService } from '@/services/society.service';
import {
  onboardSocietySchema,
  type OnboardSocietyFormData,
} from '@/lib/validations/onboard-society.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const CreateSocietyPage: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [provisionedData, setProvisionedData] = useState<OnboardSocietyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

  const { data: advisors = [] } = useQuery({
    queryKey: ['availableAdvisors'],
    queryFn: adminService.getAvailableAdvisors,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnboardSocietyFormData>({
    resolver: zodResolver(onboardSocietySchema),
    defaultValues: {
      name: '',
      categoryId: '',
      presidentEmail: '',
      advisorId: '',
    },
  });

  const onboardMutation = useMutation({
    mutationFn: (payload: OnboardSocietyFormData) =>
      adminService.onboardSociety(payload),
    onSuccess: (data) => {
      setProvisionedData(data);
      reset();
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to provision society.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setServerError(errText);
    },
  });

  const onSubmit: SubmitHandler<OnboardSocietyFormData> = (data) => {
    setServerError(null);
    onboardMutation.mutate(data);
  };

  const handleCopyCredentials = () => {
    if (!provisionedData) return;
    const textToCopy = `Society: ${provisionedData.name}\nSociety Email: ${provisionedData.presidentEmail}\nTemporary Password: ${provisionedData.temporaryPassword}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      {/* Back Button */}
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
      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink">
        <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>DSA Administration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-vast-ink">
          Onboard New Campus Society
        </h1>
        <p className="text-sm text-fog">
          Provision a new society profile, assign a faculty advisor, and generate president credentials.
        </p>
      </div>

      {serverError && <Alert variant="error" message={serverError} />}

      {/* Onboarding Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-lumen-cream p-6 sm:p-8 rounded-cards border-2 border-vast-ink space-y-6" noValidate>
        <div className="space-y-4">
          <Input
            label="Society Name *"
            placeholder="e.g. SoftDesk Society"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-vast-ink flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-vast-ink" />
                <span>Society Category *</span>
              </label>
              <select
                {...register('categoryId')}
                className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId?.message && (
                <p className="text-xs text-red-500 font-medium">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-vast-ink flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-vast-ink" />
                <span>Assigned Faculty Advisor *</span>
              </label>
              <select
                {...register('advisorId')}
                className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              >
                <option value="">Select Advisor...</option>
                {advisors.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.user.fullName} ({adv.designation} - {adv.department})
                  </option>
                ))}
              </select>
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

      {/* Success Credentials Modal */}
      {provisionedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vast-ink/40 backdrop-blur-sm p-4">
          <div className="bg-pure-white p-6 sm:p-8 rounded-cards border-2 border-vast-ink max-w-lg w-full space-y-6 shadow-2xl text-left">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-forest-ink/10 border-2 border-forest-ink text-forest-ink rounded-full shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-vast-ink text-lg">
                    Society Created
                  </h3>
                  <p className="text-xs text-fog font-medium">
                    {provisionedData.name} has been provisioned successfully.
                  </p>
                </div>
              </div>
              <button onClick={() => setProvisionedData(null)} className="p-1 text-fog hover:text-vast-ink rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credential Cards */}
            <div className="space-y-3">
              <div className="bg-lumen-cream p-4 rounded-inputs border-2 border-vast-ink space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fog">Society Name</span>
                <p className="text-sm font-bold text-vast-ink">{provisionedData.name}</p>
              </div>

              <div className="bg-lumen-cream p-4 rounded-inputs border-2 border-vast-ink space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fog flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Login Email
                </span>
                <p className="text-sm font-bold text-vast-ink font-mono">{provisionedData.presidentEmail}</p>
              </div>

              <div className="bg-vast-ink p-4 rounded-inputs border-2 border-vast-ink space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fog flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-amber-400" /> Temporary Password
                </span>
                <p className="text-base font-extrabold text-white font-mono tracking-widest">
                  {provisionedData.temporaryPassword}
                </p>
              </div>
            </div>

            {/* Delivery Instruction */}
            <div className="flex items-start gap-2.5 text-xs text-fog bg-lumen-cream border-2 border-vast-ink/20 p-3 rounded-inputs">
              <Info className="w-4 h-4 text-ember-glow shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                Credentials are not emailed automatically. Copy and deliver them manually to the society president.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t-2 border-vast-ink/10">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-pure-white"
                onClick={handleCopyCredentials}
                leftIcon={copied ? <Check className="w-4 h-4 text-forest-ink" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy Credentials'}
              </Button>

              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => setProvisionedData(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
