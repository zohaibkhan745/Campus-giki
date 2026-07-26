import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  Mail,
  UserCheck,
  Tag,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Info,
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

  // Query categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

  // Query advisors list
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
    const textToCopy = `Society: ${provisionedData.name}\nPresident Email: ${provisionedData.presidentEmail}\nTemporary Password: ${provisionedData.temporaryPassword}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/yearly-plans"
          className="inline-flex items-center gap-2 text-xs font-semibold text-fog hover:text-vast-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to DSA Admin Portal</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
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
      </div>

      {/* Server Error Alert */}
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
            {/* Category Select Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-vast-ink font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-vast-ink" />
                <span>Society Category *</span>
              </label>
              <select
                {...register('categoryId')}
                className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId?.message && (
                <p className="text-xs text-red-400 font-medium">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Assigned Advisor Select Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-vast-ink font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-vast-ink" />
                <span>Assigned Faculty Advisor *</span>
              </label>
              <select
                {...register('advisorId')}
                className="w-full bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select Advisor...</option>
                {advisors.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.user.fullName} ({adv.designation} - {adv.department})
                  </option>
                ))}
              </select>
              {errors.advisorId?.message && (
                <p className="text-xs text-red-400 font-medium">{errors.advisorId.message}</p>
              )}
            </div>
          </div>

          <Input
            label="President Email Address *"
            type="email"
            placeholder="e.g. president.softdesk@giki.edu.pk"
            error={errors.presidentEmail?.message}
            {...register('presidentEmail')}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
            isLoading={onboardMutation.isPending}
            leftIcon={<Building2 className="w-5 h-5" />}
          >
            Provision Society Account
          </Button>
        </div>
      </form>

      {/* Success Credentials Modal Dialog */}
      {provisionedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lumen-cream/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-lumen-cream p-6 sm:p-8 rounded-cards border border-indigo-500/30 max-w-lg w-full space-y-6 bg-lumen-stone shadow-2xl text-left">
            <div className="flex items-center gap-3 border-b-2 border-vast-ink pb-4">
              <div className="p-2.5 bg-pure-white border border-forest-ink text-forest-ink rounded-cards border border-emerald-500/20 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-vast-ink text-lg">
                  Society Account Provisioned!
                </h3>
                <p className="text-xs text-fog">
                  {provisionedData.name} has been created successfully.
                </p>
              </div>
            </div>

            {/* Display Credentials Box */}
            <div className="space-y-3 bg-lumen-cream/80 p-5 rounded-cards border-2 border-vast-ink">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase text-fog">Society Name</span>
                <p className="text-sm font-bold text-vast-ink">{provisionedData.name}</p>
              </div>

              <div className="space-y-1 pt-1 border-t border-vast-ink">
                <span className="text-[11px] font-semibold uppercase text-fog">President Login Email</span>
                <p className="text-sm font-bold text-vast-ink font-mono">{provisionedData.presidentEmail}</p>
              </div>

              <div className="space-y-1 pt-1 border-t border-vast-ink">
                <span className="text-[11px] font-semibold uppercase text-fog">Temporary Password</span>
                <p className="text-base font-extrabold text-ember-glow font-mono tracking-wider bg-lumen-stone px-3 py-1.5 rounded-inputs border border-amber-500/30 inline-block">
                  {provisionedData.temporaryPassword}
                </p>
              </div>
            </div>

            {/* Manual Delivery Instruction Alert */}
            <div className="flex items-start gap-2 text-xs text-amber-300 bg-pure-white border border-ember-glow p-3 rounded-inputs border border-amber-500/20">
              <Info className="w-4 h-4 text-ember-glow shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Credentials are not emailed automatically. Please copy these temporary credentials and deliver them manually to the society president.
              </p>
            </div>

            {/* Action Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full sm:w-1/2"
                onClick={handleCopyCredentials}
                leftIcon={copied ? <Check className="w-4 h-4 text-forest-ink" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Credentials Copied!' : 'Copy Credentials'}
              </Button>

              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={() => setProvisionedData(null)}
              >
                Done / Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
