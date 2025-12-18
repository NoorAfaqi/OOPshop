import { apiService } from "./api.service";
import { API_ENDPOINTS } from "../config/api.config";
import type { CheckoutData, Invoice } from "../types";

class CheckoutService {
  /**
   * Process checkout
   */
  async processCheckout(checkoutData: CheckoutData) {
    return apiService.post<Invoice>(
      API_ENDPOINTS.CHECKOUT,
      checkoutData,
      false
    );
  }
}

export const checkoutService = new CheckoutService();

