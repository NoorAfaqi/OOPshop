const express = require("express");
const authController = require("../controllers/auth.controller");
const { loginValidator, registerValidator } = require("../validators/auth.validator");
const validate = require("../middleware/validation");
const { authLimiter } = require("../config/security");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Public routes
router.post("/login", loginValidator, validate, authController.login);
router.post("/register", registerValidator, validate, authController.register);

// Protected routes
router.get("/me", authMiddleware.requireAuth(), authController.getCurrentUser);
router.post("/change-password", authMiddleware.requireAuth(), authController.changePassword);

module.exports = router;
