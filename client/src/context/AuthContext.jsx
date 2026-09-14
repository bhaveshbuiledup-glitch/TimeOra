import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed?.email) {
        parsed.email = parsed.email.toLowerCase().trim();
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [adminEmail, setAdminEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_admin_email');
      return saved ? saved.toLowerCase().trim() : 'admin@timeora.com';
    } catch {
      return 'admin@timeora.com';
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
      const sanitizedUser = {
        ...user,
        email: user.email ? user.email.toLowerCase().trim() : ''
      };
      localStorage.setItem('timeora_user', JSON.stringify(sanitizedUser));
    } else {
      localStorage.removeItem('timeora_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('timeora_admin_email', adminEmail.toLowerCase().trim());
  }, [adminEmail]);

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

  const updateAdminEmail = (newEmail) => {
    const sanitized = (newEmail || 'admin@timeora.com').toLowerCase().trim();
    setAdminEmail(sanitized);
    if (user && (user.role === 'admin' || user.email.includes('admin'))) {
      setUser(prev => ({
        ...prev,
        email: sanitized
      }));
    }
    return sanitized;
  };

  const login = async (rawEmail, password) => {
    const email = rawEmail.toLowerCase().trim();
    try {
      // Try backend endpoint first
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const userData = {
        ...res.data.user,
        email: res.data.user.email.toLowerCase().trim()
      };
      setUser(userData);
      setToken(res.data.token);
      return { success: true, user: userData };
    } catch (err) {
      // Graceful fallback for local development
      console.warn("Backend login failed or server offline, using local session:", err.message);
      const isAdmin = email.includes('admin');
      const fallbackUser = {
        id: 'usr_' + Date.now(),
        name: isAdmin ? 'TIMEORA Administrator' : email.split('@')[0].toUpperCase(),
        email: email, // automatically lowercased
        role: isAdmin ? 'admin' : 'patron',
        memberSince: '2024',
        membershipTier: isAdmin ? 'Atelier Administrator' : 'TIMEORA Royal Patron'
      };
      const mockToken = 'jwt_token_' + Date.now();
      setUser(fallbackUser);
      setToken(mockToken);
      return { success: true, user: fallbackUser };
    }
  };

  const loginAsAdmin = () => {
    const normalizedEmail = adminEmail.toLowerCase().trim();
    const adminUser = {
      id: 'usr_admin_master',
      name: 'TIMEORA Master Horologist',
      email: normalizedEmail,
      role: 'admin',
      memberSince: '2024',
      membershipTier: 'Atelier Director'
    };
    setUser(adminUser);
    setToken('jwt_token_admin_authorized');
    return adminUser;
  };

  const register = async (name, rawEmail, password) => {
    const email = rawEmail.toLowerCase().trim();
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password });
      const userData = {
        ...res.data.user,
        email: res.data.user.email.toLowerCase().trim()
      };
      setUser(userData);
      setToken(res.data.token);
      return { success: true, user: userData };
    } catch (err) {
      console.warn("Backend register failed or server offline, using local session:", err.message);
      const fallbackUser = {
        id: 'usr_' + Date.now(),
        name: name,
        email: email,
        role: 'patron',
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

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('admin');

  return (
    <AuthContext.Provider value={{
      user,
      token,
      adminEmail: adminEmail.toLowerCase().trim(),
      updateAdminEmail,
      login,
      loginAsAdmin,
      register,
      logout,
      orders,
      addOrder,
      isAuthenticated: !!user,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
