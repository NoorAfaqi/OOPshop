const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

const authMiddleware = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const invoiceRoutes = require("./routes/invoices");
const reportsRoutes = require("./routes/reports");
const paymentsRoutes = require("./routes/payments");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test endpoint without database
app.get("/test", (req, res) => {
  res.json({ message: "Server is running", timestamp: new Date().toISOString() });
});

// Public auth routes
app.use("/auth", authRoutes);

// Helper to wrap async route handlers - Express 4 compatible
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("Async handler error:", err);
      next(err);
    });
  };
};

// Public product browsing routes (GET only - no auth required)
const pool = require("./db");

app.get("/products", asyncHandler(async (req, res) => {
  const { q, category, brand, available } = req.query;
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

  try {
    if (!pool) {
      return res.status(500).json({ message: "Database not initialized" });
    }
    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC`,
      params
    );
    return res.json(rows);
  } catch (err) {
    console.error("Database error in /products:", err);
    return res.status(500).json({ message: "Failed to list products", error: err.message });
  }
}));

app.get("/products/:id", asyncHandler(async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ message: "Database not initialized" });
    }
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error("Database error in /products/:id:", err);
    return res.status(500).json({ message: "Failed to get product", error: err.message });
  }
}));

// Public checkout endpoint (creates customer and invoice)
app.post("/checkout", asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    billing_street,
    billing_zip,
    billing_city,
    billing_country,
    items,
  } = req.body || {};

  if (
    !first_name ||
    !last_name ||
    !billing_street ||
    !billing_zip ||
    !billing_city ||
    !billing_country ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!pool) {
    return res.status(500).json({ message: "Database not initialized" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create customer
    const [customerResult] = await connection.query(
      `INSERT INTO customers
       (first_name, last_name, phone, billing_street, billing_zip, billing_city, billing_country)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, phone || null, billing_street, billing_zip, billing_city, billing_country]
    );
    const customerId = customerResult.insertId;

    // Calculate total and validate stock
    let total = 0;
    for (const item of items) {
      const [rows] = await connection.query(
        "SELECT price, stock_quantity FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );
      const product = rows[0];
      if (!product) {
        throw new Error("Product not found");
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error("Insufficient stock");
      }

      total += Number(product.price) * item.quantity;

      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // Create invoice
    const [invoiceResult] = await connection.query(
      "INSERT INTO invoices (customer_id, total_amount, status) VALUES (?, ?, 'pending')",
      [customerId, total]
    );
    const invoiceId = invoiceResult.insertId;

    // Create invoice items
    for (const item of items) {
      const [rows] = await connection.query(
        "SELECT price FROM products WHERE id = ?",
        [item.product_id]
      );
      const product = rows[0];
      await connection.query(
        "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [invoiceId, item.product_id, item.quantity, product.price]
      );
    }

    await connection.commit();

    const [invoiceRows] = await pool.query(
      "SELECT * FROM invoices WHERE id = ?",
      [invoiceId]
    );
    return res.status(201).json(invoiceRows[0]);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to process checkout" });
  } finally {
    connection.release();
  }
}));

// Protect all subsequent routes with JWT
app.use(authMiddleware());

// Protected product management routes
// We need to manually handle these since productRoutes has conflicting GET routes
const poolProtected = require("./db");

// Create product (protected)
app.post("/products", asyncHandler(async (req, res) => {
  const {
    name,
    price,
    brand,
    image_url,
    category,
    nutritional_info,
    stock_quantity,
    open_food_facts_barcode,
  } = req.body || {};

  try {
    const [result] = await poolProtected.query(
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

    const [rows] = await poolProtected.query("SELECT * FROM products WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create product" });
  }
}));

// Update product (protected)
app.put("/products/:id", asyncHandler(async (req, res) => {
  const {
    name,
    price,
    brand,
    image_url,
    category,
    nutritional_info,
    stock_quantity,
    open_food_facts_barcode,
  } = req.body || {};

  try {
    await poolProtected.query(
      `UPDATE products SET
        name = ?, price = ?, brand = ?, image_url = ?, category = ?, nutritional_info = ?, stock_quantity = ?, open_food_facts_barcode = ?
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
        req.params.id,
      ]
    );

    const [rows] = await poolProtected.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update product" });
  }
}));

// Delete product (protected)
app.delete("/products/:id", asyncHandler(async (req, res) => {
  try {
    await poolProtected.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete product" });
  }
}));

// Open Food Facts integration (protected)
app.post("/products/from-barcode", asyncHandler(async (req, res) => {
  const { barcode } = req.body || {};
  if (!barcode) {
    return res.status(400).json({ message: "Barcode required" });
  }

  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return res
        .status(404)
        .json({ message: "Product not found in Open Food Facts" });
    }

    const p = data.product;

    const name = p.product_name || "Unknown product";
    const brand =
      (Array.isArray(p.brands_tags) && p.brands_tags[0]) ||
      p.brands ||
      null;
    const image_url = p.image_url || null;
    const category =
      (Array.isArray(p.categories_tags) && p.categories_tags[0]) || null;
    const nutritional_info = {
      nutriments: p.nutriments || {},
      nutriscore_grade: p.nutriscore_grade || null,
    };

    return res.json({
      suggested: {
        name,
        brand,
        image_url,
        category,
        nutritional_info,
        open_food_facts_barcode: barcode,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to fetch from Open Food Facts" });
  }
}));

// Other protected routes
app.use("/users", userRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/reports", reportsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/users", userRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/reports", reportsRoutes);
app.use("/payments", paymentsRoutes);

// Error handling middleware (must be last, before listen)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on port ${PORT}`);
});

