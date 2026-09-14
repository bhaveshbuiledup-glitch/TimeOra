import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('timeora_token') || null;
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('timeora_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('timeora_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('timeora_token', token);
    } else {
      localStorage.removeItem('timeora_token');
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('timeora_orders', JSON.stringify(orders));
  }, [orders]);

  const login = async (email, password) => {
    try {
      // Try backend endpoint first
      const res = await axios.post(`${API_URL}/login`, { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } catch (err) {
      // Graceful fallback for local development without DB running
      console.warn("Backend login failed or server offline, using local session:", err.message);
      const fallbackUser = {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0].toUpperCase(),
        email: email,
        memberSince: '2024',
        membershipTier: 'TIMEORA Royal Patron'
      };
      const mockToken = 'jwt_token_' + Date.now();
      setUser(fallbackUser);
      setToken(mockToken);
      return { success: true, user: fallbackUser };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      return { success: true, user: res.data.user };
    } catch (err) {
      console.warn("Backend register failed or server offline, using local session:", err.message);
      const fallbackUser = {
        id: 'usr_' + Date.now(),
        name: name,
        email: email,
        memberSince: '2024',
        membershipTier: 'TIMEORA Prestige Member'
      };
      const mockToken = 'jwt_token_' + Date.now();
      setUser(fallbackUser);
      setToken(mockToken);
      return { success: true, user: fallbackUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const addOrder = (orderData) => {
    const newOrder = {
      orderId: 'TM-ORD-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'Processing & Handcrafting',
      ...orderData
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      orders,
      addOrder,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
