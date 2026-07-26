export type Role = 'STUDENT' | 'SOCIETY' | 'ADVISOR' | 'DSA_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterStudentPayload {
  email: string;
  fullName: string;
  password: string;
}
