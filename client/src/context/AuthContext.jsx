import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useTheme } from './ThemeContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('xpense_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('xpense_token') || null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('xpense_user', JSON.stringify(res.data.user));
            if (res.data.user.theme) {
              setTheme(res.data.user.theme);
            }
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('xpense_token', res.data.token);
      localStorage.setItem('xpense_user', JSON.stringify(res.data.user));
      if (res.data.user.theme) {
        setTheme(res.data.user.theme);
      }
    }
    return res.data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authService.register({ name, email, password, confirmPassword });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('xpense_token', res.data.token);
      localStorage.setItem('xpense_user', JSON.stringify(res.data.user));
      if (res.data.user.theme) {
        setTheme(res.data.user.theme);
      }
    }
    return res.data;
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('xpense_user', JSON.stringify(res.data.user));
      if (res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('xpense_token', res.data.token);
      }
      if (data.theme) {
        setTheme(data.theme);
      }
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('xpense_token');
    localStorage.removeItem('xpense_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
