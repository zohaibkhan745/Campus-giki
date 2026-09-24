import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, GraduationCap, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

interface ActivateAdvisorFormData {
  password: string;
  confirmPassword: string;
}

export const ActivateAdvisorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { refetchUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivateAdvisorFormData>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const activateMutation = useMutation({
    mutationFn: (data: ActivateAdvisorFormData) =>
      authService.activateAdvisor({
        token,
        email,
        password: data.password,
      }),
    onSuccess: (data) => {
      setServerError(null);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      refetchUser().finally(() => {
        navigate('/dashboard', { replace: true });
      });
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const resp = error.response?.data?.message;
      setServerError(Array.isArray(resp) ? resp.join(', ') : resp || 'Activation failed. Link may have expired.');
    },
  });

  const onSubmit = (data: ActivateAdvisorFormData) => {
    if (!token || !email) {
      setServerError('Missing activation token or email. Please check your invitation email.');
      return;
    }
    setServerError(null);
    activateMutation.mutate(data);
  };

  if (!token || !email) {
    return (
      <main className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-md p-8 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Invalid Activation Link</h2>
          <p className="text-sm text-gray-400">
            This faculty advisor activation link is missing required parameters. Please refer to your official invitation email.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 space-y-6">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Faculty Advisor Portal</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Nominated account for <strong className="text-emerald-400">{email}</strong>
          </p>
        </div>

        {serverError && (
          <Alert variant="error" message={serverError} className="border-red-500/30 bg-red-500/10 text-red-400 text-xs" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Create Portal Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose a confidential password (min. 6 characters)"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === watch('password') || 'Passwords do not match',
                })}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={activateMutation.isPending}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {activateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Advisor Portal...</span>
              </>
            ) : (
              <>
                <span>Activate Account & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
};
