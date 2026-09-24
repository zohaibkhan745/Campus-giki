import { api } from '@/lib/api';
import type {
  AuthResponse,
  LoginPayload,
  RegisterStudentPayload,
  ActivateSocietyPayload,
  ActivateAdvisorPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UserProfile,
} from '@/types/auth.types';

export const authService = {
  async registerStudent(payload: RegisterStudentPayload): Promise<AuthResponse> {
    return api.post('/auth/register/student', payload);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return api.post('/auth/login', payload);
  },

  async activateSociety(payload: ActivateSocietyPayload): Promise<AuthResponse> {
    return api.post('/auth/activate-society', payload);
  },

  async activateAdvisor(payload: ActivateAdvisorPayload): Promise<AuthResponse> {
    return api.post('/auth/activate-advisor', payload);
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    return api.post('/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    return api.post('/auth/reset-password', payload);
  },

  async getProfile(): Promise<UserProfile> {
    return api.get('/auth/profile');
  },

  async updateProfile(payload: Partial<UserProfile> & { currentPassword?: string; newPassword?: string; department?: string; designation?: string }): Promise<UserProfile> {
    return api.patch('/auth/profile', payload);
  },
};
