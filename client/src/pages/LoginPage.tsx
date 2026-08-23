import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
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
    onSuccess: (data) => {
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
            <div className="flex items-center justify-center space-x-3">
                <GraduationCap className="w-8 h-8 text-white" />
                <h1 className="text-3xl font-bold tracking-wide">Campus GIKI</h1>
            </div>
            <p className="text-gray-300 text-sm font-medium">Centralized Platform for GIKI Students & Societies</p>
        </div>

        <div className="w-full max-w-xl p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
            
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Welcome</h2>
                <p className="text-sm text-gray-300">Sign in to continue</p>
            </div>

            {serverError && (
              <Alert variant="error" message={serverError} />
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-200">Email Address *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            id="email"
                            className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-500/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                            placeholder="e.g. acm@giki.edu.pk"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.email.message}</p>}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-200">Password *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="w-full pl-10 pr-10 py-3 bg-black/20 border border-gray-500/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                            placeholder="********"
                            {...register('password')}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="group w-full flex items-center justify-center py-3 px-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-all duration-300"
                >
                    {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                    {!loginMutation.isPending && <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />}
                </button>
            </form>
            
            <div className="pt-5 border-t border-gray-400/30">
                <p className="text-center text-xs text-gray-400 leading-relaxed">
                    Authorized personnel only. Society accounts are provisioned via DSA invitation.
                </p>
            </div>
        </div>
    </main>
  );
};

