import { apiService } from "./api.service";
import { API_ENDPOINTS, STORAGE_KEYS } from "../config/api.config";
import type { LoginCredentials, AuthResponse, User } from "../types";

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials) {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials,
      false
    );

    if (response.status === "success" && response.data) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response;
  }

  /**
   * Logout user
   */
  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Set authentication token
   */
  private setToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Set user data
   */
  private setUser(user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  /**
   * Get token
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export const authService = new AuthService();
