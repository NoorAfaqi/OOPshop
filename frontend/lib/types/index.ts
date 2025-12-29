// API Response types
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

// Product types
export interface Product {
  id: number;
  name: string;
  price: number;
  brand?: string;
  image_url?: string;
  category?: string;
  nutritional_info?: {
    nutriments?: Record<string, any>;
    nutriscore_grade?: string;
  };
  stock_quantity: number;
  open_food_facts_barcode?: string;
  created_at: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  brand?: string;
  image_url?: string;
  category?: string;
  nutritional_info?: Record<string, any>;
  stock_quantity?: number;
  open_food_facts_barcode?: string;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  brand?: string;
  available?: boolean;
}

// User types (consolidated - replaces Customer and Manager)
export interface User {
  id: number;
  email?: string; // Optional for guest users
  first_name: string;
  last_name: string;
  phone?: string;
  role: "admin" | "manager" | "customer" | "guest";
  is_active: boolean;
  billing_street?: string;
  billing_zip?: string;
  billing_city?: string;
  billing_country?: string;
  created_at: string;
  updated_at: string;
}

// Invoice types
export interface Invoice {
  id: number;
  user_id: number; // Changed from customer_id
  total_amount: number;
  status: "pending" | "paid" | "cancelled" | "shipped";
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  name?: string;
}

export interface InvoiceDetails extends Invoice {
  items: InvoiceItem[];
  phone?: string;
  billing_street?: string;
  billing_zip?: string;
  billing_city?: string;
  billing_country?: string;
}

// Checkout types
export interface CheckoutItem {
  product_id: number;
  quantity: number;
}

export interface CheckoutData {
  email?: string; // Optional for guest checkout
  first_name: string;
  last_name: string;
  phone?: string;
  billing_street: string;
  billing_zip: string;
  billing_city: string;
  billing_country: string;
  items: CheckoutItem[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User; // Changed from 'manager' to 'user'
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Payment types
export interface Payment {
  id: number;
  invoice_id: number;
  user_id: number; // Changed from customer_id
  amount: number;
  method: "paypal" | "card" | "cash" | "other";
  status: "pending" | "completed" | "failed";
  paypal_transaction_id?: string;
  created_at: string;
}

// Legacy type aliases for backward compatibility
/** @deprecated Use User instead */
export type Manager = User;

/** @deprecated Use User instead */
export type Customer = User;
