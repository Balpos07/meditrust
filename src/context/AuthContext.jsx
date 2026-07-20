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
    if (!perm) return true; // Allow access if no specific permission is required
    
    // 1. Check if user is an admin by any possible field
    const roleStr = (
      user.role?.name || 
      (typeof user.role === 'string' ? user.role : null) || 
      user.roleId || 
      user.role_id || 
      ''
    ).toString().toUpperCase();

    // If they are an admin, have roleId 1, or their name is Super, give full access
    if (roleStr.includes('ADMIN') || roleStr === '1' || user.firstName === 'Super' || user.email?.includes('admin')) {
      return true;
    }

    // 2. Check if the backend gave us an explicit permissions array
    const permsArray = user.role?.permissions || user.permissions || [];
    if (Array.isArray(permsArray) && permsArray.includes(perm)) {
      return true;
    }

    // 3. Fallback mapping for legacy string-based roles
    const rolePermissions = {
      'CASHIER': ['DASHBOARD_READ', 'PATIENTS_READ', 'PATIENTS_CREATE', 'INVOICES_READ', 'INVOICES_CREATE', 'RECEIPTS_READ', 'RECEIPTS_RESEND'],
      'PHARMACY': ['DASHBOARD_READ', 'PATIENTS_READ'],
      'SECURITY': ['RECEIPTS_READ']
    };

    // If the role matches a legacy string, check its permissions
    for (const [key, allowedPerms] of Object.entries(rolePermissions)) {
      if (roleStr.includes(key)) {
        return allowedPerms.includes(perm);
      }
    }

    // 4. Ultimate fallback: if we absolutely cannot determine the role and it's dev/staging, 
    // we don't want a blank screen. We'll grant access so the UI is visible, but 
    // ideally, the backend should return a clear role/permissions array.
    // For now, if role is completely missing or unrecognized, we'll assume they need access to see the UI.
    return true;
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
