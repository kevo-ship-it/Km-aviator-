import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { LoginRequest, RegisterRequest, ResetPasswordRequest } from "@shared/schema";

interface User {
  id: number;
  phone: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoginPending: boolean;
  isRegisterPending: boolean;
  isResetPending: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [isRegisterPending, setIsRegisterPending] = useState(false);
  const [isResetPending, setIsResetPending] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          setUser(user);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (data: LoginRequest) => {
    setIsLoginPending(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", data);
      const user = await res.json();
      setUser(user);
    } finally {
      setIsLoginPending(false);
    }
  };
  
  const register = async (data: RegisterRequest) => {
    setIsRegisterPending(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const user = await res.json();
      setUser(user);
    } finally {
      setIsRegisterPending(false);
    }
  };
  
  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    setUser(null);
  };
  
  const resetPassword = async (data: ResetPasswordRequest) => {
    setIsResetPending(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", data);
    } finally {
      setIsResetPending(false);
    }
  };
  
  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };
  
  const value = {
    user,
    isLoading,
    isLoginPending,
    isRegisterPending,
    isResetPending,
    login,
    register,
    logout,
    resetPassword,
    refreshUser
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
  }
