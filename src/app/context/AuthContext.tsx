import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface UserType {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<any>;
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
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to parse stored auth details:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email?: string, password?: string) => {
    const data = await api.login(email, password);
    // data is expected to be { token, user }
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // For legacy components using localStorage directly
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userName', data.user.name);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
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
