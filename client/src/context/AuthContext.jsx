import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkAuthStatus } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await checkAuthStatus();
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserPoints = (points) => {
    setUser(prev => ({ ...prev, auraPoints: points }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        login, 
        logout: logoutUser,
        updateUserPoints,
        refreshAuth: checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
