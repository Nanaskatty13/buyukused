// backend/middleware/activity.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// ACTIVITY MIDDLEWARE
// ============================================================

const activity = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    // --------------------------------------------------------
    // No authentication token
    // --------------------------------------------------------

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return next();
    }

    const token =
      authHeader.substring(7).trim();

    if (!token) {
      return next();
    }

    // --------------------------------------------------------
    // Verify token
    // --------------------------------------------------------

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // --------------------------------------------------------
    // Support different JWT payload formats
    // --------------------------------------------------------

    const userId =
      decoded._id ||
      decoded.id ||
      decoded.userId ||
      decoded.user?.id ||
      decoded.user?._id;

    if (!userId) {
      return next();
    }

    const now = new Date();

    // Make ID available to later middleware
    req.activityUserId =
      userId;

    // --------------------------------------------------------
    // Update activity
    // --------------------------------------------------------

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          lastActive: now,
          lastSeen: now,
        },
      },
      {
        new: false,
        runValidators: false,
      }
    );

    next();
  } catch (error) {
    // Activity tracking must NEVER prevent
    // the actual request from working.

    console.warn(
      "⚠️ Activity tracking skipped:",
      error.message
    );

    next();
  }
};

module.exports = activity;