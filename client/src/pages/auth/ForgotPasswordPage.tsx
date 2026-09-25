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
          className="flex items-center justify-center space-x-3 hover:opacity-85 transition-opacity"
        >
          <GraduationCap className="w-8 h-8 text-brand-primary" />
          <h1 className="text-3xl font-bold tracking-wide text-text-primary">Campus GIKI</h1>
        </Link>
        <p className="text-text-secondary text-sm font-medium">
          Centralized Platform for GIKI Students & Societies
        </p>
      </div>

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-xl p-8 space-y-6 bg-surface-card backdrop-blur-md rounded-2xl border border-border-subtle shadow-card">
        {submittedEmail ? (
          <div className="space-y-6 text-center animate-fade-in py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">Check Your Inbox</h2>
              <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                If an account is associated with{' '}
                <strong className="text-text-primary font-semibold underline underline-offset-2">
                  {submittedEmail}
                </strong>
                , a secure password reset link has been dispatched.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border-subtle text-xs text-text-secondary text-left space-y-2">
              <div className="flex items-center gap-2 text-text-primary font-semibold">
                <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Security Guidelines</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-text-muted">
                <li>
                  The password reset link is valid for <strong>15 minutes</strong>.
                </li>
                <li>Be sure to check your spam/junk folder if not received.</li>
              </ul>
            </div>

            <Link
              to="/login"
              className="group w-full flex items-center justify-center py-3 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all duration-200 shadow-md cursor-pointer"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-text-primary">Reset Your Password</h2>
              <p className="text-sm text-text-secondary">
                Enter your registered email address to receive a secure recovery link
              </p>
            </div>

            {serverError && <Alert variant="error" message={serverError} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-text-secondary"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="w-4 h-4 text-text-muted" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border-medium rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 transition-all"
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
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-semibold">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotMutation.isPending}
                className="group w-full flex items-center justify-center py-3 px-4 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/40 transition-all duration-200 cursor-pointer shadow-md"
              >
                {forgotMutation.isPending ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
                {!forgotMutation.isPending && (
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-text-secondary hover:text-text-primary transition-colors gap-1.5 font-medium"
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
