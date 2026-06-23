import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface UserType {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isAdmin: boolean;
  role: 'admin' | 'employee' | 'customer';
  isVerified: boolean;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<any>;
  requestOTP: (phone: string) => Promise<any>;
  verifyOTP: (phone: string, code: string, name?: string, email?: string) => Promise<any>;
  register: (name: string, email: string, phone: string, password: string) => Promise<any>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to parse stored auth details:', err);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email?: string, password?: string) => {
    const data = await api.login(email, password);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('userId', data.user.id);
      sessionStorage.setItem('userName', data.user.name);
    }
    return data;
  };

  const requestOTP = async (phone: string) => {
    return await api.requestOTP(phone);
  };

  const verifyOTP = async (phone: string, code: string, name?: string, email?: string) => {
    const data = await api.verifyOTP(phone, code, name, email);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('userId', data.user.id || data.user._id);
      sessionStorage.setItem('userName', data.user.name);
    }
    return data;
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const data = await api.register(name, email, phone, password);
    // Note: Registration might not log the user in immediately if email verification is required,
    // but we can return data to handle verify redirection.
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, requestOTP, verifyOTP, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
