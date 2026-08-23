import { CustomDropdown } from '@/components/ui/CustomDropdown';
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Plus,
  Trash2,
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
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get('tab') === 'council' ? 'council' : 'info';
  const [activeTab, setActiveTab] = useState<'info' | 'council'>(defaultTab as any);

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
    control,
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

  const { fields: councilFields, append: appendCouncil, remove: removeCouncil, replace: replaceCouncil } = useFieldArray({ control, name: 'executiveCouncil' });

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
      isEditing ? societyService.updateSociety({ ...data, executiveCouncil: data.executiveCouncil ? JSON.stringify(data.executiveCouncil) : undefined } as any) : societyService.setupSociety({ ...data, executiveCouncil: data.executiveCouncil ? JSON.stringify(data.executiveCouncil) : undefined } as any),
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
    setupMutation.mutate({ ...data, executiveCouncil: data.executiveCouncil ? JSON.stringify(data.executiveCouncil) : undefined } as any);
  };

  if (isLoadingSociety) {
    return <div className="p-8 text-center text-fog font-medium text-sm">Loading society profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
          {isEditing ? 'Edit Society Profile' : 'Setup Society Profile'}
        </h1>
        <p className="text-gray-400 font-medium">
          {isEditing ? 'Update your society information.' : 'Complete your profile to activate your society account.'}
        </p>
      </div>

      {serverError && <Alert type="error" message={serverError} />}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-8 pt-4">
        <button type="button" onClick={() => setActiveTab('info')} className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'info' ? 'border-b-2 border-white text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}>Society Info</button>
        <button type="button" onClick={() => setActiveTab('council')} className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'council' ? 'border-b-2 border-white text-white' : 'border-b-2 border-transparent text-gray-400 hover:text-white'}`}>Executive Council</button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SOCIETY INFO TAB */}
        <div className={activeTab === 'info' ? 'block space-y-8' : 'hidden'}>
          <div className="bg-[#1e2025]/50 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-8 shadow-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <Building2 className="w-5 h-5 text-gray-400" /> Society Info
            </h3>

            <div className="space-y-6">
              <Input
                label="Society Name"
                placeholder="e.g. ACM GIKI Chapter"
                icon={<Building2 className="w-4 h-4" />}
                {...register('name')}
                error={errors.name?.message}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'SOCIETY', label: 'Society' },
                      { value: 'CLUB', label: 'Club' },
                      { value: 'TEAM', label: 'Team' },
                    ]}
                    value={selectedType}
                    onChange={(val) => setValue('type', val as any)}
                    placeholder="Select Type"
                  />
                  {errors.type?.message && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                    value={watch('categoryId')}
                    onChange={(val) => setValue('categoryId', val)}
                    placeholder="Select Category"
                    isLoading={isLoadingCategories}
                  />
                  {errors.categoryId?.message && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('shortDescription')}
                  placeholder="A brief one-line description of your society..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none font-medium"
                />
                {errors.shortDescription?.message && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.shortDescription.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Long Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('longDescription')}
                  placeholder="Detailed description of your society's vision, goals, and activities..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none font-medium"
                />
                {errors.longDescription?.message && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.longDescription.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <ImageUploader
                  label="Society Logo"
                  value={logoUrl}
                  onChange={(url) => setValue('logoUrl', url)}
                  error={errors.logoUrl?.message}
                  aspectRatio="square"
                />
                <ImageUploader
                  label="Society Banner Image"
                  value={bannerUrl}
                  onChange={(url) => setValue('bannerUrl', url)}
                  error={errors.bannerUrl?.message}
                  aspectRatio="video"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#1e2025]/50 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <Share2 className="w-5 h-5 text-gray-400" /> Social Links (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Instagram" placeholder="Instagram Profile URL" {...register('instagram')} error={errors.instagram?.message} />
              <Input label="Facebook" placeholder="Facebook Page URL" {...register('facebook')} error={errors.facebook?.message} />
              <Input label="LinkedIn" placeholder="LinkedIn Page URL" {...register('linkedin')} error={errors.linkedin?.message} />
              <Input label="Website" placeholder="Official Website URL" {...register('website')} error={errors.website?.message} />
            </div>
          </div>
        </div>

        {/* EXECUTIVE COUNCIL TAB */}
        <div className={activeTab === 'council' ? 'block space-y-8' : 'hidden'}>
          {/* President Section */}
          <div className="bg-[#1e2025]/50 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-blue-500/30 uppercase tracking-widest">Fixed Position</div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <User className="w-5 h-5 text-gray-400" /> President Info
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="President Name" placeholder="Full Name" {...register('presidentName')} error={errors.presidentName?.message} required />
              <Input label="Registration Number" placeholder="e.g. 2023123" {...register('presidentRegNum')} error={errors.presidentRegNum?.message} required />
              <Input label="Contact Number" placeholder="e.g. 0300-1234567" {...register('presidentContact')} error={errors.presidentContact?.message} required />
              <Input label="Email Address" type="email" placeholder="president@giki.edu.pk" {...register('presidentEmail')} error={errors.presidentEmail?.message} required />
              
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Faculty <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={[
                    { value: 'FCSE', label: 'FCSE' },
                    { value: 'FMCE', label: 'FMCE' },
                    { value: 'FES', label: 'FES' },
                    { value: 'FCME', label: 'FCME' },
                    { value: 'FME', label: 'FME' },
                    { value: 'FSM', label: 'FSM' },
                  ]}
                  value={watch('presidentFaculty')}
                  onChange={(val) => setValue('presidentFaculty', val)}
                  placeholder="Select Faculty"
                />
                {errors.presidentFaculty?.message && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.presidentFaculty.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Other Members Section */}
          <div className="bg-[#1e2025]/50 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" /> Other Executive Members
              </h3>
              <Button type="button" onClick={() => appendCouncil({ role: 'Executive Member', name: '', regNum: '', email: '', contact: '', faculty: 'FCSE' })} className="btn-secondary !px-4 !py-2 !text-xs !bg-white/10 !border-white/20 hover:!bg-white/20">
                <Plus className="w-4 h-4 mr-1.5" /> Add Member
              </Button>
            </div>
            
            <div className="space-y-6">
              {councilFields.map((field, index) => {
                const currentRole = watch(`executiveCouncil.${index}.role`);
                const PREDEFINED_ROLES = ['Executive Member', 'Vice President', 'Event Coordinator', 'General Secretary', 'Treasurer', 'Director Liaison', 'Director Sponsors', 'Director Tech', 'Director Socials'];
                const isCustomRole = !PREDEFINED_ROLES.includes(currentRole) && currentRole !== undefined && currentRole !== '';
                const dropdownValue = isCustomRole ? 'Other' : (currentRole || 'Executive Member');

                return (
                  <div key={field.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 relative">
                    <button type="button" onClick={() => removeCouncil(index)} className="absolute top-5 right-5 text-gray-500 hover:text-red-400 transition-colors p-1" title="Remove Member">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <h4 className="text-md font-bold text-white mb-2 pb-2 border-b border-white/5 inline-block">Member {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Position</label>
                        <select
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                          value={dropdownValue}
                          onChange={(e) => {
                            if (e.target.value === 'Other') {
                              setValue(`executiveCouncil.${index}.role`, '');
                            } else {
                              setValue(`executiveCouncil.${index}.role`, e.target.value);
                            }
                          }}
                        >
                          {PREDEFINED_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          <option value="Other">Other (Custom Position)</option>
                        </select>
                      </div>

                      {dropdownValue === 'Other' && (
                        <div>
                          <label className="block text-[11px] font-bold text-blue-400 mb-1.5 uppercase tracking-wider">Custom Position Name *</label>
                          <input 
                            {...register(`executiveCouncil.${index}.role` as const)} 
                            className="w-full bg-black/20 border border-blue-500/30 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/70 transition-colors"
                            placeholder="Type position name..."
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
                        <input {...register(`executiveCouncil.${index}.name` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="Full Name" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Reg Number *</label>
                        <input {...register(`executiveCouncil.${index}.regNum` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="e.g. 2023123" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
                        <input type="email" {...register(`executiveCouncil.${index}.email` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="Email" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Contact Number *</label>
                        <input {...register(`executiveCouncil.${index}.contact` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="Phone Number" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                        <select {...register(`executiveCouncil.${index}.faculty` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors appearance-none">
                          <option value="FCSE">FCSE</option>
                          <option value="FMCE">FMCE</option>
                          <option value="FES">FES</option>
                          <option value="FCME">FCME</option>
                          <option value="FME">FME</option>
                          <option value="FSM">FSM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              {councilFields.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm font-medium border border-dashed border-white/10 rounded-2xl">
                  No other executive members added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/10">
          <Button
            type="submit"
            isLoading={setupMutation.isPending}
            className="btn-primary !px-8 !py-3 !text-sm !font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
          >
            {isEditing ? 'Save Changes' : 'Complete Setup'}
          </Button>
        </div>
      </form>
    </div>
  );
};