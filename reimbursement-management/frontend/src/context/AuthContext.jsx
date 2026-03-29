import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup, GoogleAuthProvider, signOut,
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const saveUser = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const clearUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Email/password signup (creates company on first signup)
  const signup = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.signup(formData);
      saveUser(res.data.user, res.data.access_token);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // Email/password login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      saveUser(res.data.user, res.data.access_token);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in via Firebase
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName } = result.user;
      const res = await authAPI.firebaseLogin({ firebase_uid: uid, email, full_name: displayName });
      saveUser(res.data.user, res.data.access_token);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await signOut(auth); } catch {}
    clearUser();
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.me();
      const updated = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch {}
  }, [user]);

  useEffect(() => {
    setInitialized(true);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isDirector = user?.role === 'director';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider value={{
      user, loading, initialized,
      signup, login, loginWithGoogle, logout, refreshUser,
      isAdmin, isManager, isDirector, isEmployee,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
