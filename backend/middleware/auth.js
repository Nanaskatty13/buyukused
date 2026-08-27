// ============================================================
// BuyUKUsed
// backend/middleware/auth.js
// ============================================================
//
// CENTRAL AUTHENTICATION MIDDLEWARE
//
// This file is the main authentication/authorization middleware
// for BuyUKUsed.
//
// It:
// - Verifies JWT tokens
// - Loads the current user from MongoDB
// - Blocks deleted/deactivated accounts
// - Supports buyer/seller/user/admin/rider roles
// - Provides optional authentication
// - Provides role-based authorization
// - Keeps backward-compatible exports for existing routes
//
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// GET TOKEN FROM REQUEST
// ============================================================

const getTokenFromRequest = (req) => {
  const authHeader =
    req.headers.authorization || "";

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return null;
  }

  return authHeader
    .substring(7)
    .trim();
};

// ============================================================
// GET USER ID FROM JWT
// ============================================================
//
// Supports all currently used JWT payload formats:
//
// {
//   id: "..."
// }
//
// {
//   _id: "..."
// }
//
// {
//   userId: "..."
// }
//
// ============================================================

const getUserIdFromToken = (decoded) => {
  if (!decoded) {
    return null;
  }

  return (
    decoded.id ||
    decoded._id ||
    decoded.userId ||
    null
  );
};

// ============================================================
// VERIFY JWT TOKEN
// ============================================================
//
// Main authentication middleware.
//
// Usage:
//
// router.get(
//   "/protected",
//   protect,
//   controller
// );
//
// ============================================================

const verifyToken = async (
  req,
  res,
  next
) => {
  try {
    // --------------------------------------------------------
    // CHECK JWT SECRET
    // --------------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication is not configured.",
      });
    }

    // --------------------------------------------------------
    // GET TOKEN
    // --------------------------------------------------------

    const token =
      getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "No authentication token provided.",
      });
    }

    // --------------------------------------------------------
    // VERIFY JWT
    // --------------------------------------------------------

    let decoded;

    try {
      decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );
    } catch (error) {
      console.error(
        "❌ JWT verification failed:",
        error.message
      );

      if (
        error.name ===
        "TokenExpiredError"
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Token expired. Please log in again.",
        });
      }

      if (
        error.name ===
        "JsonWebTokenError"
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authentication token.",
        });
      }

      return res.status(401).json({
        success: false,
        message:
          "Authentication failed.",
      });
    }

    // --------------------------------------------------------
    // GET USER ID
    // --------------------------------------------------------

    const userId =
      getUserIdFromToken(
        decoded
      );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid token payload.",
      });
    }

    // --------------------------------------------------------
    // LOAD USER
    // --------------------------------------------------------

    const user =
      await User.findById(
        userId
      ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "User account no longer exists.",
      });
    }

    // --------------------------------------------------------
    // ACTIVE ACCOUNT CHECK
    // --------------------------------------------------------

    if (
      user.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated.",
      });
    }

    // --------------------------------------------------------
    // ATTACH USER
    // --------------------------------------------------------

    req.user = user;

    // String user ID
    req.userId =
      user._id.toString();

    // Current role
    req.userRole =
      user.role;

    // Original JWT payload
    req.auth =
      decoded;

    // Token
    req.token =
      token;

    // --------------------------------------------------------
    // CONTINUE
    // --------------------------------------------------------

    return next();

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
//
// Allows public routes to continue without authentication.
//
// If the token is valid:
//   req.user is populated.
//
// If there is no token, an invalid token, an expired token,
// or a deleted/deactivated account:
//   request continues as unauthenticated.
//
// Useful for public product/review pages.
//
// ============================================================

