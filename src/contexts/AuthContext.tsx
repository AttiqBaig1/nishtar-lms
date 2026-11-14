import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { storageService } from '../services/storageService';

// Demo build: everything is stored in this browser (localStorage).
export const isDemoMode = true;

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean; // admin or supervisor
  isSuspended: boolean;
  deviceId: string;
  language: 'en' | 'ur';
  isDemo: boolean;
  /** Admin / supervisor sign-in. */
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  /** Student sign-in with an access key. */
  loginWithKey: (key: string, profile?: { name: string; phone: string }) =>
    Promise<{ success: boolean; needsProfile?: boolean; message?: string }>;
  logout: () => void;
  setLanguage: (lang: 'en' | 'ur') => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'nma_session_uid';

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'device-server';
  let id = localStorage.getItem('nma_device_id');
  if (!id) {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    id = 'dev-' + a[0].toString(36) + a[1].toString(36);
    localStorage.setItem('nma_device_id', id);
  }
  return id;
}

function restoreSession(): UserProfile | null {
  const uid = localStorage.getItem(SESSION_KEY);
  if (!uid) return null;
  const user = storageService.getUserById(uid);
  if (!user || user.status === 'suspended') {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return user;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(restoreSession);
  const [language, setLangState] = useState<'en' | 'ur'>('en');
  const [deviceId] = useState<string>(getOrCreateDeviceId);

  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  // Students: track the device for the per-key device limit.
  useEffect(() => {
    if (currentUser?.role === 'student') {
      storageService.registerSession(currentUser.uid, deviceId, navigator.userAgent);
    }
  }, [currentUser, deviceId]);

  const startSession = (user: UserProfile) => {
    localStorage.setItem(SESSION_KEY, user.uid);
    setCurrentUser(user);
  };

  const refreshUser = useCallback(() => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const fresh = storageService.getUserById(prev.uid);
      if (!fresh || fresh.status === 'suspended') {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return fresh;
    });
  }, []);

  const login = async (email: string, pass: string) => {
    if (!email.trim() || !pass) return { success: false, message: 'Enter your email and password.' };
    const res = await storageService.authenticateStaff(email, pass);
    if (!res.ok || !res.user) return { success: false, message: res.message };
    startSession(res.user);
    return { success: true };
  };

  const loginWithKey = async (key: string, profile?: { name: string; phone: string }) => {
    if (!key.trim()) return { success: false, message: 'Enter your access key.' };
    const res = await storageService.loginWithKey(key, deviceId, profile);
    if (!res.ok || !res.user) return { success: false, needsProfile: res.needsProfile, message: res.message };
    const device = storageService.registerSession(res.user.uid, deviceId, navigator.userAgent);
    if (!device.allowed) return { success: false, message: device.message };
    startSession(res.user);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  const role = currentUser?.role || null;
  const value: AuthContextType = {
    currentUser,
    role,
    isAuthenticated: Boolean(currentUser),
    isAdmin: role === 'admin',
    isStaff: role === 'admin' || role === 'supervisor',
    isSuspended: currentUser?.status === 'suspended',
    deviceId,
    language,
    isDemo: isDemoMode,
    login,
    loginWithKey,
    logout,
    setLanguage: setLangState,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
