import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { Shield, KeyRound, User, Briefcase, Building2, Check, ArrowLeft, Image } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

export const SettingsPage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();

  // Profile State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [department, setDepartment] = useState(user?.advisor?.department || '');
  const [designation, setDesignation] = useState(user?.advisor?.designation || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isAdvisor = user?.role === 'ADVISOR';

  const profileMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: async () => {
      await refetchUser();
      setProfileSuccess(true);
      setProfileError(null);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to update profile.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setProfileError(errText);
    },
  });

  const passwordMutation = useMutation({
    meta: { notify: true },
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const respMessage = error.response?.data?.message;
      let errText = 'Failed to update password.';
      if (Array.isArray(respMessage)) errText = respMessage.join(', ');
      else if (typeof respMessage === 'string') errText = respMessage;
      setPasswordError(errText);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    const payload: any = { fullName, avatarUrl };
    if (isAdvisor) {
      payload.department = department;
      payload.designation = designation;
    }

    profileMutation.mutate(payload);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex items-center gap-4 relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border border-vast-ink/20 object-cover shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-full border border-vast-ink/20 bg-lumen-stone flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Account Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Personal Profile
          </h1>
          <p className="text-sm text-gray-300">
            Manage your general information and security credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Information Panel */}
        <div className="relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white space-y-5 text-left">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2 border-b-2 border-vast-ink/10 pb-3">
            <User className="w-5 h-5 text-indigo-300" />
            General Information
          </h3>

          {profileError && null /* Removed error alert */}
          {profileSuccess && null /* Removed success alert */}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Account Email</label>
              <div className="w-full bg-lavender-whisper text-gray-300 text-sm rounded-inputs border border-vast-ink/20/20 px-3.5 py-2.5 font-mono cursor-not-allowed">
                {user.email}
              </div>
            </div>

            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Avatar URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              leftIcon={<Image className="w-4 h-4" />}
            />

            {isAdvisor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  required
                />
                <Input
                  label="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Associate Professor"
                  required
                />
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto px-8"
                isLoading={profileMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Security / Password Panel */}
        <div className="relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white space-y-5 text-left">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2 border-b-2 border-vast-ink/10 pb-3">
            <KeyRound className="w-5 h-5 text-amber-500" />
            Security & Password
          </h3>

          {passwordError && null /* Removed error alert */}
          {passwordSuccess && null /* Removed success alert */}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto px-8"
                isLoading={passwordMutation.isPending}
                leftIcon={<Shield className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
