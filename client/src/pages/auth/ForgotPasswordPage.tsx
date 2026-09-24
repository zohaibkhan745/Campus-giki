import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Shield } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: '' },
  });

  const forgotMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authService.forgotPassword(data),
    onSuccess: (_, variables) => {
      setServerError(null);
      setSubmittedEmail(variables.email);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const resp = error.response?.data?.message;
      setServerError(
        Array.isArray(resp)
          ? resp.join(', ')
          : resp || 'Unable to process request. Please try again.',
      );
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setServerError(null);
    forgotMutation.mutate(data);
  };

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
        {submittedEmail ? (
          <div className="space-y-6 text-center animate-fade-in py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Check Your Inbox</h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
                If an account is associated with{' '}
                <strong className="text-white font-semibold underline underline-offset-2">
                  {submittedEmail}
                </strong>
                , a secure password reset link has been dispatched.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/20 border border-white/10 text-xs text-gray-300 text-left space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Security Guidelines</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>
                  The password reset link is valid for <strong>15 minutes</strong>.
                </li>
                <li>Be sure to check your spam/junk folder if not received.</li>
              </ul>
            </div>

            <Link
              to="/login"
              className="group w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-200 text-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all duration-300 shadow-xl cursor-pointer"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
              <p className="text-sm text-gray-300">
                Enter your registered email address to receive a secure recovery link
              </p>
            </div>

            {serverError && <Alert variant="error" message={serverError} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-200"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-500/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                    placeholder="e.g. acm@giki.edu.pk or faculty@giki.edu.pk"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1 font-semibold">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotMutation.isPending}
                className="group w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all duration-300 cursor-pointer"
              >
                {forgotMutation.isPending ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
                {!forgotMutation.isPending && (
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                )}
              </button>

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
