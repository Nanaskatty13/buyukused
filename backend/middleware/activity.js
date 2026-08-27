// ============================================================
// backend/middleware/activity.js
// BuyUKUsed - JWT Activity & User Context Middleware
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ============================================================
// ACTIVITY MIDDLEWARE
// ============================================================
//
// Responsibilities:
//
// 1. Read Bearer JWT
// 2. Verify JWT
// 3. Identify the user
// 4. Attach:
//      req.userId
//      req.user
//      req.activityUserId
// 5. Update lastActive / lastSeen
//
// IMPORTANT:
// Requests without a token are still allowed through.
// Protected routes/controllers are responsible for returning
// 401 when authentication is required.
//
// ============================================================

const activity = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || "";

    // --------------------------------------------------------
    // No authentication token
    // --------------------------------------------------------
    //
    // Public requests are allowed to continue.
    //
    // --------------------------------------------------------

    if (!authHeader.startsWith("Bearer ")) {
      return next();
    }

    // --------------------------------------------------------
    // Extract token
    // --------------------------------------------------------

    const token =
      authHeader.substring(7).trim();

    if (!token) {
      return next();
    }

    // --------------------------------------------------------
    // JWT SECRET CHECK
    // --------------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is not configured."
      );

      return next();
    }

    // --------------------------------------------------------
    // Verify JWT
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
      decoded?._id ||
      decoded?.id ||
      decoded?.userId ||
      decoded?.user?.id ||
      decoded?.user?._id;

    if (!userId) {
      console.warn(
        "⚠️ JWT verified but no user ID was found."
      );

      return next();
    }

    // --------------------------------------------------------
    // Validate MongoDB ObjectId
    // --------------------------------------------------------

    if (
      !/^[a-fA-F0-9]{24}$/.test(
        String(userId)
      )
    ) {
      console.warn(
        "⚠️ JWT contains an invalid user ID."
      );

      return next();
    }

    // --------------------------------------------------------
    // Load user
    // --------------------------------------------------------

    const user =
      await User.findById(userId);

    if (!user) {
      console.warn(
        `⚠️ JWT user not found: ${userId}`
      );

      return next();
    }

    // --------------------------------------------------------
    // Inactive account
    // --------------------------------------------------------

    if (
      user.isActive === false
    ) {
      console.warn(
        `⚠️ Inactive user attempted request: ${userId}`
      );

      return next();
    }

    // ========================================================
    // ATTACH AUTHENTICATED USER CONTEXT
    // ========================================================

    // Used by reviewController.js and other controllers.
    req.userId =
      String(user._id);

    // Used by controllers that need the complete user.
    req.user =
      user;

    // Preserve existing activity property for compatibility.
    req.activityUserId =
      String(user._id);

    // ========================================================
    // UPDATE ACTIVITY
    // ========================================================

    const now =
      new Date();

    await User.findByIdAndUpdate(
      user._id,
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
    // ========================================================
    // IMPORTANT
    // ========================================================
    //
    // Activity tracking should never crash the API.
    //
    // However, an invalid JWT is NOT converted into a valid
    // authenticated user. The protected controller will still
    // reject the request because req.userId is missing.
    //
    // ========================================================

    console.warn(
      "⚠️ Activity/auth context skipped:",
      error.message
    );

    next();
  }
};

module.exports = activity;