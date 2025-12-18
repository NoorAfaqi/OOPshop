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
} = require("../validators/product.validator");

const router = express.Router();

// Public routes
router.get(
  "/",
  listProductsValidator,
  validate,
  productController.getAllProducts
);

router.get(
  "/:id",
  getProductValidator,
  validate,
  productController.getProductById
);

// Protected routes (require authentication)
router.post(
  "/",
  authMiddleware(),
  createProductValidator,
  validate,
  productController.createProduct
);

router.post(
  "/from-barcode",
  authMiddleware(),
  barcodeValidator,
  validate,
  productController.fetchFromBarcode
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

