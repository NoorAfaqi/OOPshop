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
        description,
        nutritional_info,
        stock_quantity,
        reorder_point,
        open_food_facts_barcode,
      } = productData;
      
      const [result] = await pool.query(
        `INSERT INTO products
         (name, price, brand, image_url, category, description, nutritional_info, stock_quantity, reorder_point, open_food_facts_barcode)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          price,
          brand,
          image_url,
          category,
          description || null,
          nutritional_info ? JSON.stringify(nutritional_info) : null,
          stock_quantity || 0,
          reorder_point || 10,
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
   * Get all products with optional filters and pagination
   */
  async getAllProducts(filters = {}) {
    try {
      const { q, category, brand, available, page = 1, limit = 12, sortBy = "created_at", sortOrder = "desc" } = filters;
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
      
      // Validate and sanitize sort parameters
      const validSortFields = ["name", "price", "created_at", "stock_quantity"];
      const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
      const order = (sortOrder && sortOrder.toLowerCase() === "asc") ? "ASC" : "DESC";
      
      // Get total count
      const [countRows] = await pool.query(
        `SELECT COUNT(*) as total FROM products ${where}`,
        params
      );
      const total = countRows[0].total;
      
      // Calculate pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 12;
      const offset = (pageNum - 1) * limitNum;
      
      // Get paginated results with sorting
      const [rows] = await pool.query(
        `SELECT * FROM products ${where} ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );
      
      return {
        data: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      };
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
        description,
        nutritional_info,
        stock_quantity,
        reorder_point,
        open_food_facts_barcode,
      } = productData;
      
      await pool.query(
        `UPDATE products SET
          name = ?, price = ?, brand = ?, image_url = ?, category = ?, description = ?,
          nutritional_info = ?, stock_quantity = ?, reorder_point = ?, open_food_facts_barcode = ?
         WHERE id = ?`,
        [
          name,
          price,
          brand,
          image_url,
          category,
          description !== undefined ? description : null,
          nutritional_info ? JSON.stringify(nutritional_info) : null,
          stock_quantity,
          reorder_point !== undefined ? reorder_point : null,
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
   * Adjust stock quantity with history tracking
   */
  async adjustStock(productId, adjustmentData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { quantity_change, change_type = 'adjustment', reason, user_id, reference_type, reference_id } = adjustmentData;

      // Get current product
      const [productRows] = await connection.query(
        "SELECT id, name, stock_quantity FROM products WHERE id = ? FOR UPDATE",
        [productId]
      );

      if (!productRows[0]) {
        throw new AppError("Product not found", 404);
      }

      const product = productRows[0];
      const previousQuantity = product.stock_quantity;
      const newQuantity = previousQuantity + quantity_change;

      if (newQuantity < 0) {
        throw new AppError("Insufficient stock for this adjustment", 400);
      }

      // Update stock
      await connection.query(
        "UPDATE products SET stock_quantity = ? WHERE id = ?",
        [newQuantity, productId]
      );

      // Record in stock history
      await connection.query(
        `INSERT INTO stock_history 
         (product_id, user_id, change_type, quantity_change, previous_quantity, new_quantity, reason, reference_type, reference_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, user_id || null, change_type, quantity_change, previousQuantity, newQuantity, reason || null, reference_type || null, reference_id || null]
      );

      await connection.commit();

      const updatedProduct = await this.getProductById(productId);
      logger.info(`Stock adjusted for product ${product.name}: ${previousQuantity} → ${newQuantity} (${change_type})`);

      return updatedProduct;
    } catch (error) {
      await connection.rollback();
      if (error.statusCode) throw error;
      logger.error("Error adjusting stock:", error);
      throw new AppError("Failed to adjust stock", 500);
    } finally {
      connection.release();
    }
  }

  /**
   * Get stock history for a product
   */
  async getStockHistory(productId, limit = 50) {
    try {
      const [rows] = await pool.query(
        `SELECT sh.*, u.first_name, u.last_name, p.name as product_name
         FROM stock_history sh
         LEFT JOIN users u ON u.id = sh.user_id
         JOIN products p ON p.id = sh.product_id
         WHERE sh.product_id = ?
         ORDER BY sh.created_at DESC
         LIMIT ?`,
        [productId, limit]
      );
      return rows;
    } catch (error) {
      logger.error("Error fetching stock history:", error);
      throw new AppError("Failed to fetch stock history", 500);
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold = null) {
    try {
      // Check if reorder_point column exists, if not use default threshold of 10
      let query;
      let params = [];
      
      // Use threshold if provided, otherwise use reorder_point or default to 10
      if (threshold !== null && threshold !== undefined) {
        // Use provided threshold
        query = `
          SELECT p.*, 
                 (p.stock_quantity <= ?) as is_low_stock
          FROM products p
          WHERE p.stock_quantity <= ?
          ORDER BY p.stock_quantity ASC, p.name ASC
        `;
        params = [threshold, threshold];
      } else {
        // Use reorder_point if exists, otherwise default to 10
        // Try to use reorder_point column, fallback to 10 if column doesn't exist
        query = `
          SELECT p.*, 
                 (p.stock_quantity <= IFNULL(p.reorder_point, 10)) as is_low_stock
          FROM products p
          WHERE p.stock_quantity <= IFNULL(p.reorder_point, 10)
          ORDER BY p.stock_quantity ASC, p.name ASC
        `;
      }
      
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      // If error is about missing column, try without reorder_point
      if (error.message && error.message.includes('reorder_point')) {
        logger.warn("reorder_point column not found, using default threshold of 10");
        const [rows] = await pool.query(
          `SELECT p.*, 
                  (p.stock_quantity <= 10) as is_low_stock
           FROM products p
           WHERE p.stock_quantity <= 10
           ORDER BY p.stock_quantity ASC, p.name ASC`
        );
        return rows;
      }
      logger.error("Error fetching low stock products:", error);
      throw new AppError("Failed to fetch low stock products", 500);
    }
  }

  /**
   * Get out of stock products
   */
  async getOutOfStockProducts() {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM products WHERE stock_quantity = 0 ORDER BY name ASC`
      );
      return rows;
    } catch (error) {
      logger.error("Error fetching out of stock products:", error);
      throw new AppError("Failed to fetch out of stock products", 500);
    }
  }

  /**
   * Bulk stock adjustment
   */
  async bulkAdjustStock(adjustments, userId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const results = [];
      for (const adjustment of adjustments) {
        const result = await this.adjustStock(adjustment.product_id, {
          ...adjustment,
          user_id: userId,
        });
        results.push(result);
      }

      await connection.commit();
      logger.info(`Bulk stock adjustment completed: ${adjustments.length} products`);
      
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * Fetch product from Open Food Facts API by barcode
   */
  async fetchFromBarcode(barcode) {
    try {
      // Validate barcode format
      if (!barcode || !/^\d{8,13}$/.test(barcode.toString())) {
        throw new AppError("Invalid barcode format. Must be 8-13 digits.", 400);
      }

      const fetch = (await import("node-fetch")).default;
      const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      
      logger.info(`Fetching product from OpenFoodFacts: ${barcode}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "OOPshop/1.0 (https://github.com/oopshop)",
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        throw new AppError("Failed to fetch from Open Food Facts", response.status);
      }

      const data = await response.json();
      
      if (data.status !== 1 || !data.product) {
        throw new AppError("Product not found in Open Food Facts", 404);
      }
      
      const p = data.product;
      
      // Extract best available image
      let imageUrl = p.image_url || null;
      if (!imageUrl && p.images) {
        // Try to get front image, then any image
        const frontImage = p.images.front_en || p.images.front || Object.keys(p.images)[0];
        if (frontImage) {
          imageUrl = `https://images.openfoodfacts.org/images/products/${barcode}/${frontImage}.jpg`;
        }
      }

      // Extract brand (prefer brands_tags, then brands string)
      let brand = null;
      if (Array.isArray(p.brands_tags) && p.brands_tags.length > 0) {
        brand = p.brands_tags[0].replace(/^en:/, "").replace(/-/g, " ");
      } else if (p.brands) {
        brand = p.brands.split(",")[0].trim();
      }

      // Extract category (prefer categories_tags, clean up the format)
      let category = null;
      if (Array.isArray(p.categories_tags) && p.categories_tags.length > 0) {
        category = p.categories_tags[0].replace(/^en:/, "").replace(/-/g, " ");
      } else if (p.categories) {
        category = p.categories.split(",")[0].trim();
      }

      // Extract nutritional information
      const nutriments = p.nutriments || {};
      const nutritionalInfo = {
        nutriments: {
          energy: nutriments.energy || nutriments["energy-kcal_100g"] || null,
          "energy-kcal": nutriments["energy-kcal"] || nutriments["energy-kcal_100g"] || null,
          fat: nutriments.fat || nutriments["fat_100g"] || null,
          "saturated-fat": nutriments["saturated-fat"] || nutriments["saturated-fat_100g"] || null,
          carbohydrates: nutriments.carbohydrates || nutriments["carbohydrates_100g"] || null,
          sugars: nutriments.sugars || nutriments["sugars_100g"] || null,
          proteins: nutriments.proteins || nutriments["proteins_100g"] || null,
          salt: nutriments.salt || nutriments["salt_100g"] || null,
          fiber: nutriments.fiber || nutriments["fiber_100g"] || null,
          sodium: nutriments.sodium || nutriments["sodium_100g"] || null,
        },
        nutriscore_grade: p.nutriscore_grade || p.nutriscore_grade || null,
        nova_group: p.nova_group || null,
        ecoscore_grade: p.ecoscore_grade || null,
      };

      const result = {
        suggested: {
          name: p.product_name || p.product_name_en || p.product_name_fr || "Unknown product",
          brand: brand,
          image_url: imageUrl,
          category: category,
          nutritional_info: nutritionalInfo,
          open_food_facts_barcode: barcode,
          quantity: p.quantity || null,
          packaging: p.packaging || null,
          labels: p.labels_tags || [],
          allergens: p.allergens_tags || [],
          ingredients_text: p.ingredients_text || null,
        },
      };

      logger.info(`Successfully fetched product: ${result.suggested.name}`);
      return result;
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error("Error fetching from Open Food Facts:", error);
      throw new AppError("Failed to fetch from Open Food Facts", 500);
    }
  }

  /**
   * Search products from Open Food Facts API by name
   */
  async searchProductsByName(searchTerm, limit = 20) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new AppError("Search term must be at least 2 characters", 400);
      }

      const fetch = (await import("node-fetch")).default;
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm.trim())}&search_simple=1&action=process&json=1&page_size=${limit}`;
      
      logger.info(`Searching OpenFoodFacts for: ${searchTerm}`);
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "OOPshop/1.0 (https://github.com/oopshop)",
        },
        timeout: 10000,
      });

      if (!response.ok) {
        throw new AppError("Failed to search Open Food Facts", response.status);
      }

      const data = await response.json();
      
      if (!data.products || data.products.length === 0) {
        return { products: [] };
      }

      // Transform products to match our format
      const products = data.products
        .filter(p => p.code && p.product_name) // Only products with barcode and name
        .slice(0, limit)
        .map(p => {
          // Extract best image
          let imageUrl = p.image_url || null;
          if (!imageUrl && p.images) {
            const frontImage = p.images.front_en || p.images.front || Object.keys(p.images)[0];
            if (frontImage) {
              imageUrl = `https://images.openfoodfacts.org/images/products/${p.code}/${frontImage}.jpg`;
            }
          }

          // Extract brand
          let brand = null;
          if (Array.isArray(p.brands_tags) && p.brands_tags.length > 0) {
            brand = p.brands_tags[0].replace(/^en:/, "").replace(/-/g, " ");
          } else if (p.brands) {
            brand = p.brands.split(",")[0].trim();
          }

          // Extract category
          let category = null;
          if (Array.isArray(p.categories_tags) && p.categories_tags.length > 0) {
            category = p.categories_tags[0].replace(/^en:/, "").replace(/-/g, " ");
          }

          return {
            name: p.product_name || "Unknown product",
            brand: brand,
            image_url: imageUrl,
            category: category,
            open_food_facts_barcode: p.code,
            nutriscore_grade: p.nutriscore_grade || null,
          };
        });

      logger.info(`Found ${products.length} products for search: ${searchTerm}`);
      return { products };
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error("Error searching Open Food Facts:", error);
      throw new AppError("Failed to search Open Food Facts", 500);
    }
  }
}

module.exports = new ProductService();

