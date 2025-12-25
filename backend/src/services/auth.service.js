const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

class AuthService {
  /**
   * Authenticate user and generate JWT token
   * Supports login for all roles: admin, manager, customer
   */
  async login(email, password, requiredRole = null) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
        [email]
      );
      
      const user = rows[0];
      
      if (!user) {
        throw new AppError("Invalid credentials", 401);
      }
      
      // Check if specific role is required
      if (requiredRole && user.role !== requiredRole) {
        throw new AppError(`Access denied. ${requiredRole} role required.`, 403);
      }
      
      const passwordOk = await bcrypt.compare(
        password,
        user.password_hash || ""
      );
      
      if (!passwordOk) {
        throw new AppError("Invalid credentials", 401);
      }
      
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );
      
      logger.info(`User logged in: ${user.email} (role: ${user.role})`);
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  }
  
  /**
   * Manager-specific login (for backward compatibility)
   */
  async managerLogin(email, password) {
    const result = await this.login(email, password, 'manager');
    // Return in old format for backward compatibility
    return {
      token: result.token,
      manager: result.user,
    };
  }
  
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const { email, password, first_name, last_name, phone, role = 'customer' } = userData;
      
      // Check if user already exists
      const [existing] = await pool.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      
      if (existing.length > 0) {
        throw new AppError("Email already registered", 400);
      }
      
      // Validate role
      const validRoles = ['admin', 'manager', 'customer'];
      if (!validRoles.includes(role)) {
        throw new AppError("Invalid role", 400);
      }
      
      // Hash password
      const password_hash = await bcrypt.hash(password, 10);
      
      // Create user
      const [result] = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [email, password_hash, first_name, last_name, phone || null, role]
      );
      
      logger.info(`New user registered: ${email} (role: ${role})`);
      
      return {
        id: result.insertId,
        email,
        first_name,
        last_name,
        role,
      };
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT id, email, first_name, last_name, phone, role, is_active, 
         billing_street, billing_zip, billing_city, billing_country, 
         profile_picture_url, created_at, updated_at FROM users WHERE id = ?`,
        [id]
      );
      
      if (!rows[0]) {
        throw new AppError("User not found", 404);
      }
      
      return rows[0];
    } catch (error) {
      if (error.statusCode === 404) throw error;
      logger.error("Error fetching user:", error);
      throw new AppError("Failed to fetch user", 500);
    }
  }
  
  /**
   * Create user (for admin/manager creating customers)
   */
  async createUser(userData) {
    try {
      const { 
        email, 
        password, 
        first_name, 
        last_name, 
        phone, 
        role = 'customer',
        billing_street,
        billing_zip,
        billing_city,
        billing_country
      } = userData;
      
      if (!first_name || !last_name) {
        throw new AppError("First name and last name are required", 400);
      }
      
      // If email is provided, check if user already exists
      if (email) {
        const [existing] = await pool.query(
          "SELECT id FROM users WHERE email = ?",
          [email]
        );
        
        if (existing.length > 0) {
          throw new AppError("Email already registered", 400);
        }
      }
      
      // Validate role
      const validRoles = ['admin', 'manager', 'customer', 'guest'];
      if (!validRoles.includes(role)) {
        throw new AppError("Invalid role", 400);
      }
      
      // Hash password if provided
      let password_hash = null;
      if (password) {
        password_hash = await bcrypt.hash(password, 10);
      }
      
      // Create user
      const [result] = await pool.query(
        `INSERT INTO users (
          email, password_hash, first_name, last_name, phone, role,
          billing_street, billing_zip, billing_city, billing_country
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email || null, 
          password_hash, 
          first_name, 
          last_name, 
          phone || null, 
          role,
          billing_street || null,
          billing_zip || null,
          billing_city || null,
          billing_country || null
        ]
      );
      
      logger.info(`New user created: ${first_name} ${last_name} (role: ${role})`);
      
      return await this.getUserById(result.insertId);
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error("Error creating user:", error);
      throw new AppError("Failed to create user", 500);
    }
  }

  /**
   * Update user
   */
  async updateUser(id, updates) {
    try {
      const allowedUpdates = [
        'first_name', 
        'last_name', 
        'phone',
        'billing_street',
        'billing_zip',
        'billing_city',
        'billing_country',
        'profile_picture_url'
      ];
      const updateFields = [];
      const values = [];
      
      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          values.push(updates[field]);
        }
      }
      
      if (updateFields.length === 0) {
        throw new AppError("No valid fields to update", 400);
      }
      
      values.push(id);
      
      await pool.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      return await this.getUserById(id);
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    }
  }
  
  /**
   * Change password
   */
  async changePassword(id, oldPassword, newPassword) {
    try {
      const [rows] = await pool.query(
        "SELECT password_hash FROM users WHERE id = ?",
        [id]
      );
      
      if (!rows[0]) {
        throw new AppError("User not found", 404);
      }
      
      const passwordOk = await bcrypt.compare(oldPassword, rows[0].password_hash);
      
      if (!passwordOk) {
        throw new AppError("Current password is incorrect", 401);
      }
      
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        "UPDATE users SET password_hash = ? WHERE id = ?",
        [newPasswordHash, id]
      );
      
      logger.info(`Password changed for user ID: ${id}`);
      
      return { message: "Password changed successfully" };
    } catch (error) {
      logger.error("Error changing password:", error);
      throw error;
    }
  }
  
  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  }
  
  /**
   * Check if user has required role
   */
  hasRole(user, roles) {
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    return roles.includes(user.role);
  }
}

module.exports = new AuthService();
