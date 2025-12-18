import { apiService } from "./api.service";
import { API_ENDPOINTS } from "../config/api.config";
import type { User, Invoice, Payment } from "../types";

class UserService {
  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    return apiService.get<User[]>(API_ENDPOINTS.USERS, true);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number) {
    return apiService.get<User>(API_ENDPOINTS.USER_BY_ID(id), true);
  }

  /**
   * Update user
   */
  async updateUser(id: number, userData: Partial<User>) {
    return apiService.put<User>(API_ENDPOINTS.USER_BY_ID(id), userData, true);
  }

  /**
   * Get user's invoices/orders
   */
  async getUserInvoices(userId: number) {
    return apiService.get<Invoice[]>(`${API_ENDPOINTS.USER_BY_ID(userId)}/invoices`, true);
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userId: number) {
    return apiService.get<Payment[]>(`${API_ENDPOINTS.USER_BY_ID(userId)}/payments`, true);
  }
}

export const userService = new UserService();
