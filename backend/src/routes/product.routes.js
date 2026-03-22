const express = require("express");
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validation");
const {
  createProductValidator,
  updateProductValidator,
  getProductValidator,
  listProductsValidator,
  barcodeValidator,
  searchValidator,
  stockAdjustmentValidator,
} = require("../validators/product.validator");

const router = express.Router();

// Public routes
router.get(
  "/",
  listProductsValidator,
  validate,
  productController.getAllProducts
);

// Protected routes (require authentication)
router.post(
  "/",
  authMiddleware(),
  createProductValidator,
  validate,
  productController.createProduct
);

// Specific routes MUST come before parameterized routes (/:id)
router.post(
  "/from-barcode",
  authMiddleware(),
  barcodeValidator,
  validate,
  productController.fetchFromBarcode
);

router.post(
  "/search",
  authMiddleware(),
  searchValidator,
  validate,
  productController.searchProductsByName
);

// Inventory management routes (MUST come before /:id routes)
router.get(
  "/low-stock",
  authMiddleware(),
  productController.getLowStockProducts
);

router.get(
  "/out-of-stock",
  authMiddleware(),
  productController.getOutOfStockProducts
);

// Parameterized routes (must come after specific routes)
router.get(
  "/:id/recommendations",
  getProductValidator,
  validate,
  productController.getRecommendedProducts
);

router.get(
  "/:id",
  getProductValidator,
  validate,
  productController.getProductById
);

router.post(
  "/:id/adjust-stock",
  authMiddleware(),
  stockAdjustmentValidator,
  validate,
  productController.adjustStock
);

router.get(
  "/:id/stock-history",
  authMiddleware(),
  getProductValidator,
  validate,
  productController.getStockHistory
);

router.put(
  "/:id",
  authMiddleware(),
  updateProductValidator,
  validate,
  productController.updateProduct
);

router.delete(
  "/:id",
  authMiddleware(),
  getProductValidator,
  validate,
  productController.deleteProduct
);

module.exports = router;

