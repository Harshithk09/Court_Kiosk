import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { buildApiUrl } from '../utils/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('sessionToken'));

  const logout = useCallback(async () => {
    try {
      if (sessionToken) {
        await fetch(buildApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSessionToken(null);
      localStorage.removeItem('sessionToken');
    }
  }, [sessionToken]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/me'), {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [sessionToken, logout]);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (sessionToken) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [sessionToken, checkAuthStatus]);

  const login = async (username, password) => {
    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setSessionToken(data.session_token);
        localStorage.setItem('sessionToken', data.session_token);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };


  const isAuthenticated = () => {
    return user !== null;
  };

  const hasRole = (role) => {
    return user && (user.role === role || user.role === 'admin');
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getAuthHeaders,
    sessionToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
