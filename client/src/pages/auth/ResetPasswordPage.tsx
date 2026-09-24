import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      authService.resetPassword({
        token,
        email,
        password: data.password,
      }),
    onSuccess: () => {
      setServerError(null);
      setIsSuccess(true);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const resp = error.response?.data?.message;
      setServerError(
        Array.isArray(resp)
          ? resp.join(', ')
          : resp || 'Failed to reset password. The link may have expired or is invalid.',
      );
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token || !email) {
      setServerError('Missing reset token or email. Please request a new recovery link.');
      return;
    }
    setServerError(null);
    resetMutation.mutate(data);
  };

  if (!token || !email) {
    return (
      <main className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 space-y-6">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="flex items-center justify-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <GraduationCap className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold tracking-wide">Campus GIKI</h1>
          </Link>
          <p className="text-gray-300 text-sm font-medium">
            Centralized Platform for GIKI Students & Societies
          </p>
        </div>

        <div className="w-full max-w-xl p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Invalid Reset Link</h2>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
              This password reset link is invalid, incomplete, or has expired. Please request a new link
              from the recovery page.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/forgot-password"
              className="group w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-200 text-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all duration-300 cursor-pointer"
            >
              <span>Request New Reset Link</span>
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="text-center pt-1">
              <Link
                to="/login"
                className="inline-flex items-center text-xs text-gray-300 hover:text-white transition-colors gap-1.5 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 space-y-6">
      {/* Branding Header */}
      <div className="text-center space-y-2">
        <Link
          to="/"
          className="flex items-center justify-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <GraduationCap className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold tracking-wide">Campus GIKI</h1>
        </Link>
        <p className="text-gray-300 text-sm font-medium">
          Centralized Platform for GIKI Students & Societies
        </p>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-xl p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
        {isSuccess ? (
          <div className="space-y-6 text-center animate-fade-in py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Password Updated</h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
                Your password has been successfully reset. You can now sign in to Campus GIKI with your
                new credentials.
              </p>
            </div>

            <Link
              to="/login"
              className="group w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-200 text-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all duration-300 shadow-xl cursor-pointer"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-sm text-gray-300">
                Create a new password for{' '}
                <span className="text-white font-semibold underline underline-offset-2">
                  {email}
                </span>
              </p>
            </div>

            {serverError && <Alert variant="error" message={serverError} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* New Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-200"
                >
                  New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                    placeholder="At least 6 characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 font-semibold">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-200"
                >
                  Confirm New Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                    placeholder="Re-enter your new password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) =>
                        val === watch('password') || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 font-semibold">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="group w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all duration-300 cursor-pointer"
              >
                {resetMutation.isPending ? 'Updating Password...' : 'Reset Password'}
                {!resetMutation.isPending && (
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              {/* Navigation Back */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-gray-300 hover:text-white transition-colors gap-1.5 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
};
