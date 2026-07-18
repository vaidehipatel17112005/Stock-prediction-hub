import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, useGetCurrentUser } from '@workspace/api-client-react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('stockai_token'));
  
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('stockai_token'));
  }, []);

  const { data: user, isLoading, refetch } = useGetCurrentUser({
    query: { enabled: !!token }
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('stockai_token', newToken);
    setToken(newToken);
    setAuthTokenGetter(() => newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem('stockai_token');
    setToken(null);
    setAuthTokenGetter(() => null);
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'admin',
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
