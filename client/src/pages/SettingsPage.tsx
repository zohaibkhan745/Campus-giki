import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useMutation } from '@tanstack/react-query';
import { Shield, KeyRound, User, Briefcase, Building2, Check, ArrowLeft, Image, Camera } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ImageUploader } from '@/components/common/ImageUploader';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

export const SettingsPage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();

  // Profile State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [faculty, setFaculty] = useState(user?.advisor?.department || '');
  const [designation, setDesignation] = useState(user?.advisor?.designation || '');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAvatarUrl(user.avatarUrl || '');
      setFaculty(user.advisor?.department || '');
      setDesignation(user.advisor?.designation || '');
    }
  }, [user]);

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
      payload.department = faculty;
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
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight mb-8">Personal Profile</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="relative z-1 w-full p-8 rounded-[18px] bg-white/[0.08] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] text-white space-y-6 text-left">
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleProfileSubmit(e);
            if (currentPassword && newPassword) {
              handlePasswordSubmit(e);
            }
          }} className="space-y-6">
            
            {/* General Section */}
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-white" />
                General Information
              </h3>

              {/* Profile Alerts */}
              {profileSuccess && (
                <Alert
                  variant="success"
                  message="Profile updated successfully!"
                  className="mb-4"
                />
              )}
              {profileError && (
                <Alert
                  variant="error"
                  message={profileError}
                  className="mb-4"
                />
              )}
              
              <div className="space-y-6">
                {/* Profile Picture & Account Information */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-2">
                  <div className="shrink-0 flex flex-col items-center">
                    <ImageUploader
                      label="Profile Picture"
                      value={avatarUrl}
                      onChange={(url) => setAvatarUrl(url)}
                      folder="avatars"
                      shape="circle"
                      fallbackImage={isAdvisor ? '/default-advisor.jpg' : '/default-dsa.png'}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Email</label>
                      <div className="w-full bg-[#111111] text-gray-400 text-sm rounded-lg border border-white/10 px-4 py-3 cursor-not-allowed">
                        {user.email}
                      </div>
                    </div>

                    <Input
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. John Doe"
                      required
                    />
                  </div>
                </div>

                {isAdvisor && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Faculty</label>
                      <CustomDropdown
                        options={[ { value: 'FCSE', label: 'FCSE' }, { value: 'FEE', label: 'FEE' }, { value: 'FME', label: 'FME' }, { value: 'FCVE', label: 'FCVE' }, { value: 'FCME', label: 'FCME' }, { value: 'FMTE', label: 'FMTE' }, { value: 'FES', label: 'FES' }, { value: 'FBS', label: 'FBS' }, { value: 'MGS', label: 'MGS' } ]}
                        value={faculty}
                        onChange={(e: any) => setFaculty(e.target.value)}
                        placeholder="Select Faculty"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Designation</label>
                      <CustomDropdown
                        options={[
                          { value: 'Lecturer', label: 'Lecturer' },
                          { value: 'Assistant Professor', label: 'Assistant Professor' },
                          { value: 'Associate Professor', label: 'Associate Professor' },
                          { value: 'Professor', label: 'Professor' }
                        ]}
                        value={designation}
                        onChange={(e: any) => setDesignation(e.target.value)}
                        placeholder="Select Designation"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mid Line */}
            <div className="w-full h-px bg-white/10 my-6"></div>

            {/* Security Section */}
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-white" />
                Security & Password
              </h3>

              {/* Password Alerts */}
              {passwordSuccess && (
                <Alert
                  variant="success"
                  message="Password updated successfully!"
                  className="mb-4"
                />
              )}
              {passwordError && (
                <Alert
                  variant="error"
                  message={passwordError}
                  className="mb-4"
                />
              )}

              <div className="space-y-4">
                <Input
                  type="password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="******"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Input
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="******"
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="******"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto px-8 bg-white text-black hover:bg-white/90"
                isLoading={profileMutation.isPending || passwordMutation.isPending}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

