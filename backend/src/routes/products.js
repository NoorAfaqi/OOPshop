const express = require("express");
const pool = require("../db");

// Use dynamic import for node-fetch to avoid ESM/CJS issues if needed
let fetchFn;
async function getFetch() {
  if (!fetchFn) {
    // eslint-disable-next-line global-require
    fetchFn = (await import("node-fetch")).default;
  }
  return fetchFn;
}

const router = express.Router();

// Create product
router.post("/", async (req, res) => {
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

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to create product" });
  }
});

// List products with optional search/filter
router.get("/", async (req, res) => {
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
    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC`,
      params
    );
    return res.json(rows);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to list products" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to get product" });
  }
});

// Update product
router.put("/:id", async (req, res) => {
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
    await pool.query(
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

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    return res.json(rows[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to update product" });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Failed to delete product" });
  }
});

// Open Food Facts integration
router.post("/from-barcode", async (req, res) => {
  const { barcode } = req.body || {};
  if (!barcode) {
    return res.status(400).json({ message: "Barcode required" });
  }

  try {
    const fetch = await getFetch();
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
    // eslint-disable-next-line no-console
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to fetch from Open Food Facts" });
  }
});

module.exports = router;


