// ============================================================
// BuyUKUsed
// backend/middleware/authMiddleware.js
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
// AUTHENTICATE USER
// ============================================================
//
// Verifies JWT and loads the current user.
//
// This middleware only authenticates.
// Role permissions are handled separately.
//
// ============================================================

const authenticate = async (
  req,
  res,
  next
) => {
  try {
    // --------------------------------------------------------
    // JWT SECRET
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // TOKEN
    // --------------------------------------------------------

    const token =
      getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required. Please log in.",
      });
    }

    // --------------------------------------------------------
    // VERIFY TOKEN
    // --------------------------------------------------------

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

      if (
        error.name ===
        "TokenExpiredError"
      ) {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please log in again.",
        });
      }

      if (
        error.name ===
        "JsonWebTokenError"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token.",
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
    //
    // Support multiple JWT payload formats for compatibility.
    //
    // --------------------------------------------------------

    const userId =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token payload.",
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

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated.",
      });
    }

    // --------------------------------------------------------
    // ATTACH AUTH DATA
    // --------------------------------------------------------

    req.user = user;

    req.userId =
      user._id.toString();

    req.userRole =
      user.role;

    req.auth = decoded;

    req.token = token;

    // --------------------------------------------------------
    // CONTINUE
    // --------------------------------------------------------

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
//
// Allows both authenticated and unauthenticated requests.
//
// If a valid token exists, req.user is populated.
// If there is no token or the token is invalid, the request
// continues as unauthenticated.
//
// Useful for:
// - Public product pages
// - Product details
// - Reviews
// - Favorites
// - Personalized content
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
        // Invalid/expired token is ignored here because
        // authentication is optional.
        return next();
      }

      // ------------------------------------------------------
      // USER ID
      // ------------------------------------------------------

      const userId =
        decoded?.id ||
        decoded?._id ||
        decoded?.userId;

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
      // ACTIVE CHECK
      // ------------------------------------------------------

      if (user.isActive === false) {
        return next();
      }

      // ------------------------------------------------------
      // ATTACH USER
      // ------------------------------------------------------

      req.user = user;

      req.userId =
        user._id.toString();

      req.userRole =
        user.role;

      req.auth = decoded;

      req.token = token;

      next();
    } catch (error) {
      console.warn(
        "⚠️ Optional authentication failed:",
        error.message
      );

      next();
    }
  };

// ============================================================
// ROLE CHECKER
// ============================================================
//
// Usage:
//
// router.get(
//   "/admin",
//   authenticate,
//   requireRoles("admin"),
//   controller
// );
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
      // AUTHENTICATION CHECK
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
// BuyUKUsed is a marketplace where buyers and sellers can
// both purchase products and request deliveries.
//
// Therefore both buyer and seller are customers.
//
// "user" is included for compatibility with older accounts.
//
// Admin is intentionally NOT included as a customer role.
// Admin should use admin-specific endpoints/permissions.
//
// ============================================================

const requireCustomer =
  requireRoles(
    "user",
    "buyer",
    "seller"
  );

// ============================================================
// SELLER
// ============================================================
//
// Because BuyUKUsed allows marketplace users to sell,
// buyer/seller accounts can be allowed to create listings.
//
// "user" is included for compatibility with older accounts.
//
// Admin is included so an administrator can manage listings
// through seller-protected endpoints when necessary.
//
// ============================================================

const requireSeller =
  requireRoles(
    "user",
    "buyer",
    "seller",
    "admin"
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
// BUYER
// ============================================================

const requireBuyer =
  requireRoles(
    "buyer"
  );

// ============================================================
// USER / BUYER / SELLER
// ============================================================
//
// General marketplace account check.
//
// Useful when an endpoint should be available to normal
// marketplace users regardless of whether their role is
// currently buyer or seller.
//
// ============================================================

const requireMarketplaceUser =
  requireRoles(
    "user",
    "buyer",
    "seller"
  );

// ============================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================

const protect =
  authenticate;

const auth =
  authenticate;

const isAdmin =
  requireAdmin;

const isRider =
  requireRider;

const isSeller =
  requireSeller;

const isCustomer =
  requireCustomer;

const seller =
  requireSeller;

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Main authentication
  authenticate,

  // Optional authentication
  optionalAuthenticate,

  // Role system
  requireRoles,

  requireCustomer,
  requireSeller,
  requireBuyer,
  requireRider,
  requireAdmin,
  requireMarketplaceUser,

  // Compatibility aliases
  protect,
  auth,

  isAdmin,
  isSeller,
  isRider,
  isCustomer,

  seller,
};