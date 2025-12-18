"use client";

import { useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import type { User, LoginCredentials } from "../types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.status === "success" && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return {
        success: false,
        error: response.message || "Login failed",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
