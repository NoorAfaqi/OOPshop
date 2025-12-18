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
    return apiService.post(
      API_ENDPOINTS.PRODUCT_FROM_BARCODE,
      { barcode },
      true
    );
  }
}

export const productService = new ProductService();

