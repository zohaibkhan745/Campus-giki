import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, Mail, Lock, User, IdCard, Phone, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

interface ActivateFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  presidentName: string;
  presidentRegNum: string;
  presidentContact: string;
}

export const ActivateSocietyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activateSociety } = useAuth();

  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivateFormValues>({
    defaultValues: {
      email: initialEmail,
      password: '',
      confirmPassword: '',
      presidentName: '',
      presidentRegNum: '',
      presidentContact: '',
    },
  });

  const passwordValue = watch('password');

  const mutation = useMutation({
    mutationFn: async (values: ActivateFormValues) => {
      if (!token) {
        throw new Error('Activation token is missing from the link URL.');
      }
      return activateSociety({
        token,
        email: values.email,
        password: values.password,
        presidentName: values.presidentName,
        presidentRegNum: values.presidentRegNum,
        presidentContact: values.presidentContact,
      });
    },
    onSuccess: () => {
      setServerError(null);
      // Redirect newly activated society to their profile setup or dashboard
      navigate('/society/setup', { replace: true });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      const msg = err.response?.data?.message || err.message || 'Failed to activate society account.';
      setServerError(msg);
    },
  });

  const onSubmit = (values: ActivateFormValues) => {
    mutation.mutate(values);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-red-500/30 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Invalid Activation Link</h2>
          <p className="text-sm text-slate-400">
            This invitation link appears to be missing a security token. Please check your invitation email or contact the Directorate of Student Affairs (DSA).
          </p>
          <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/login')}>
            Return to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header Header Branding */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Official Portal Onboarding
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Activate Society Account
          </h1>
          <p className="text-sm text-slate-400">
            Set your management credentials to claim your society&apos;s GIKI portal
          </p>
        </div>

        {/* Main Activation Card */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          {serverError && (
            <Alert variant="error" message={serverError} />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field (Prefilled) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Society Email</label>
              <div className="relative">
                <Input
                  {...register('email', { required: 'Email is required' })}
                  readOnly
                  className="pl-10 bg-slate-950/50 border-slate-800 text-slate-400 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* President Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">President / Lead Full Name</label>
              <div className="relative">
                <Input
                  {...register('presidentName', { required: 'President full name is required' })}
                  placeholder="e.g. Muhammad Ali"
                  className="pl-10 bg-slate-950/80 border-slate-800 focus:border-blue-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
              {errors.presidentName && (
                <p className="text-xs text-red-400">{errors.presidentName.message}</p>
              )}
            </div>

            {/* Registration Number & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Reg #</label>
                <div className="relative">
                  <Input
                    {...register('presidentRegNum', { required: 'Reg # is required' })}
                    placeholder="2022-CS-000"
                    className="pl-10 bg-slate-950/80 border-slate-800 focus:border-blue-500 uppercase"
                  />
                  <IdCard className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
                {errors.presidentRegNum && (
                  <p className="text-xs text-red-400">{errors.presidentRegNum.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Contact</label>
                <div className="relative">
                  <Input
                    {...register('presidentContact', { required: 'Contact phone is required' })}
                    placeholder="0300-1234567"
                    className="pl-10 bg-slate-950/80 border-slate-800 focus:border-blue-500"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
                {errors.presidentContact && (
                  <p className="text-xs text-red-400">{errors.presidentContact.message}</p>
                )}
              </div>
            </div>

            {/* Set Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Create Permanent Password</label>
              <div className="relative">
                <Input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="pl-10 pr-10 bg-slate-950/80 border-slate-800 focus:border-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <Input
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === passwordValue || 'Passwords do not match',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="pl-10 bg-slate-950/80 border-slate-800 focus:border-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Activating Account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Activate Society Portal
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivateSocietyPage;
