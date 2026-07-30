import { api } from '@/lib/api';
import type {
  AuthResponse,
  LoginPayload,
  RegisterStudentPayload,
  UserProfile,
} from '@/types/auth.types';

export const authService = {
  async registerStudent(payload: RegisterStudentPayload): Promise<AuthResponse> {
    return api.post('/auth/register/student', payload);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return api.post('/auth/login', payload);
  },

  async getProfile(): Promise<UserProfile> {
    return api.get('/auth/profile');
  },

  async updateProfile(payload: Partial<UserProfile> & { currentPassword?: string; newPassword?: string; department?: string; designation?: string }): Promise<UserProfile> {
    return api.patch('/auth/profile', payload);
  },
};
