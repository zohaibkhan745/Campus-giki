import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    meta: { notify: false },
    onSuccess: () => {
      setServerError(null);

      if (fromLocation) {
        navigate(fromLocation, { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    },
    onError: (error: AxiosError<{ message?: string | string[]; error?: string }>) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Invalid email address or password. Please try again.';

      if (error.message === 'Network Error') {
        errText = 'Network Error: Cannot connect to backend server. Is it running?';
      }

      if (Array.isArray(respMessage)) {
        errText = respMessage.join(', ');
      } else if (typeof respMessage === 'string') {
        errText = respMessage;
      }

      setServerError(errText);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    loginMutation.mutate(data);
  };

  return (
    <main className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 space-y-6">
        
        <div className="text-center space-y-2">
            <Link to="/" className="flex items-center justify-center space-x-3 hover:opacity-80 transition-opacity">
                <GraduationCap className="w-8 h-8 text-brand-primary" />
                <h1 className="text-3xl font-bold tracking-wide text-text-primary">Campus GIKI</h1>
            </Link>
            <p className="text-text-secondary text-sm font-medium">Centralized Platform for GIKI Students & Societies</p>
        </div>

        <div className="w-full max-w-xl p-8 space-y-6 bg-surface-glass backdrop-blur-lg rounded-2xl border border-border-medium shadow-elevation-2">
            
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-text-primary">Welcome</h2>
                <p className="text-sm text-text-secondary">Sign in to continue</p>
            </div>

            {serverError && (
              <Alert variant="error" message={serverError} />
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="w-4 h-4 text-text-muted" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            className="w-full pl-10 pr-4 py-3 bg-surface border border-border-medium rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                            placeholder="e.g. acm@giki.edu.pk"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Password *</label>
                        <Link to="/forgot-password" className="text-xs text-brand-primary hover:underline font-medium transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock className="w-4 h-4 text-text-muted" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="w-full pl-10 pr-10 py-3 bg-surface border border-border-medium rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                            placeholder="********"
                            {...register('password')}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="group w-full flex items-center justify-center py-3 px-4 bg-text-primary hover:opacity-90 disabled:opacity-50 text-text-inverse rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-300 cursor-pointer"
                >
                    {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                    {!loginMutation.isPending && <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />}
                </button>
            </form>
        </div>
    </main>
  );
};
