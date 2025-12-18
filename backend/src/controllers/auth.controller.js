const authService = require("../services/auth.service");
const { successResponse } = require("../utils/response");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login (Manager/Admin)
 *     description: Authenticate user and receive JWT token. Login endpoint for managers and admins.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: manager@oopshop.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     manager:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Login accepts all user types (customer, manager, admin)
  const result = await authService.login(email, password);
  successResponse(res, result, "Login successful");
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new user
 *     description: Create a new user account (admin/manager/customer)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, manager, customer]
 *                 default: customer
 *     responses:
 *       201:
 *         description: User registered successfully
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  successResponse(res, user, "User registered successfully", 201);
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get the currently authenticated user's information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  successResponse(res, user, "User fetched successfully");
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change password
 *     description: Change the current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  successResponse(res, result, "Password changed successfully");
});

module.exports = {
  login,
  register,
  getCurrentUser,
  changePassword,
};
