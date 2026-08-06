// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api'; // adjust if your api.js is elsewhere
import {
  getToken,
  setToken as setTokenStorage,
  removeToken,
  getUser,
  setUser as setUserStorage,
  removeUser,
  clearAuthData,
} from '../utils/storage';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser()); // load from storage initially
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Load user on mount (or when token changes)
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.auth.getMe(storedToken);
        if (data.user) {
          setUser(data.user);
          setUserStorage(data.user);
        } else {
          // Token invalid – clear everything
          clearAuthData();
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        // On any error (401, network, etc.) clear auth data
        console.error('Auth load error:', err);
        clearAuthData();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []); // run once on mount; you can add [token] to re‑load when token changes

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const data = await api.auth.login(email, password);
      if (data.token && data.user) {
        setTokenStorage(data.token);
        setToken(data.token);
        setUser(data.user);
        setUserStorage(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.message || 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // --- REGISTER ---
  const register = async (userData) => {
    try {
      const data = await api.auth.register(userData);
      if (data.token && data.user) {
        setTokenStorage(data.token);
        setToken(data.token);
        setUser(data.user);
        setUserStorage(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.message || 'Registration failed' };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // --- LOGOUT ---
  const logout = async () => {
    try {
      // Optionally call backend logout API
      if (token) await api.auth.logout(token);
    } catch (err) {
      console.error('Logout error:', err);
    }
    // Clear local storage and state
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  // Value provided to consumers
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Also export the context itself (optional)
export default AuthContext;