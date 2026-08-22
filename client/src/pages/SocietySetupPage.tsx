import { CustomDropdown } from '@/components/ui/CustomDropdown';
import React, { useState, useEffect } from 'react';
import {  useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2, User,
  Tag,
  FileText,
  AlignLeft,
  Image,
  Globe,
  Share2,
  Link2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Check,
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
      type: 'SOCIETY',
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
      presidentEmail: '',
      presidentFaculty: '',
    },
  });

  const logoUrl = watch('logoUrl');
  const bannerUrl = watch('bannerUrl');
  const selectedType = watch('type');

  useEffect(() => {
    if (mySociety) {
      reset({
        name: mySociety.name || '',
        type: (mySociety.type as any) || 'SOCIETY',
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
        presidentEmail: mySociety.presidentEmail || '',
        presidentFaculty: mySociety.presidentFaculty || '',
      });
    }
  }, [mySociety, reset]);

  const setupMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: SocietySetupFormData) => 
      isEditing ? societyService.updateSociety(data) : societyService.setupSociety(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySociety'] });
      queryClient.invalidateQueries({ queryKey: ['authStatus'] });
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

      setServerError('');
    },
  });

  const onSubmit = (data: SocietySetupFormData) => {
    setServerError('');
    setupMutation.mutate(data);
  };

  if (isLoadingSociety) {
    return <div className="p-8 text-center text-fog font-medium text-sm">Loading society profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-6">
        {isEditing ? 'Edit Society Profile' : 'Initialize Society Profile'}
      </h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white space-y-6 text-left">
          
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            
            {/* Society Info Section */}
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-white" />
                Society Info
              </h3>
              
              <div className="space-y-4">
                <Input
                  {...register('name')}
                  error={errors.name?.message}
                  label="Society Name *"
                  placeholder="e.g. ACM GIKI Student Chapter"
                  leftIcon={<Building2 className="w-4 h-4" />}
                  disabled={setupMutation.isPending}
                />
                
                <div className="w-full space-y-1.5 text-left">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Short Description *
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('shortDescription')}
                      className="w-full min-h-[100px] text-sm transition-all outline-none bg-transparent text-white placeholder:text-gray-500 rounded-inputs px-3.5 py-2.5 border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/10"
                      placeholder="e.g. Premier computing and competitive programming society"
                      disabled={setupMutation.isPending}
                    />
                    {errors.shortDescription?.message && (
                      <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.shortDescription.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="w-full space-y-1.5 text-left">
                    
                    <ImageUploader
                      onChange={(url: string) => setValue('logoUrl', url, { shouldValidate: true, shouldDirty: true })}
                      value={watch('logoUrl') || undefined}
                      label="Society Logo"
                    />
                  </div>

                  <div className="w-full space-y-1.5 text-left">
                    
                    <ImageUploader
                      onChange={(url: string) => setValue('bannerUrl', url, { shouldValidate: true, shouldDirty: true })}
                      value={watch('bannerUrl') || undefined}
                      label="Society Banner Image"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mid Line */}
            <div className="w-full h-px bg-white/10 my-6"></div>

            {/* President Info Section */}
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-white" />
                President Info
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('presidentName')}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Za-z.,\- ]/g, '');
                      setValue('presidentName', e.target.value);
                    }}
                    error={errors.presidentName?.message}
                    label="President Name"
                    placeholder="e.g. John Doe"
                    disabled={setupMutation.isPending}
                  />
                  <Input
                    {...register('presidentRegNum')}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 7);
                      setValue('presidentRegNum', e.target.value);
                    }}
                    error={errors.presidentRegNum?.message}
                    label="President Reg. No"
                    placeholder="e.g. 2023123"
                    disabled={setupMutation.isPending}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('presidentEmail')}
                    error={errors.presidentEmail?.message}
                    label="President Email Address"
                    placeholder="e.g. president@giki.edu.pk"
                    disabled={setupMutation.isPending}
                  />
                  <Input
                    {...register('presidentContact')}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                      setValue('presidentContact', e.target.value);
                    }}
                    error={errors.presidentContact?.message}
                    label="President Contact Number"
                    placeholder="e.g. 03001234567"
                    disabled={setupMutation.isPending}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Faculty</label>
                    <CustomDropdown 
                      className="w-full" 
                      placeholder="Select Faculty" 
                      options={[
                        {value:"FCSE",label:"FCSE"},
                        {value:"FEE",label:"FEE"},
                        {value:"FCVE",label:"FCVE"},
                        {value:"FME",label:"FME"},
                        {value:"FCME",label:"FCME"},
                        {value:"FMTE",label:"FMTE"},
                        {value:"MGS",label:"MGS"},
                        {value:"FES",label:"FES"}
                      ]} 
                      {...register('presidentFaculty')}
                      value={watch('presidentFaculty')}
                      onChange={(e: any) => setValue('presidentFaculty', e.target.value, { shouldValidate: true })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mid Line */}
            <div className="w-full h-px bg-white/10 my-6"></div>

            {/* Society Social Section */}
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-white" />
                Society Socials
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('instagram')}
                    error={errors.instagram?.message}
                    label="Instagram URL"
                    placeholder="https://instagram.com/..."
                    leftIcon={<Share2 className="w-4 h-4" />}
                    disabled={setupMutation.isPending}
                  />
                  <Input
                    {...register('facebook')}
                    error={errors.facebook?.message}
                    label="Facebook URL"
                    placeholder="https://facebook.com/..."
                    leftIcon={<Share2 className="w-4 h-4" />}
                    disabled={setupMutation.isPending}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('linkedin')}
                    error={errors.linkedin?.message}
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/..."
                    leftIcon={<Link2 className="w-4 h-4" />}
                    disabled={setupMutation.isPending}
                  />
                  <Input
                    {...register('website')}
                    error={errors.website?.message}
                    label="Official Website"
                    placeholder="https://..."
                    leftIcon={<Globe className="w-4 h-4" />}
                    disabled={setupMutation.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto px-8 bg-white text-black hover:bg-white/90"
                isLoading={setupMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                {isEditing ? 'Save Changes' : 'Initialize Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
