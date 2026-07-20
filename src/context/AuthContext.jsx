import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  // Helper to check if user has a specific permission or is an ADMIN
  const hasPermission = useCallback((perm) => {
    if (!user) return false;
    if (user.role?.name === 'ADMIN') return true;
    return user.role?.permissions?.includes(perm);
  }, [user]);

  const logoutLocally = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    // Listen for the custom logout event from axios interceptor
    const handleLogoutEvent = () => logoutLocally();
    window.addEventListener('auth:logout', handleLogoutEvent);

    const initializeAuth = () => {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (err) {
          logoutLocally();
        }
      } else {
        logoutLocally();
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [logoutLocally]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { accessToken, refreshToken, user: userData } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(accessToken);
      setUser(userData);
      
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      logoutLocally();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
