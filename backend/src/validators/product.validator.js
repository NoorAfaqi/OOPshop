const { body, query, param } = require("express-validator");

const createProductValidator = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 255 })
    .withMessage("Product name must not exceed 255 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("brand")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Brand must not exceed 255 characters"),
  body("image_url")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL"),
  body("category")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Category must not exceed 255 characters"),
  body("stock_quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer"),
  body("open_food_facts_barcode")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Barcode must not exceed 50 characters"),
];

const updateProductValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
  ...createProductValidator,
];

const getProductValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),
];

const listProductsValidator = [
  query("q")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Search query must not exceed 255 characters"),
  query("category")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Category must not exceed 255 characters"),
  query("brand")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Brand must not exceed 255 characters"),
  query("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be a boolean value"),
];

const barcodeValidator = [
  body("barcode")
    .notEmpty()
    .withMessage("Barcode is required")
    .isLength({ max: 50 })
    .withMessage("Barcode must not exceed 50 characters"),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  getProductValidator,
  listProductsValidator,
  barcodeValidator,
};

