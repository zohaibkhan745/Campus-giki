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
        <h2 className="text-2xl font-extrabold text-vast-ink font-eb-garamond">Welcome Back</h2>
        <p className="text-sm font-medium text-fog">
          Sign in to your Campus GIKI account to continue
        </p>
      </div>

      {serverError && <Alert variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          variant="wispr"
          label="Email Address"
          type="email"
          placeholder="student@giki.edu.pk"
          leftIcon={<Mail className="w-4 h-4" />}
          disabled={loginMutation.isPending}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          variant="wispr"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-vast-ink hover:text-fog transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

      <div className="text-center pt-2 text-sm font-medium text-fog border-t border-vast-ink">
        Don&apos;t have a student account?{' '}
        <Link
          to="/register"
          className="text-forest-ink hover:text-vast-ink font-semibold transition-colors underline"
        >
          Register here
        </Link>
      </div>
    </div>
  );
};
