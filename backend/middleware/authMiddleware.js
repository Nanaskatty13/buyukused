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
    const authHeader =
      req.headers.authorization || "";

    if (
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token =
      authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const user =
      await User.findById(
        decoded.id
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "❌ Authentication error:",
      error.message
    );

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
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
// REQUIRE BUYER OR SELLER
// ============================================================

const requireCustomer = (
  req,
  res,
  next
) => {
  if (
    !req.user ||
    !["buyer", "seller"].includes(
      req.user.role
    )
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
      message: "Admin access is required",
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
};