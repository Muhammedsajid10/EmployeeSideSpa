import React, { createContext, useContext, useState, useEffect } from 'react';
import API_CONFIG, { apiCall } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Verify token with backend
  const verifyToken = async (token) => {
    try {
      const data = await apiCall(API_CONFIG.ENDPOINTS.AUTH.ME);
      
      // Check if user is an employee
      if (data.data.user.role !== 'employee') {
        throw new Error('Access denied. This portal is for employees only.');
      }
      
      setIsAuthenticated(true);
      setUser(data.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // For username/email login, we need to handle both cases
      const loginData = {
        email: credentials.username, // Backend expects email field
        password: credentials.password
      };

      const data = await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      const { token, data: { user } } = data;
      
      // Check if user is an employee
      if (user.role !== 'employee') {
        return { 
          success: false, 
          error: 'Access denied. This portal is for employees only.' 
        };
      }
      
      setIsAuthenticated(true);
      setUser(user);
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Network error. Please check your connection and try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Call logout endpoint
        await apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

