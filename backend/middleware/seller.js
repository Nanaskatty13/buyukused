// middleware/seller.js
const seller = (req, res, next) => {
  // Ensure user is authenticated first
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized – please log in",
    });
  }

  // Check role
  if (req.user.role === "seller" || req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Seller access denied",
  });
};

module.exports = seller;