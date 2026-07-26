import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  registerStudentSchema,
  type RegisterStudentFormData,
} from '@/lib/validations/auth.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { AxiosError } from 'axios';

export const RegisterPage: React.FC = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStudentFormData>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterStudentFormData) =>
      registerStudent({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }),
    onSuccess: () => {
      setServerError(null);
      navigate('/dashboard', { replace: true });
    },
    onError: (
      error: AxiosError<{ message?: string | string[]; error?: string }>,
    ) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Registration failed. Please check your information.';

      if (Array.isArray(respMessage)) {
        errText = respMessage.join(', ');
      } else if (typeof respMessage === 'string') {
        errText = respMessage;
      }

      setServerError(errText);
    },
  });

  const onSubmit = (data: RegisterStudentFormData) => {
    setServerError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-vast-ink font-eb-garamond">Create Student Account</h2>
        <p className="text-sm font-medium text-fog">
          Join Campus GIKI to discover societies, events & activities
        </p>
      </div>

      {serverError && <Alert variant="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          variant="wispr"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          leftIcon={<User className="w-4 h-4" />}
          disabled={registerMutation.isPending}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          variant="wispr"
          label="Email Address"
          type="email"
          placeholder="student@giki.edu.pk"
          leftIcon={<Mail className="w-4 h-4" />}
          disabled={registerMutation.isPending}
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
          disabled={registerMutation.isPending}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          variant="wispr"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-vast-ink hover:text-fog transition-colors focus:outline-none"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          disabled={registerMutation.isPending}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="wispr"
          size="md"
          className="w-full mt-2"
          isLoading={registerMutation.isPending}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center pt-2 text-sm font-medium text-fog border-t border-vast-ink">
        Already have a registered account?{' '}
        <Link
          to="/login"
          className="text-forest-ink hover:text-vast-ink font-semibold transition-colors underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
};
