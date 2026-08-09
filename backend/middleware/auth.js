// backend/middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ================================================================
// VERIFY JWT TOKEN
// ================================================================

const verifyToken = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    // ------------------------------------------------------------
    // Authorization header missing
    // ------------------------------------------------------------

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token =
      authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // ------------------------------------------------------------
    // Verify JWT
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // Find user
    // ------------------------------------------------------------

    const user =
      await User.findById(userId)
        .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ------------------------------------------------------------
    // Check account status
    // ------------------------------------------------------------

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // ------------------------------------------------------------
    // Attach authenticated user
    // ------------------------------------------------------------

    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    console.error(
      "❌ Auth middleware error:",
      error.message
    );

    // JWT expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // Invalid JWT
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

// ================================================================
// ADMIN ONLY
// ================================================================

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

// ================================================================
// SELLER ONLY
// ================================================================

const isSeller = (req, res, next) => {
  if (
    req.user &&
    (
      req.user.role === "seller" ||
      req.user.role === "admin"
    )
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Seller only.",
  });
};

module.exports = {
  verifyToken,
  isAdmin,
  isSeller,
};