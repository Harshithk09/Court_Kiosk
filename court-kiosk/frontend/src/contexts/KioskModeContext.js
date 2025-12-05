import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const KioskModeContext = createContext();

export const useKioskMode = () => {
  const context = useContext(KioskModeContext);
  if (!context) {
    throw new Error('useKioskMode must be used within a KioskModeProvider');
  }
  return context;
};

export const KioskModeProvider = ({ children }) => {
  // Get auth context to check if user is admin
  // Note: This provider must be inside AuthProvider in App.js
  const { user } = useAuth();
  
  // Check localStorage for kiosk mode setting
  const [isKioskMode, setIsKioskMode] = useState(() => {
    const saved = localStorage.getItem('kioskMode');
    return saved === 'true';
  });

  // Check if user is admin
  const isAdmin = user && (user.role === 'admin' || user.username);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('kioskMode', isKioskMode.toString());
  }, [isKioskMode]);

  const toggleKioskMode = (newValue) => {
    // Only allow admins to toggle
    if (isAdmin) {
      setIsKioskMode(newValue !== undefined ? newValue : !isKioskMode);
    }
  };

  const value = {
    isKioskMode,
    toggleKioskMode,
    isAdmin
  };

  return (
    <KioskModeContext.Provider value={value}>
      {children}
    </KioskModeContext.Provider>
  );
};

