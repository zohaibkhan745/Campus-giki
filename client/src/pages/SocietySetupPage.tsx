import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { globalNotification } from '@/contexts/NotificationContext';
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2, User,
  Share2,
  Trash2,
  Plus,
  Users
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
      mode: 'onTouched',
    defaultValues: {
      name: '',
      type: 'SOCIETY',
      categoryId: '',
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
      vp: { role: 'Vice President', name: '', regNum: '', contact: '', email: '', faculty: '' },
      gs: { role: 'General Secretary', name: '', regNum: '', contact: '', email: '', faculty: '' },
      ec: { role: 'Event Coordinator', name: '', regNum: '', contact: '', email: '', faculty: '' },
      treasurer: { role: 'Treasurer', name: '', regNum: '', contact: '', email: '', faculty: '' },
        dl: { role: 'Director Liaison', name: '', regNum: '', contact: '', email: '', faculty: '' },
      otherMembers: [],
    },
  });

  const logoUrl = watch('logoUrl');
  const bannerUrl = watch('bannerUrl');
  const selectedType = watch('type');

  const { fields: otherMembers, append: appendMember, remove: removeMember } = useFieldArray({
    control,
    name: 'otherMembers',
  });

  useEffect(() => {
    if (mySociety) {
      let vp = { role: 'Vice President' };
      let gs = { role: 'General Secretary' };
      let ec = { role: 'Event Coordinator' };
      let treasurer = { role: 'Treasurer' };
      let dl = { role: 'Director Liaison' };
      let others: any[] = [];

      try {
        if (mySociety?.executiveCouncil) {
          const council = JSON.parse(mySociety?.executiveCouncil as string);
          council.forEach((m: any) => {
            if (m.role === 'Vice President') vp = m;
            else if (m.role === 'General Secretary') gs = m;
            else if (m.role === 'Event Coordinator') ec = m;
            else if (m.role === 'Treasurer') treasurer = m;
            else if (m.role === 'Director Liaison') dl = m;
            // Deliberately NOT populating existing other members into the form cards per user request
          });
        }
      } catch (e) {}

      reset({
        name: mySociety.name || '',
        type: (mySociety.type as any) || 'SOCIETY',
        categoryId: mySociety.category?.id || '',
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
        vp, gs, ec, treasurer, dl, otherMembers: others
      });
    }
  }, [mySociety, reset]);

  const setupMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: any) => 
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
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setServerError(errText);
    },
  });

  const onSubmit = (data: SocietySetupFormData) => {
    setServerError('');
    
    // Auto-generate shortDescription
    const shortDesc = data.longDescription.length > 97 ? data.longDescription.substring(0, 97) + '...' : data.longDescription;
    
    // Assemble executive council JSON string
    const councilArray = [
      { ...data.vp, role: 'Vice President' },
      { ...data.ec, role: 'Event Coordinator' },
      { ...data.gs, role: 'General Secretary' },
      { ...data.treasurer, role: 'Treasurer' },
      { ...data.dl, role: 'Director Liaison' },
      // Preserve existing other members from database, and append any newly added ones from the form
      ...(mySociety?.executiveCouncil ? (() => {
        try {
          const c = JSON.parse(mySociety?.executiveCouncil as string);
          const coreRoles = ['Vice President', 'Event Coordinator', 'General Secretary', 'Treasurer', 'Director Liaison'];
          return c.filter((m: any) => !coreRoles.includes(m.role));
        } catch { return []; }
      })() : []),
      ...(data.otherMembers || [])
    ];

    const submitPayload: any = {
      ...data,
      shortDescription: shortDesc,
      executiveCouncil: JSON.stringify(councilArray),
    };
    
    // Remove individual components
    delete submitPayload.vp;
    delete submitPayload.ec;
    delete submitPayload.gs;
    delete submitPayload.treasurer;
      delete submitPayload.dl;
    delete submitPayload.otherMembers;

    setupMutation.mutate(submitPayload);
  };

  if (isLoadingSociety) {
    return <div className="p-8 text-center text-fog font-medium text-sm">Loading society profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-4 mb-24">
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

      {serverError && <Alert variant="error" message={serverError} />}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 mb-8 w-full shadow-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'info' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Building2 className="w-4 h-4" />
          <span>Society Info</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('council')}
          className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'council' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Users className="w-4 h-4" />
          <span>Executive Council</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit, () => globalNotification.triggerFailed('Executive members info not provided or invalid.'))} className="space-y-8">
        
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
                leftIcon={<Building2 className="w-4 h-4" />}
                {...register('name')}
                error={errors.name?.message}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Organization Type *
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'SOCIETY', label: 'Society' },
                      { value: 'CLUB', label: 'Club' },
                      { value: 'TEAM', label: 'Team' },
                    ]}
                    value={selectedType}
                    onChange={(e: any) => setValue('type', e.target.value as any)}
                    placeholder="Select Type"
                  />
                  {errors.type?.message && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Category *
                  </label>
                  <CustomDropdown
                    options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                    value={watch('categoryId')}
                    onChange={(e: any) => setValue('categoryId', e.target.value)}
                    placeholder="Select Category"
                    disabled={isLoadingCategories}
                  />
                  {errors.categoryId?.message && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.categoryId.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Description *
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

                <div className="flex flex-col sm:flex-row gap-6 pt-4 items-center">
                  <div className="w-48 shrink-0">
                    <ImageUploader
                      label="Society Logo"
                      value={logoUrl}
                      onChange={(url) => setValue('logoUrl', url)}
                      shape="circle"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <ImageUploader
                      label="Society Banner Image"
                      value={bannerUrl}
                      onChange={(url) => setValue('bannerUrl', url)}
                    />
                  </div>
                </div>
            </div>
          </div>

          <div className="bg-[#1e2025]/50 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <Share2 className="w-5 h-5 text-gray-400" /> Social Links (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Instagram" placeholder="Instagram Profile URL" {...register('instagram')}  error={errors.instagram?.message} />
              <Input label="Facebook" placeholder="Facebook Page URL" {...register('facebook')}  error={errors.facebook?.message} />
              <Input label="LinkedIn" placeholder="LinkedIn Page URL" {...register('linkedin')}  error={errors.linkedin?.message} />
              <Input label="Website" placeholder="Official Website URL" {...register('website')}  error={errors.website?.message} />
            </div>
          </div>
        </div>

        {/* EXECUTIVE COUNCIL TAB */}
        <div className={activeTab === 'council' ? 'block space-y-8' : 'hidden'}>
          {/* Executive Posts Section */}
          <div className="bg-[#1e2025]/50 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-8 shadow-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <User className="w-5 h-5 text-gray-400" /> Executive Posts
            </h3>
            
            {/* President */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-white uppercase tracking-wider">
                PRESIDENT</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name *" placeholder="Full Name" {...register('presidentName')} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z.,\- ]/g, '') }} error={errors.presidentName?.message} />
                <Input label="Reg Number *" placeholder="e.g. 2023123" {...register('presidentRegNum')} maxLength={7} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 7) }} error={errors.presidentRegNum?.message} />
                <Input label="Contact Number *" placeholder="e.g. 03001234567" {...register('presidentContact')} maxLength={11} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11) }} error={errors.presidentContact?.message} />
                <Input label="Email Address *" type="email" placeholder="president@giki.edu.pk" {...register('presidentEmail')}  error={errors.presidentEmail?.message} />
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                  <CustomDropdown value={watch('presidentFaculty')} onChange={(e: any) => setValue('presidentFaculty', e.target.value)} options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]} placeholder="Select Faculty" />
                  {errors.presidentFaculty?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.presidentFaculty.message}</p>}
                </div>
              </div>
            </div>
            
            <hr className="border-white/10" />

            {/* Vice President */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-white uppercase tracking-wider">
                VICE PRESIDENT</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name *" placeholder="Full Name" {...register('vp.name')} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z.,\- ]/g, '') }} error={errors.vp?.name?.message} />
                <Input label="Reg Number *" placeholder="e.g. 2023123" {...register('vp.regNum')} maxLength={7} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 7) }} error={errors.vp?.regNum?.message} />
                <Input label="Contact Number *" placeholder="e.g. 03001234567" {...register('vp.contact')} maxLength={11} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11) }} error={errors.vp?.contact?.message} />
                <Input label="Email Address *" type="email" placeholder="vp@giki.edu.pk" {...register('vp.email')}  error={errors.vp?.email?.message} />
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                  <CustomDropdown value={watch('vp.faculty')} onChange={(e: any) => setValue('vp.faculty', e.target.value)} options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]} placeholder="Select Faculty" />
                  {errors.vp?.faculty?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.vp.faculty.message}</p>}
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Event Coordinator */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-white uppercase tracking-wider">
                EVENT COORDINATOR</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name *" placeholder="Full Name" {...register('ec.name')} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z.,\- ]/g, '') }} error={errors.ec?.name?.message} />
                <Input label="Reg Number *" placeholder="e.g. 2023123" {...register('ec.regNum')} maxLength={7} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 7) }} error={errors.ec?.regNum?.message} />
                <Input label="Contact Number *" placeholder="e.g. 03001234567" {...register('ec.contact')} maxLength={11} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11) }} error={errors.ec?.contact?.message} />
                <Input label="Email Address *" type="email" placeholder="ec@giki.edu.pk" {...register('ec.email')}  error={errors.ec?.email?.message} />
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                  <CustomDropdown value={watch('ec.faculty')} onChange={(e: any) => setValue('ec.faculty', e.target.value)} options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]} placeholder="Select Faculty" />
                  {errors.ec?.faculty?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.ec.faculty.message}</p>}
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* General Secretary */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-white uppercase tracking-wider">
                GENERAL SECRETARY</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name *" placeholder="Full Name" {...register('gs.name')} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z.,\- ]/g, '') }} error={errors.gs?.name?.message} />
                <Input label="Reg Number *" placeholder="e.g. 2023123" {...register('gs.regNum')} maxLength={7} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 7) }} error={errors.gs?.regNum?.message} />
                <Input label="Contact Number *" placeholder="e.g. 03001234567" {...register('gs.contact')} maxLength={11} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11) }} error={errors.gs?.contact?.message} />
                <Input label="Email Address *" type="email" placeholder="gs@giki.edu.pk" {...register('gs.email')}  error={errors.gs?.email?.message} />
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                  <CustomDropdown value={watch('gs.faculty')} onChange={(e: any) => setValue('gs.faculty', e.target.value)} options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]} placeholder="Select Faculty" />
                  {errors.gs?.faculty?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.gs.faculty.message}</p>}
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Treasurer */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-white uppercase tracking-wider">
                TREASURER</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name *" placeholder="Full Name" {...register('treasurer.name')} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z.,\- ]/g, '') }} error={errors.treasurer?.name?.message} />
                <Input label="Reg Number *" placeholder="e.g. 2023123" {...register('treasurer.regNum')} maxLength={7} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 7) }} error={errors.treasurer?.regNum?.message} />
                <Input label="Contact Number *" placeholder="e.g. 03001234567" {...register('treasurer.contact')} maxLength={11} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11) }} error={errors.treasurer?.contact?.message} />
                <Input label="Email Address *" type="email" placeholder="treasurer@giki.edu.pk" {...register('treasurer.email')}  error={errors.treasurer?.email?.message} />
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                  <CustomDropdown value={watch('treasurer.faculty')} onChange={(e: any) => setValue('treasurer.faculty', e.target.value)} options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]} placeholder="Select Faculty" />
                  {errors.treasurer?.faculty?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.treasurer.faculty.message}</p>}
                </div>
              </div>
            </div>

              <div className="border-t border-white/10 my-8"></div>

              {/* Director Liaison */}
            <div className="space-y-4">
              <h4 className="text-md font-bold text-white uppercase tracking-wider">
                DIRECTOR LIAISON</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name *" placeholder="Full Name" {...register('dl.name')} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z.,\- ]/g, '') }} error={errors.dl?.name?.message} />
                <Input label="Reg Number *" placeholder="e.g. 2023123" {...register('dl.regNum')} maxLength={7} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 7) }} error={errors.dl?.regNum?.message} />
                <Input label="Contact Number *" placeholder="e.g. 03001234567" {...register('dl.contact')} maxLength={11} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11) }} error={errors.dl?.contact?.message} />
                <Input label="Email Address *" type="email" placeholder="dl@giki.edu.pk" {...register('dl.email')}  error={errors.dl?.email?.message} />
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                  <CustomDropdown value={watch('dl.faculty')} onChange={(e: any) => setValue('dl.faculty', e.target.value)} options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]} placeholder="Select Faculty" />
                  {errors.dl?.faculty?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.dl.faculty.message}</p>}
                </div>
              </div>
            </div>

          </div>

          {/* Other Members Section */}
          <div className="bg-[#1e2025]/50 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" /> Other Executive Members
              </h3>
              <button type="button" onClick={() => appendMember({ role: 'Executive Member', name: '', regNum: '', email: '', contact: '', faculty: 'FCSE' })} className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Add Member
                </button>
            </div>
            
            <div className="space-y-6">
              {otherMembers.map((field, index) => {
                const currentRole = watch(`otherMembers.${index}.role`);
                const PREDEFINED_ROLES = ['Executive Member', 'Director Liaison', 'Director Sponsors', 'Director Tech', 'Director Socials'];
                const isCustomRole = currentRole !== undefined && !PREDEFINED_ROLES.includes(currentRole);
                const dropdownValue = isCustomRole ? 'Other' : (currentRole || 'Executive Member');

                return (
                  <div key={field.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5 relative">
                    <button type="button" onClick={() => removeMember(index)} className="absolute top-5 right-5 text-gray-500 hover:text-red-400 transition-colors p-1" title="Remove Member">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <h4 className="text-md font-bold text-white mb-2 pb-2 border-b border-white/5 inline-block">Member {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Position *</label>
                        <CustomDropdown
                            value={dropdownValue}
                            onChange={(e: any) => {
                              if (e.target.value === 'Other') {
                                setValue(`otherMembers.${index}.role`, '');
                              } else {
                                setValue(`otherMembers.${index}.role`, e.target.value);
                              }
                            }}
                            options={[
                              { value: 'Executive Member', label: 'Executive Member' },
                              { value: 'Director Sponsors', label: 'Director Sponsors' },
                              { value: 'Director Tech', label: 'Director Tech' },
                              { value: 'Director Socials', label: 'Director Socials' },
                              { value: 'Other', label: 'Other (Custom Position)' }
                            ]}
                          />
                        {errors.otherMembers?.[index]?.role?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.otherMembers[index].role?.message}</p>}
                      </div>

                      {dropdownValue === 'Other' && (
                        <div>
                          <label className="block text-[11px] font-bold text-blue-400 mb-1.5 uppercase tracking-wider">Custom Position Name *</label>
                          <input 
                            {...register(`otherMembers.${index}.role` as const)} 
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
                        <input {...register(`otherMembers.${index}.name` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="Full Name" required onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z.,\- ]/g, '') }} />
                        {errors.otherMembers?.[index]?.name?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.otherMembers[index].name?.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Reg Number *</label>
                        <input {...register(`otherMembers.${index}.regNum` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="e.g. 2023123" required maxLength={7} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 7) }} />
                        {errors.otherMembers?.[index]?.regNum?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.otherMembers[index].regNum?.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
                        <input type="email" {...register(`otherMembers.${index}.email` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="Email" required />
                        {errors.otherMembers?.[index]?.email?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.otherMembers[index].email?.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Contact Number *</label>
                        <input {...register(`otherMembers.${index}.contact` as const)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 transition-colors" placeholder="Phone Number" required maxLength={11} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 11) }} />
                        {errors.otherMembers?.[index]?.contact?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.otherMembers[index].contact?.message}</p>}
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Faculty *</label>
                        <CustomDropdown value={watch(`otherMembers.${index}.faculty` as const)} onChange={(e: any) => setValue(`otherMembers.${index}.faculty` as const, e.target.value)} options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]} placeholder="Select Faculty" />
                        {errors.otherMembers?.[index]?.faculty?.message && <p className="text-red-400 text-xs mt-1 font-medium">{errors.otherMembers[index].faculty?.message}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
              {otherMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm font-medium border border-dashed border-white/10 rounded-2xl">
                  No other executive members added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
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






