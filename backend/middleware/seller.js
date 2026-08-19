// middleware/seller.js

/**
 * Middleware: Restrict access to sellers and admins only.
 *
 * Usage: Place after `auth` middleware to ensure user is authenticated.
 *
 * Flow:
 * 1. Checks if user exists (from previous auth middleware)
 * 2. Verifies role is 'seller' or 'admin'
 * 3. (Optional) Checks if seller account is active (if `isActive` or `status` field exists)
 * 4. Logs unauthorized attempts for monitoring
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const seller = (req, res, next) => {
  // 1. Ensure user is authenticated first
  if (!req.user) {
    console.warn(`⚠️ Seller middleware: No user object on request (IP: ${req.ip})`);
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication required. Please log in.",
    });
  }

  // 2. Ensure user has an ID (basic sanity)
  if (!req.user._id && !req.user.id) {
    console.warn(`⚠️ Seller middleware: User object missing ID (IP: ${req.ip})`);
    return res.status(401).json({
      success: false,
      code: "INVALID_USER",
      message: "Invalid user session. Please log in again.",
    });
  }

  // 3. Check role – allow sellers and admins
  const userRole = req.user.role?.toLowerCase?.() || req.user.role || "";
  if (userRole === "seller" || userRole === "admin") {
    // Optional: Additional checks for seller status (if you have it)
    // For example, if your User model has `isActive` or `status` field:
    if (req.user.isActive === false || req.user.status === "suspended") {
      console.warn(
        `⚠️ Seller middleware: Suspended seller attempted access: ${req.user._id || req.user.id}`
      );
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        message: "Your seller account has been suspended. Please contact support.",
      });
    }

    // All checks passed – allow access
    return next();
  }

  // 4. Role not allowed – log and reject
  console.warn(
    `⚠️ Seller middleware: Forbidden access attempt by user ${req.user._id || req.user.id} with role: ${userRole}`
  );
  return res.status(403).json({
    success: false,
    code: "FORBIDDEN",
    message: "Seller access required. You do not have the necessary permissions.",
  });
};

module.exports = seller;