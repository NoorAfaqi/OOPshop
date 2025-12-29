import { apiService } from "./api.service";
import { API_ENDPOINTS } from "../config/api.config";
import type { Product, CreateProductDto, ProductFilters } from "../types";

class ProductService {
  /**
   * Get all products
   */
  async getAllProducts(filters?: ProductFilters) {
    return apiService.get<Product[]>(
      API_ENDPOINTS.PRODUCTS,
      false,
      filters
    );
  }

  /**
   * Get product by ID
   */
  async getProductById(id: number) {
    return apiService.get<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      false
    );
  }

  /**
   * Create product (requires authentication)
   */
  async createProduct(product: CreateProductDto) {
    return apiService.post<Product>(
      API_ENDPOINTS.PRODUCTS,
      product,
      true
    );
  }

  /**
   * Update product (requires authentication)
   */
  async updateProduct(id: number, product: Partial<CreateProductDto>) {
    return apiService.put<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      product,
      true
    );
  }

  /**
   * Delete product (requires authentication)
   */
  async deleteProduct(id: number) {
    return apiService.delete(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      true
    );
  }

  /**
   * Fetch product from barcode (requires authentication)
   */
  async fetchFromBarcode(barcode: string) {
    return apiService.post<{ suggested: any }>(
      API_ENDPOINTS.PRODUCT_FROM_BARCODE,
      { barcode },
      true
    );
  }

  /**
   * Search products by name from OpenFoodFacts (requires authentication)
   */
  async searchProductsByName(searchTerm: string, limit: number = 20) {
    return apiService.post<{ products: any[] }>(
      API_ENDPOINTS.PRODUCT_SEARCH,
      { searchTerm, limit },
      true
    );
  }

  /**
   * Adjust product stock (requires authentication)
   */
  async adjustStock(productId: number, adjustment: {
    quantity_change: number;
    change_type?: 'purchase' | 'adjustment' | 'return' | 'damage' | 'other';
    reason?: string;
  }) {
    return apiService.post<Product>(
      `${API_ENDPOINTS.PRODUCT_BY_ID(productId)}/adjust-stock`,
      adjustment,
      true
    );
  }

  /**
   * Get stock history for a product (requires authentication)
   */
  async getStockHistory(productId: number, limit: number = 50) {
    return apiService.get<any[]>(
      `${API_ENDPOINTS.PRODUCT_BY_ID(productId)}/stock-history`,
      true,
      { limit }
    );
  }

  /**
   * Get low stock products (requires authentication)
   */
  async getLowStockProducts(threshold?: number) {
    const params = threshold ? `?threshold=${threshold}` : '';
    return apiService.get<Product[]>(
      `${API_ENDPOINTS.PRODUCTS}/low-stock${params}`,
      true
    );
  }

  /**
   * Get out of stock products (requires authentication)
   */
  async getOutOfStockProducts() {
    return apiService.get<Product[]>(
      `${API_ENDPOINTS.PRODUCTS}/out-of-stock`,
      true
    );
  }
}

export const productService = new ProductService();

