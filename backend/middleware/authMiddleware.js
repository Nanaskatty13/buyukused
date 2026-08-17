// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// AUTHENTICATE
// ============================================================
//
// Verifies the JWT and loads the current user.
//
// This middleware does NOT decide whether the user is a
// buyer, seller, rider, or admin.
//
// ============================================================

const authenticate = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required. Please log in.",
      });
    }

    const token =
      authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token is missing.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication configuration error.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      console.error(
        "❌ JWT verification failed:",
        error.message
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired authentication token.",
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    const user =
      await User.findById(
        decoded.id
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User account no longer exists.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated.",
      });
    }

    // Attach complete current user.
    req.user = user;

    // Useful compatibility fields.
    req.userId =
      user._id.toString();

    req.userRole =
      user.role;

    next();
  } catch (error) {
    console.error(
      "❌ Authentication middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Authentication error.",
    });
  }
};

// ============================================================
// OPTIONAL AUTHENTICATION
// ============================================================

const optionalAuthenticate =
  async (
    req,
    res,
    next
  ) => {
    try {
      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return next();
      }

      const token =
        authHeader.substring(7).trim();

      if (!token) {
        return next();
      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      if (!decoded?.id) {
        return next();
      }

      const user =
        await User.findById(
          decoded.id
        ).select("-password");

      if (user) {
        req.user = user;
        req.userId =
          user._id.toString();
        req.userRole =
          user.role;
      }

      next();
    } catch (error) {
      next();
    }
  };

// ============================================================
// ROLE CHECKER
// ============================================================

const requireRoles =
  (...roles) => {
    return (
      req,
      res,
      next
    ) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (
        !roles.includes(
          req.user.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
          requiredRoles: roles,
          currentRole:
            req.user.role,
        });
      }

      next();
    };
  };

// ============================================================
// CUSTOMER
// ============================================================
//
// Buyers and sellers can act as delivery customers.
//
// This is intentional because a seller may need to book
// delivery for an item they sold.
//
// ============================================================

const requireCustomer =
  requireRoles(
    "buyer",
    "seller"
  );

// ============================================================
// RIDER
// ============================================================

const requireRider =
  requireRoles(
    "rider"
  );

// ============================================================
// ADMIN
// ============================================================

const requireAdmin =
  requireRoles(
    "admin"
  );

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRoles,
  requireCustomer,
  requireRider,
  requireAdmin,
};