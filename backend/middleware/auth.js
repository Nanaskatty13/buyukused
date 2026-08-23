// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// VERIFY JWT TOKEN
// ============================================================

const verifyToken = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = user;
    req.userId = user._id.toString();
    req.auth = decoded;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

// ============================================================
// ADMIN ONLY
// ============================================================

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Access denied. Admin only." });
};

// ============================================================
// SELLER ONLY
// ============================================================

const isSeller = (req, res, next) => {
  if (req.user && (req.user.role === "seller" || req.user.role === "admin")) return next();
  return res.status(403).json({ success: false, message: "Access denied. Seller only." });
};

// ============================================================
// RIDER ONLY
// ============================================================

const isRider = (req, res, next) => {
  if (req.user && req.user.role === "rider") return next();
  return res.status(403).json({ success: false, message: "Access denied. Rider only." });
};

// ============================================================
// CUSTOMER ONLY
// ============================================================

const isCustomer = (req, res, next) => {
  if (req.user && (req.user.role === "buyer" || req.user.role === "seller")) return next();
  return res.status(403).json({ success: false, message: "Access denied. Customer only." });
};

// ============================================================
// BACKWARD-COMPATIBILITY ALIASES
// ============================================================

const protect = verifyToken;
const seller = isSeller;

// ============================================================
// EXPORTS
// ============================================================

// Default export: the main authentication middleware (so require('auth') returns a function)
module.exports = verifyToken;

// Also export named properties for flexibility
module.exports.verifyToken = verifyToken;
module.exports.protect = protect;
module.exports.isAdmin = isAdmin;
module.exports.isSeller = isSeller;
module.exports.isRider = isRider;
module.exports.isCustomer = isCustomer;
module.exports.seller = seller;