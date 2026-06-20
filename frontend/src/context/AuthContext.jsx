import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  
  // Critical for security and stability: Sync token and user status
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else if (!token || !user) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (token || user) {
         setToken(null);
         setUser(null);
      }
    }
  }, [token, user]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  const signup = async (userData) => {
    await api.post('/auth/signup', userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
