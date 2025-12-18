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
 *         description: Search query (name, brand, or category)
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
  const products = await productService.getAllProducts(req.query);
  // Return simple array for frontend compatibility
  return res.json(products);
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
  const product = await productService.getProductById(req.params.id);
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
  const product = await productService.updateProduct(req.params.id, req.body);
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
  await productService.deleteProduct(req.params.id);
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

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchFromBarcode,
};

