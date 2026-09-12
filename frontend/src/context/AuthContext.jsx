import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('veloop_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('veloop_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user session", error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token, logout]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    if (data.token) {
      localStorage.setItem('veloop_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    if (data.token) {
      localStorage.setItem('veloop_token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
  };

  const updateBalance = (currency, amount) => {
    if (user) {
      setUser(prev => ({
        ...prev,
        balances: {
          ...prev.balances,
          [currency]: amount
        }
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
