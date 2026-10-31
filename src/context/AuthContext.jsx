import React, { createContext, useContext, useState } from 'react';
import { authApi, tokenStorage } from '../services/apiService';

// Demo credentials for the login page helper box
export const DEMO_CREDENTIALS = {
  email: 'admin@retailflow.com',
  password: 'Admin@123',
};

const AuthContext = createContext(null);

// Session key for non-sensitive user info (email, role, id)
const SESSION_KEY = 'retailflow_auth_session';

function getStoredUser() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(email.trim().toLowerCase(), password);
      // data = { token, user: { id, email, role, name } }
      tokenStorage.set(data.token);
      const authUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0],
        role: data.user.role,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, role = 'staff', firstName = '', lastName = '') => {
    setLoading(true);
    try {
      const data = await authApi.register(email.trim().toLowerCase(), password, role, firstName, lastName);
      tokenStorage.set(data.token);
      const authUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || `${firstName} ${lastName}`.trim() || data.user.email.split('@')[0],
        role: data.user.role,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.remove();
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
