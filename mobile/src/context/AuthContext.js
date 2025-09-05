import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Updated to match frontend
      const userData = await AsyncStorage.getItem('userData');
      const expiresAt = await AsyncStorage.getItem('expiresAt');
      
      if (token) {
        // Check if token has expired
        if (expiresAt) {
          const expireDate = new Date(expiresAt);
          if (expireDate < new Date()) {
            // Token expired, clear storage
            await AsyncStorage.multiRemove(['token', 'userData', 'expiresAt']);
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
            return;
          }
        }
        
        if (userData) {
          setUser(JSON.parse(userData));
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, { 
        email, 
        password 
      });

      if (response.data.success && response.data.token) {
        const { token, user: baseUser } = response.data;

        // Immediately call getUserName after receiving token
        let user = baseUser || {};
        let username = '';
        const usernameRes = await axios.post(
          `${API_BASE_URL}/api/getUserName`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (usernameRes.data.success) {
          user.username = usernameRes.data.username;
          username = usernameRes.data.username;
        }

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('username', username || '');
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        setUser(user);

        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);

      if (response.data.success) {
        // For signup, we might not get a token immediately due to email verification
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'userData', 'expiresAt']);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

