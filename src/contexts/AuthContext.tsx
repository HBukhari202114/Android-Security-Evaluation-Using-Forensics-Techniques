
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'mobileForensicsHubAuth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Used to prevent flash of login page
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      // localStorage might not be available (e.g. SSR, or private browsing)
      console.warn("Could not access localStorage for authentication state:", error);
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch (error) {
      console.warn("Could not set localStorage for authentication state:", error);
    }
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.warn("Could not remove localStorage for authentication state:", error);
    }
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
