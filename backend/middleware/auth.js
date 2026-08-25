// ============================================================
// backend/middleware/auth.js
// BuyUKUsed - Authentication Middleware
// ============================================================

"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// SAFE OBJECT ID CHECK
// ============================================================

const mongooseSafeObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(String(id));
};

// ============================================================
// VERIFY JWT TOKEN
// ============================================================

const verifyToken = async (req, res, next) => {
  try {
    // ----------------------------------------------------------
    // Check JWT secret
    // ----------------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    // ----------------------------------------------------------
    // Get Authorization header
    // ----------------------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "NO_AUTH_HEADER",
      });
    }

    // ----------------------------------------------------------
    // Must be Bearer token
    // ----------------------------------------------------------

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
        code: "INVALID_AUTH_FORMAT",
      });
    }

    // ----------------------------------------------------------
    // Extract token
    // ----------------------------------------------------------

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
        code: "TOKEN_MISSING",
      });
    }

    // ----------------------------------------------------------
    // Verify token
    // ----------------------------------------------------------

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "❌ JWT verification failed:",
        jwtError.message
      );

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Authentication token expired.",
          code: "TOKEN_EXPIRED",
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token.",
          code: "INVALID_TOKEN",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
        code: "AUTH_FAILED",
      });
    }

    // ----------------------------------------------------------
    // Extract user ID
    // ----------------------------------------------------------

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      decoded.user_id;

    if (!userId) {
      console.error(
        "❌ JWT does not contain a user ID:",
        decoded
      );

      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
        code: "INVALID_TOKEN_PAYLOAD",
      });
    }

    // ----------------------------------------------------------
    // Validate user ID
    // ----------------------------------------------------------

    if (!mongooseSafeObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID in authentication token.",
        code: "INVALID_USER_ID",
      });
    }

    // ----------------------------------------------------------
    // Find user
    // ----------------------------------------------------------

    const user = await User.findById(userId)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // ----------------------------------------------------------
    // Check account status
    // ----------------------------------------------------------

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // ----------------------------------------------------------
    // Attach authentication information
    // ----------------------------------------------------------

    req.user = user;

    req.userId = user._id.toString();

    req.auth = decoded;

    // Helpful aliases for compatibility
    req.authenticatedUser = user;
    req.currentUser = user;

    // ----------------------------------------------------------
    // Continue
    // ----------------------------------------------------------

    return next();

  } catch (error) {
    console.error(
      "❌ Authentication middleware error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTHENTICATION_FAILED",
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
// SELLER ONLY
// ============================================================

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
// CUSTOMER ONLY
// ============================================================

const isCustomer = (req, res, next) => {
  if (
    req.user &&
    (
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
// ALIASES
// ============================================================

const protect = verifyToken;
const auth = verifyToken;
const seller = isSeller;

// ============================================================
// EXPORTS
// ============================================================

// Default export
module.exports = verifyToken;

// Named exports
module.exports.verifyToken = verifyToken;
module.exports.protect = protect;
module.exports.auth = auth;
module.exports.isAdmin = isAdmin;
module.exports.isSeller = isSeller;
module.exports.isRider = isRider;
module.exports.isCustomer = isCustomer;
module.exports.seller = seller;