const optionalAuthenticate =
  async (
    req,
    res,
    next
  ) => {
    try {
      // ------------------------------------------------------
      // JWT SECRET
      // ------------------------------------------------------

      if (!process.env.JWT_SECRET) {
        return next();
      }

      // ------------------------------------------------------
      // TOKEN
      // ------------------------------------------------------

      const token =
        getTokenFromRequest(req);

      if (!token) {
        return next();
      }

      // ------------------------------------------------------
      // VERIFY
      // ------------------------------------------------------

      let decoded;

      try {
        decoded =
          jwt.verify(
            token,
            process.env.JWT_SECRET
          );
      } catch (error) {
        // Optional authentication should not reject
        // an otherwise public request.
        return next();
      }

      // ------------------------------------------------------
      // USER ID
      // ------------------------------------------------------

      const userId =
        getUserIdFromToken(
          decoded
        );

      if (!userId) {
        return next();
      }

      // ------------------------------------------------------
      // LOAD USER
      // ------------------------------------------------------

      const user =
        await User.findById(
          userId
        ).select("-password");

      if (!user) {
        return next();
      }

      // ------------------------------------------------------
      // ACTIVE ACCOUNT CHECK
      // ------------------------------------------------------

      if (
        user.isActive === false
      ) {
        return next();
      }

      // ------------------------------------------------------
      // ATTACH AUTH DATA
      // ------------------------------------------------------

      req.user = user;

      req.userId =
        user._id.toString();

      req.userRole =
        user.role;

      req.auth =
        decoded;

      req.token =
        token;

      return next();

    } catch (error) {
      console.warn(
        "⚠️ Optional authentication failed:",
        error.message
      );

      return next();
    }
  };

// ============================================================
// ROLE CHECKER
// ============================================================
//
// Usage:
//
// router.post(
//   "/something",
//   protect,
//   requireRoles("admin"),
//   controller
// );
//
// Multiple roles:
//
// requireRoles(
//   "buyer",
//   "seller"
// )
//
// ============================================================

const requireRoles =
  (...roles) => {
    return (
      req,
      res,
      next
    ) => {
      // ------------------------------------------------------
      // AUTHENTICATION REQUIRED
      // ------------------------------------------------------

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      // ------------------------------------------------------
      // ROLE CHECK
      // ------------------------------------------------------

      if (
        !roles.includes(
          req.user.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
          requiredRoles:
            roles,
          currentRole:
            req.user.role,
        });
      }

      return next();
    };
  };

// ============================================================
// ADMIN ONLY
// ============================================================

const isAdmin =
  requireRoles(
    "admin"
  );

// ============================================================
// RIDER ONLY
// ============================================================

const isRider =
  requireRoles(
    "rider"
  );

// ============================================================
// SELLER
// ============================================================
//
// BuyUKUsed uses a neutral marketplace model.
//
// Normal marketplace accounts can sell:
//
// - user
// - buyer
// - seller
//
// Admin is also allowed for administrative listing
// management.
//
// Rider is NOT allowed to create normal marketplace
// listings through seller-protected routes.
//
// ============================================================

const isSeller =
  requireRoles(
    "user",
    "buyer",
    "seller",
    "admin"
  );

// ============================================================
// CUSTOMER
// ============================================================
//
// A buyer or seller can purchase/request delivery.
//
// "user" is retained for compatibility with older accounts.
//
// Admin is intentionally not included here because admin
// endpoints should use isAdmin.
//
// ============================================================

const isCustomer =
  requireRoles(
    "user",
    "buyer",
    "seller"
  );

// ============================================================
// BUYER ONLY
// ============================================================

const isBuyer =
  requireRoles(
    "buyer"
  );

// ============================================================
// MARKETPLACE USER
// ============================================================
//
// General normal-user authorization.
//
// ============================================================

const isMarketplaceUser =
  requireRoles(
    "user",
    "buyer",
    "seller"
  );

// ============================================================
// SPECIAL ROLE HELPERS
// ============================================================

const requireAdmin =
  isAdmin;

const requireRider =
  isRider;

const requireSeller =
  isSeller;

const requireCustomer =
  isCustomer;

const requireBuyer =
  isBuyer;

const requireMarketplaceUser =
  isMarketplaceUser;

// ============================================================
// BACKWARD-COMPATIBILITY ALIASES
// ============================================================
//
// Existing routes may use:
//
// protect
// seller
// auth
//
// Keep all of them working.
//
// ============================================================

const protect =
  verifyToken;

const authenticate =
  verifyToken;

const auth =
  verifyToken;

const seller =
  isSeller;

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  verifyToken,
  authenticate,
  protect,
  auth,

  optionalAuthenticate,

  // ----------------------------------------------------------
  // Role checker
  // ----------------------------------------------------------

  requireRoles,

  // ----------------------------------------------------------
  // Role middleware
  // ----------------------------------------------------------

  isAdmin,
  isSeller,
  isBuyer,
  isRider,
  isCustomer,
  isMarketplaceUser,

  // ----------------------------------------------------------
  // require-style aliases
  // ----------------------------------------------------------

  requireAdmin,
  requireSeller,
  requireBuyer,
  requireRider,
  requireCustomer,
  requireMarketplaceUser,

  // ----------------------------------------------------------
  // Compatibility
  // ----------------------------------------------------------

  seller,
};