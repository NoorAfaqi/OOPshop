// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    "Content-Type": "application/json",
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  CHANGE_PASSWORD: "/auth/change-password",
  
  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id: number) => `/products/${id}`,
  PRODUCT_FROM_BARCODE: "/products/from-barcode",
  PRODUCT_SEARCH: "/products/search",
  PRODUCT_LOW_STOCK: "/products/low-stock",
  PRODUCT_OUT_OF_STOCK: "/products/out-of-stock",
  
  // Checkout
  CHECKOUT: "/checkout",
  
  // Invoices
  INVOICES: "/invoices",
  INVOICE_BY_ID: (id: number) => `/invoices/${id}`,
  
  // Users
  USERS: "/users",
  USER_BY_ID: (id: number) => `/users/${id}`,
  USER_INVOICES: (id: number) => `/users/${id}/invoices`,
  USER_PAYMENTS: (id: number) => `/users/${id}/payments`,
  
  // Payments
  PAYMENTS: "/payments",
  PAYMENT_BY_ID: (id: number) => `/payments/${id}`,
  
  // Reports
  REPORTS: "/reports",
  
  // Health
  HEALTH: "/health",
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  CART: "shopping_cart",
};

