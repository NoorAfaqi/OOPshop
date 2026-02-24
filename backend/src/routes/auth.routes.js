const express = require("express");
const authController = require("../controllers/auth.controller");
const { loginValidator, registerValidator } = require("../validators/auth.validator");
const validate = require("../middleware/validation");
const { authLimiter } = require("../config/security");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Strict rate limit only for login/register to prevent brute-force; GET /me uses general limiter
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/register", authLimiter, registerValidator, validate, authController.register);

// Protected routes
router.get("/me", authMiddleware.requireAuth(), authController.getCurrentUser);
router.post("/change-password", authMiddleware.requireAuth(), authController.changePassword);

module.exports = router;
