import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService, STORAGE_KEYS } from '../services/storageService';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  email: 'admin@retailflow.com',
  password: 'Admin@123',
  name: 'Rajesh Verma (Admin)',
  role: 'Inventory Operations Lead',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return storageService.get(STORAGE_KEYS.AUTH, null);
  });
  const [loading, setLoading] = useState(false);

  const login = (email, password) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cleanEmail = email.trim().toLowerCase();
        // Check demo credentials or case-insensitive email
        if (cleanEmail === DEMO_CREDENTIALS.email.toLowerCase() && password === DEMO_CREDENTIALS.password) {
          const authUser = {
            id: 'USR-ADMIN-01',
            email: DEMO_CREDENTIALS.email,
            name: DEMO_CREDENTIALS.name,
            role: DEMO_CREDENTIALS.role,
            avatar: DEMO_CREDENTIALS.avatar,
            loggedInAt: new Date().toISOString()
          };
          storageService.set(STORAGE_KEYS.AUTH, authUser);
          setUser(authUser);
          setLoading(false);
          resolve(authUser);
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password. Use demo credentials: admin@retailflow.com / Admin@123'));
        }
      }, 400);
    });
  };

  const logout = () => {
    storageService.remove(STORAGE_KEYS.AUTH);
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    storageService.set(STORAGE_KEYS.AUTH, updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
