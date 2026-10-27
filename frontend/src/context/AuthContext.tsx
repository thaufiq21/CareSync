import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Language } from '@/types';
import { authApi } from '@/services/api';
import translations from '@/i18n/translations';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: object) => Promise<void>;
  register: (data: object) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');

  const t = useCallback((key: keyof typeof translations.en): string => {
    return (translations[language] as Record<string, string>)[key] ?? translations.en[key] ?? key;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('caresync_lang', lang);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authApi.me();
      setUser(u);
      setLanguageState(u.preferred_language as Language);
      localStorage.setItem('caresync_lang', u.preferred_language);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('caresync_lang') as Language | null;
    if (savedLang) setLanguageState(savedLang);

    refreshUser().finally(() => setIsLoading(false));

    // Handle session expiry
    const handler = () => {
      setUser(null);
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [refreshUser]);

  const login = async (data: object) => {
    const u = await authApi.login(data);
    setUser(u);
    setLanguageState(u.preferred_language as Language);
    localStorage.setItem('caresync_lang', u.preferred_language);
  };

  const register = async (data: object) => {
    const u = await authApi.register(data);
    setUser(u);
    setLanguageState(u.preferred_language as Language);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    localStorage.removeItem('caresync_lang');
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      login, register, logout, refreshUser,
      language, setLanguage, t,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
