const pool = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData) {
    try {
      const {
        name,
        price,
        brand,
        image_url,
        category,
        nutritional_info,
        stock_quantity,
        open_food_facts_barcode,
      } = productData;
      
      const [result] = await pool.query(
        `INSERT INTO products
         (name, price, brand, image_url, category, nutritional_info, stock_quantity, open_food_facts_barcode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          price,
          brand,
          image_url,
          category,
          nutritional_info ? JSON.stringify(nutritional_info) : null,
          stock_quantity || 0,
          open_food_facts_barcode || null,
        ]
      );
      
      const product = await this.getProductById(result.insertId);
      logger.info(`Product created: ${product.name} (ID: ${product.id})`);
      
      return product;
    } catch (error) {
      logger.error("Error creating product:", error);
      throw new AppError("Failed to create product", 500);
    }
  }
  
  /**
   * Get all products with optional filters
   */
  async getAllProducts(filters = {}) {
    try {
      const { q, category, brand, available } = filters;
      const conditions = [];
      const params = [];
      
      if (q) {
        conditions.push("(name LIKE ? OR brand LIKE ? OR category LIKE ?)");
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
      }
      if (category) {
        conditions.push("category = ?");
        params.push(category);
      }
      if (brand) {
        conditions.push("brand = ?");
        params.push(brand);
      }
      if (available === "true") {
        conditions.push("stock_quantity > 0");
      }
      
      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      
      const [rows] = await pool.query(
        `SELECT * FROM products ${where} ORDER BY created_at DESC`,
        params
      );
      
      return rows;
    } catch (error) {
      logger.error("Error fetching products:", error);
      throw new AppError("Failed to fetch products", 500);
    }
  }
  
  /**
   * Get product by ID
   */
  async getProductById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );
      
      if (!rows[0]) {
        throw new AppError("Product not found", 404);
      }
      
      return rows[0];
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error("Error fetching product:", error);
      throw new AppError("Failed to fetch product", 500);
    }
  }
  
  /**
   * Update product
   */
  async updateProduct(id, productData) {
    try {
      const {
        name,
        price,
        brand,
        image_url,
        category,
        nutritional_info,
        stock_quantity,
        open_food_facts_barcode,
      } = productData;
      
      await pool.query(
        `UPDATE products SET
          name = ?, price = ?, brand = ?, image_url = ?, category = ?, 
          nutritional_info = ?, stock_quantity = ?, open_food_facts_barcode = ?
         WHERE id = ?`,
        [
          name,
          price,
          brand,
          image_url,
          category,
          nutritional_info ? JSON.stringify(nutritional_info) : null,
          stock_quantity,
          open_food_facts_barcode || null,
          id,
        ]
      );
      
      const product = await this.getProductById(id);
      logger.info(`Product updated: ${product.name} (ID: ${product.id})`);
      
      return product;
    } catch (error) {
      logger.error("Error updating product:", error);
      throw new AppError("Failed to update product", 500);
    }
  }
  
  /**
   * Delete product
   */
  async deleteProduct(id) {
    try {
      await this.getProductById(id); // Check if exists
      
      await pool.query("DELETE FROM products WHERE id = ?", [id]);
      logger.info(`Product deleted: ID ${id}`);
      
      return { message: "Product deleted successfully" };
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error("Error deleting product:", error);
      throw new AppError("Failed to delete product", 500);
    }
  }
  
  /**
   * Fetch product from Open Food Facts API
   */
  async fetchFromBarcode(barcode) {
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();
      
      if (data.status !== 1 || !data.product) {
        throw new AppError("Product not found in Open Food Facts", 404);
      }
      
      const p = data.product;
      
      return {
        suggested: {
          name: p.product_name || "Unknown product",
          brand: (Array.isArray(p.brands_tags) && p.brands_tags[0]) || p.brands || null,
          image_url: p.image_url || null,
          category: (Array.isArray(p.categories_tags) && p.categories_tags[0]) || null,
          nutritional_info: {
            nutriments: p.nutriments || {},
            nutriscore_grade: p.nutriscore_grade || null,
          },
          open_food_facts_barcode: barcode,
        },
      };
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error("Error fetching from Open Food Facts:", error);
      throw new AppError("Failed to fetch from Open Food Facts", 500);
    }
  }
}

module.exports = new ProductService();

