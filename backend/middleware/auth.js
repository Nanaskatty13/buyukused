// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Use decoded.id OR decoded._id (whichever exists)
    const userId = decoded.id || decoded._id;
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

    // Check if account is active – only if the field exists
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Attach both full user and userId for convenience
    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Admin only middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Admin only.",
  });
};

// Seller only middleware
const isSeller = (req, res, next) => {
  // Allow sellers and admins
  if (req.user && (req.user.role === "seller" || req.user.role === "admin")) {
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