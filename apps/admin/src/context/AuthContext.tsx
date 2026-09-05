import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'COUNTER_STAFF' | 'FIELD_WORKER' | 'CITIZEN';
  employeeCode?: string;
  email?: string;
  phone?: string;
  branchId?: string;
  branchName?: string;
  counterNumber?: number;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  quickLogin: (accountType: 'ADMIN' | 'STAFF_Q1' | 'STAFF_Q2' | 'MANAGER' | 'TECH') => Promise<void>;
  updateUser: (user: AdminUser, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'aquaflow_admin_token';
const USER_KEY = 'aquaflow_admin_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Khoi phuc phien dang nhap tu localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Tu dong lam sach neu token cu truoc day qua lon (> 1000 ky tu)
        if (savedToken.length > 1000) {
          localStorage.removeItem(TOKEN_KEY);
          quickLogin('ADMIN').catch(() => {
            setToken(null);
            setUser(null);
          });
        } else {
          setToken(savedToken);
          setUser(parsedUser);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await fetch('/api/v1/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json?.error?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
    }

    const { token: newToken, user: newUser } = json.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const updateUser = (newUser: AdminUser, newToken?: string) => {
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
    }
  };

  const quickLogin = async (_accountType: 'ADMIN' | 'STAFF' | string = 'ADMIN') => {
    await login('CW-ADMIN', '123456');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, quickLogin, updateUser }}>
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
