import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Tag,
  FileText,
  AlignLeft,
  Image,
  Globe,
  Share2,
  Link2,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { societyService } from '@/services/society.service';
import {
  societySetupSchema,
  type SocietySetupFormData,
} from '@/lib/validations/society.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ImageUploader } from '@/components/common/ImageUploader';
import type { AxiosError } from 'axios';

export const SocietySetupPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: mySociety, isLoading: isLoadingSociety } = useQuery({
    queryKey: ['mySociety'],
    queryFn: societyService.getMySociety,
  });

  const isEditing = mySociety?.isSetupComplete;

  // Fetch predefined categories from backend
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: societyService.getCategories,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SocietySetupFormData>({
    resolver: zodResolver(societySetupSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      shortDescription: '',
      longDescription: '',
      logoUrl: '',
      bannerUrl: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      website: '',
      email: '',
      presidentName: '',
      presidentRegNum: '',
      presidentContact: '',
    },
  });

  const logoUrl = watch('logoUrl');
  const bannerUrl = watch('bannerUrl');

  useEffect(() => {
    if (mySociety && isEditing) {
      reset({
        name: mySociety.name || '',
        categoryId: mySociety.category?.id || '',
        shortDescription: mySociety.shortDescription || '',
        longDescription: mySociety.longDescription || '',
        logoUrl: mySociety.logoUrl || '',
        bannerUrl: mySociety.bannerUrl || '',
        instagram: mySociety.instagram || '',
        facebook: mySociety.facebook || '',
        linkedin: mySociety.linkedin || '',
        website: mySociety.website || '',
        email: mySociety.email || '',
        presidentName: mySociety.presidentName || '',
        presidentRegNum: mySociety.presidentRegNum || '',
        presidentContact: mySociety.presidentContact || '',
      });
    }
  }, [mySociety, isEditing, reset]);

  const setupMutation = useMutation({
    mutationFn: (data: SocietySetupFormData) => 
      isEditing ? societyService.updateSociety(data) : societyService.setupSociety(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySociety'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      navigate('/dashboard', { replace: true });
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to save profile. Please check your inputs.';

      if (Array.isArray(respMessage)) {
        errText = respMessage.join(', ');
      } else if (typeof respMessage === 'string') {
        errText = respMessage;
      }

      setServerError(errText);
    },
  });

  const onSubmit = (data: SocietySetupFormData) => {
    setServerError(null);
    setupMutation.mutate(data);
  };

  if (isLoadingSociety) {
    return <div className="p-8 text-center text-fog font-medium text-sm">Loading society profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-6">
      <div className="space-y-1 bg-pure-white p-6 rounded-cards border-2 border-vast-ink relative">
        {isEditing && (
          <button
            onClick={() => navigate('/dashboard')}
            className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-lumen-stone hover:bg-lavender-whisper border-2 border-vast-ink text-vast-ink text-xs font-semibold rounded-inputs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        )}
        <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          <span>{isEditing ? 'Profile Settings' : 'One-Time Initial Setup'}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-vast-ink pr-32">
          {isEditing ? 'Edit Society Profile' : 'Complete Your Society Profile'}
        </h1>
        <p className="text-sm text-fog pr-32">
          {isEditing 
            ? 'Update your official society profile metadata and contact information below.' 
            : 'Welcome to Campus GIKI! Please complete your official society profile metadata below.'}
        </p>
      </div>

      {serverError && <Alert variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Core Society Profile Section */}
        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            General Information
          </h2>

          <Input
            label="Society Name *"
            placeholder="e.g. ACM GIKI Student Chapter"
            leftIcon={<Building2 className="w-4 h-4" />}
            disabled={setupMutation.isPending}
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-vast-ink font-medium uppercase tracking-wider">
              Category *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-fog pointer-events-none flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <select
                disabled={setupMutation.isPending || isLoadingCategories}
                className="w-full bg-pure-white text-vast-ink placeholder:text-fog text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                {...register('categoryId')}
              >
                <option value="">
                  {isLoadingCategories
                    ? 'Loading categories...'
                    : '-- Select Category --'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId?.message && (
              <p className="text-xs text-red-400 font-medium">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <Input
            label="Short Description *"
            placeholder="e.g. Premier computing and competitive programming society"
            leftIcon={<FileText className="w-4 h-4" />}
            disabled={setupMutation.isPending}
            error={errors.shortDescription?.message}
            {...register('shortDescription')}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-vast-ink font-medium uppercase tracking-wider">
              Long Description *
            </label>
            <div className="relative flex items-start">
              <div className="absolute left-3 top-3 text-fog pointer-events-none flex items-center justify-center">
                <AlignLeft className="w-4 h-4" />
              </div>
              <textarea
                rows={4}
                placeholder="Provide a detailed overview of your society's mission, annual events, and student opportunities..."
                disabled={setupMutation.isPending}
                className="w-full bg-pure-white text-vast-ink placeholder:text-fog text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2.5 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 resize-y"
                {...register('longDescription')}
              />
            </div>
            {errors.longDescription?.message && (
              <p className="text-xs text-red-400 font-medium">
                {errors.longDescription.message}
              </p>
            )}
          </div>
        </div>

        {/* President Details Section */}
        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            President Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="President Name"
              placeholder="e.g. John Doe"
              disabled={setupMutation.isPending}
              error={errors.presidentName?.message}
              {...register('presidentName')}
            />
            <Input
              label="President Reg. No"
              placeholder="e.g. 2022000"
              disabled={setupMutation.isPending}
              error={errors.presidentRegNum?.message}
              {...register('presidentRegNum')}
            />
          </div>
          <Input
            label="President Contact Number"
            placeholder="e.g. +923001234567"
            disabled={setupMutation.isPending}
            error={errors.presidentContact?.message}
            {...register('presidentContact')}
          />
        </div>

        {/* Media & Social Links Section */}
        <div className="bg-lumen-cream p-6 rounded-cards border-2 border-vast-ink space-y-4">
          <h2 className="text-base font-bold text-vast-ink border-b-2 border-vast-ink pb-2">
            Media & External Links (Optional)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploader
              value={logoUrl || ''}
              onChange={(url) => setValue('logoUrl', url, { shouldValidate: true })}
              folder="societies"
              label="Society Logo"
            />

            <ImageUploader
              value={bannerUrl || ''}
              onChange={(url) => setValue('bannerUrl', url, { shouldValidate: true })}
              folder="societies"
              label="Society Banner Image"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/acm_giki"
              leftIcon={<Share2 className="w-4 h-4" />}
              disabled={setupMutation.isPending}
              error={errors.instagram?.message}
              {...register('instagram')}
            />

            <Input
              label="Facebook URL"
              placeholder="https://facebook.com/acmgiki"
              leftIcon={<Share2 className="w-4 h-4" />}
              disabled={setupMutation.isPending}
              error={errors.facebook?.message}
              {...register('facebook')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="LinkedIn URL"
              placeholder="https://linkedin.com/company/acmgiki"
              leftIcon={<Link2 className="w-4 h-4" />}
              disabled={setupMutation.isPending}
              error={errors.linkedin?.message}
              {...register('linkedin')}
            />

            <Input
              label="Official Website"
              placeholder="https://acm.giki.edu.pk"
              leftIcon={<Globe className="w-4 h-4" />}
              disabled={setupMutation.isPending}
              error={errors.website?.message}
              {...register('website')}
            />
          </div>

          <Input
            label="Official Contact Email"
            placeholder="acm@giki.edu.pk"
            leftIcon={<Mail className="w-4 h-4" />}
            disabled={setupMutation.isPending}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={setupMutation.isPending}
          leftIcon={<CheckCircle2 className="w-5 h-5" />}
        >
          {isEditing ? 'Save Profile Changes' : 'Complete Society Profile Setup'}
        </Button>
      </form>
    </div>
  );
};
