// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// AUTHENTICATE USER
// ============================================================

const authenticate = async (
  req,
  res,
  next
) => {
  try {
    // ----------------------------------------------------------
    // JWT configuration
    // ----------------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication is not configured",
      });
    }

    // ----------------------------------------------------------
    // Authorization header
    // ----------------------------------------------------------

    const authHeader =
      req.headers.authorization || "";

    if (
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // ----------------------------------------------------------
    // Token
    // ----------------------------------------------------------

    const token =
      authHeader
        .substring(7)
        .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token missing",
      });
    }

    // ----------------------------------------------------------
    // Verify JWT
    // ----------------------------------------------------------

    const decoded =
      jwt.verify(
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
        message:
          "Invalid token payload",
      });
    }

    // ----------------------------------------------------------
    // Find user
    // ----------------------------------------------------------

    const user =
      await User.findById(userId)
        .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User not found",
      });
    }

    // ----------------------------------------------------------
    // Account status
    // ----------------------------------------------------------

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated",
      });
    }

    // ----------------------------------------------------------
    // Attach authentication data
    // ----------------------------------------------------------

    req.user = user;

    req.userId =
      user._id.toString();

    req.auth = decoded;

    next();
  } catch (error) {
    console.error(
      "❌ Authentication error:",
      error.message
    );

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token has expired",
      });
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Authentication failed",
    });
  }
};

// ============================================================
// REQUIRE RIDER
// ============================================================

const requireRider = (
  req,
  res,
  next
) => {
  if (
    !req.user ||
    req.user.role !== "rider"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Rider access is required",
    });
  }

  next();
};

// ============================================================
// REQUIRE CUSTOMER
// ============================================================

const requireCustomer = (
  req,
  res,
  next
) => {
  if (
    !req.user ||
    ![
      "buyer",
      "seller",
    ].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Buyer or seller access is required",
    });
  }

  next();
};

// ============================================================
// REQUIRE ADMIN
// ============================================================

const requireAdmin = (
  req,
  res,
  next
) => {
  if (
    !req.user ||
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Admin access is required",
    });
  }

  next();
};

// ============================================================
// REQUIRE SELLER
// ============================================================

const requireSeller = (
  req,
  res,
  next
) => {
  if (
    !req.user ||
    ![
      "seller",
      "admin",
    ].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Seller access is required",
    });
  }

  next();
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  authenticate,
  requireRider,
  requireCustomer,
  requireAdmin,
  requireSeller,
};