import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type {
  AuthResponse,
  LoginPayload,
  RegisterStudentPayload,
  UserProfile,
} from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  registerStudent: (payload: RegisterStudentPayload) => Promise<AuthResponse>;
  activateSociety: (payload: import('@/types/auth.types').ActivateSocietyPayload) => Promise<AuthResponse>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  const saveAuthSession = (authData: AuthResponse) => {
    setToken(authData.accessToken);
    setUser(authData.user);
    localStorage.setItem('token', authData.accessToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.clear();
  }, [queryClient]);

  const refetchUser = useCallback(async () => {
    const activeToken = localStorage.getItem('token');
    if (!activeToken) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await authService.login(payload);
    saveAuthSession(response);
    return response;
  };

  const registerStudent = async (
    payload: RegisterStudentPayload,
  ): Promise<AuthResponse> => {
    const response = await authService.registerStudent(payload);
    saveAuthSession(response);
    return response;
  };

  const activateSociety = async (
    payload: import('@/types/auth.types').ActivateSocietyPayload,
  ): Promise<AuthResponse> => {
    const response = await authService.activateSociety(payload);
    saveAuthSession(response);
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        registerStudent,
        activateSociety,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
