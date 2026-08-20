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
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Header Banner */}
      <div className="space-y-1 bg-transparent p-6 rounded-cards border border-vast-ink/20">
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
      <form onSubmit={handleSubmit(onSubmit)} className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-vast-ink/20 space-y-6" noValidate>
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
                className="w-full bg-transparent text-vast-ink text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
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
                className="w-full bg-transparent text-vast-ink text-sm rounded-inputs border border-vast-ink/20 px-3.5 py-2.5 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
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
          <div className="bg-transparent p-6 sm:p-8 rounded-cards border border-vast-ink/20 max-w-lg w-full space-y-6 shadow-2xl text-left">
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
              <div className="bg-lumen-cream p-4 rounded-inputs border border-vast-ink/20 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fog">Society Name</span>
                <p className="text-sm font-bold text-vast-ink">{provisionedData.name}</p>
              </div>

              <div className="bg-lumen-cream p-4 rounded-inputs border border-vast-ink/20 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-fog flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Activation Email Dispatched To
                </span>
                <p className="text-sm font-bold text-vast-ink font-mono">{provisionedData.presidentEmail}</p>
              </div>

              {provisionedData.emailPreviewUrl && (
                <div className="bg-blue-950 p-4 rounded-inputs border-2 border-blue-600 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                    <Info className="w-3 h-3 text-blue-400" /> Local Test Email Inbox
                  </span>
                  <a
                    href={provisionedData.emailPreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-400 underline hover:text-blue-200 block truncate"
                  >
                    Open Ethereal Email Preview &rarr;
                  </a>
                </div>
              )}
            </div>

            {/* Delivery Instruction */}
            <div className="flex items-start gap-2.5 text-xs text-fog bg-lumen-cream border border-vast-ink/20/20 p-3 rounded-inputs">
              <Info className="w-4 h-4 text-ember-glow shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">
                An activation link has been sent to the society email. The society president must click the link within 48 hours to set their password.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-vast-ink/10">
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto px-8"
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
