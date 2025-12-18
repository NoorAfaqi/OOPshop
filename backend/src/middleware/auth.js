const jwt = require("jsonwebtoken");

/**
 * Authentication middleware with role-based access control
 * @param {string|string[]|null} requiredRoles - Role(s) required to access the route
 * @param {boolean} required - Whether authentication is required (default: true)
 */
function auth(requiredRoles = null, required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return required
        ? res.status(401).json({ message: "No token provided" })
        : next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      
      // Check role if required
      if (requiredRoles) {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        
        if (!roles.includes(payload.role)) {
          return res.status(403).json({ 
            message: `Access denied. Required role: ${roles.join(' or ')}` 
          });
        }
      }
      
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

/**
 * Require admin role
 */
function requireAdmin() {
  return auth('admin', true);
}

/**
 * Require manager or admin role
 */
function requireManager() {
  return auth(['admin', 'manager'], true);
}

/**
 * Require any authenticated user
 */
function requireAuth() {
  return auth(null, true);
}

module.exports = auth;
module.exports.requireAdmin = requireAdmin;
module.exports.requireManager = requireManager;
module.exports.requireAuth = requireAuth;
