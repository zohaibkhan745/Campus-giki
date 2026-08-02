import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Target route after successful login
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
    onSuccess: (data) => {
      setServerError(null);

      // Role-Based Redirection Strategy
      if (fromLocation) {
        navigate(fromLocation, { replace: true });
        return;
      }

      switch (data.user.role) {
        case 'DSA_ADMIN':
          navigate('/dashboard', { replace: true });
          break;
        case 'SOCIETY':
          navigate('/dashboard', { replace: true });
          break;
        case 'ADVISOR':
          navigate('/dashboard', { replace: true });
          break;
        case 'STUDENT':
        default:
          navigate('/dashboard', { replace: true });
          break;
      }
    },
    onError: (error: AxiosError<{ message?: string | string[]; error?: string }>) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Invalid email address or password. Please try again.';

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
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-[26px] font-extrabold text-vast-ink leading-tight font-eb-garamond">
          Management Portal
        </h1>
        <p className="text-sm font-medium text-fog">
          Authorized sign-in for Society Executives, Faculty Advisors, and DSA Administration.
        </p>
      </div>

      {serverError && <Alert variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. acm@giki.edu.pk"
          leftIcon={<Mail className="w-4 h-4 text-vast-ink" />}
          disabled={loginMutation.isPending}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password *"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4 text-vast-ink" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-fog hover:text-vast-ink transition-colors cursor-pointer p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          disabled={loginMutation.isPending}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="wispr"
          size="md"
          className="w-full mt-2"
          isLoading={loginMutation.isPending}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center pt-3 text-xs font-medium text-fog border-t border-vast-ink/20">
        Authorized personnel only. Society accounts are provisioned via DSA invitation.
      </div>
    </div>
  );
};
