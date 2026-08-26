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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

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

    // Attach full user document
    req.user = user;

    // Convenient user ID
    req.userId = user._id.toString();

    // Keep decoded JWT available
    req.auth = decoded;

    next();
  } catch (error) {
    console.error(
      "❌ Auth middleware error:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// ============================================================
// ADMIN ONLY
// ============================================================

const isAdmin = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "admin"
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin only.",
  });
};

// ============================================================
// SELLER ONLY (UPDATED FOR NEUTRAL)
// ============================================================

const isSeller = (req, res, next) => {
  // Allow any authenticated user (except riders) to act as seller.
  // In a neutral marketplace, all users can buy and sell.
  // The only role we explicitly restrict is 'rider' (if needed).
  if (
    req.user &&
    (
      req.user.role === "user" ||
      req.user.role === "buyer" ||
      req.user.role === "seller" ||
      req.user.role === "admin"
    )
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Seller permissions required.",
  });
};

// ============================================================
// RIDER ONLY
// ============================================================

const isRider = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "rider"
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Rider only.",
  });
};

// ============================================================
// CUSTOMER ONLY (UPDATED FOR NEUTRAL)
// ============================================================

const isCustomer = (req, res, next) => {
  if (
    req.user &&
    (
      req.user.role === "user" ||
      req.user.role === "buyer" ||
      req.user.role === "seller" ||
      req.user.role === "admin"
    )
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Customer only.",
  });
};

// ============================================================
// BACKWARD-COMPATIBILITY ALIASES
// ============================================================

const protect = verifyToken;
const seller = isSeller;

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  verifyToken,
  protect,

  isAdmin,
  isSeller,

  isRider,
  isCustomer,

  // Compatibility aliases
  seller,
};