'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authApi, AuthResponse } from './api-client';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<{ requiresVerification: boolean }>;
  logout:   () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { accessToken } = await authApi.login({ email, password });
      setState({ accessToken, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await authApi.register({ email, name, password });
      setState(s => ({ ...s, isLoading: false }));
      return res;
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setState({ accessToken: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => setState(s => ({ ...s, error: null })), []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
