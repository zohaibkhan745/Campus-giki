export type Role = 'STUDENT' | 'SOCIETY' | 'ADVISOR' | 'DSA_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string | null;
  advisor?: {
    id: string;
    department: string;
    designation: string;
  };
  society?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
  };
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

export interface ActivateSocietyPayload {
  token: string;
  email: string;
  password: string;
  presidentName: string;
  presidentRegNum: string;
  presidentContact: string;
}
