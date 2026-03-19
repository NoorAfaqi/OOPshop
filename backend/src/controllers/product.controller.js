const productService = require("../services/product.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     description: Retrieve a list of products with optional filters
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (name, brand, category, or barcode)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability (in stock)
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  
  // Add cache headers for GET requests (products don't change frequently)
  // Cache for 5 minutes, but allow revalidation
  res.set({
    'Cache-Control': 'public, max-age=300, must-revalidate',
    'ETag': `"products-${Date.now()}"`
  });
  
  // Always return paginated response format
  if (result.pagination) {
    const { paginatedResponse } = require("../utils/response");
    return paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  }
  
  // Fallback for backward compatibility
  return res.json(result.data || result);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     description: Retrieve a single product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getProductById = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = await productService.getProductById(productId);
  
  // Add cache headers for individual product GET requests
  res.set({
    'Cache-Control': 'public, max-age=300, must-revalidate',
    'ETag': `"product-${productId}-${product.updated_at || Date.now()}"`
  });
  
  successResponse(res, product, "Product fetched successfully");
});

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     description: Create a new product (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Organic Apples
 *               price:
 *                 type: number
 *                 example: 3.99
 *               brand:
 *                 type: string
 *                 example: Fresh Farms
 *               image_url:
 *                 type: string
 *                 example: https://example.com/apple.jpg
 *               category:
 *                 type: string
 *                 example: Fruits
 *               nutritional_info:
 *                 type: object
 *               stock_quantity:
 *                 type: integer
 *                 example: 100
 *               open_food_facts_barcode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  successResponse(res, product, "Product created successfully", 201);
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     description: Update product details (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */
const updateProduct = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = await productService.updateProduct(productId, req.body);
  successResponse(res, product, "Product updated successfully");
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     description: Delete a product (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  await productService.deleteProduct(productId);
  successResponse(res, null, "Product deleted successfully");
});

/**
 * @swagger
 * /products/from-barcode:
 *   post:
 *     tags: [Products]
 *     summary: Fetch product from Open Food Facts
 *     description: Fetch product data from Open Food Facts by barcode (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barcode
 *             properties:
 *               barcode:
 *                 type: string
 *                 example: "3017620422003"
 *     responses:
 *       200:
 *         description: Product data from Open Food Facts
 */
const fetchFromBarcode = asyncHandler(async (req, res) => {
  const result = await productService.fetchFromBarcode(req.body.barcode);
  successResponse(res, result, "Product fetched from Open Food Facts");
});

/**
 * @swagger
 * /products/search:
 *   post:
 *     tags: [Products]
 *     summary: Search products from Open Food Facts
 *     description: Search products from Open Food Facts by name (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - searchTerm
 *             properties:
 *               searchTerm:
 *                 type: string
 *                 example: "Nutella"
 *               limit:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       200:
 *         description: List of products from Open Food Facts
 */
const searchProductsByName = asyncHandler(async (req, res) => {
  const { searchTerm, limit } = req.body;
  const result = await productService.searchProductsByName(searchTerm, limit);
  successResponse(res, result, "Products searched from Open Food Facts");
});

/**
 * @swagger
 * /products/{id}/adjust-stock:
 *   post:
 *     tags: [Products]
 *     summary: Adjust product stock
 *     description: Adjust stock quantity with history tracking (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity_change
 *             properties:
 *               quantity_change:
 *                 type: integer
 *               change_type:
 *                 type: string
 *                 enum: [purchase, adjustment, return, damage, other]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 */
const adjustStock = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = await productService.adjustStock(productId, {
    ...req.body,
    user_id: req.user.id,
  });
  successResponse(res, product, "Stock adjusted successfully");
});

/**
 * @swagger
 * /products/{id}/stock-history:
 *   get:
 *     tags: [Products]
 *     summary: Get stock history for a product
 *     description: Get stock movement history (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Stock history
 */
const getStockHistory = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const history = await productService.getStockHistory(productId, parseInt(req.query.limit) || 50);
  successResponse(res, history, "Stock history fetched successfully");
});

/**
 * @swagger
 * /products/low-stock:
 *   get:
 *     tags: [Products]
 *     summary: Get low stock products
 *     description: Get products with stock below reorder point (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Low stock products
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = req.query.threshold ? parseInt(req.query.threshold) : null;
  const products = await productService.getLowStockProducts(threshold);
  successResponse(res, products, "Low stock products fetched successfully");
});

/**
 * @swagger
 * /products/out-of-stock:
 *   get:
 *     tags: [Products]
 *     summary: Get out of stock products
 *     description: Get products with zero stock (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Out of stock products
 */
const getOutOfStockProducts = asyncHandler(async (req, res) => {
  const products = await productService.getOutOfStockProducts();
  successResponse(res, products, "Out of stock products fetched successfully");
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchFromBarcode,
  searchProductsByName,
  adjustStock,
  getStockHistory,
  getLowStockProducts,
  getOutOfStockProducts,
};

