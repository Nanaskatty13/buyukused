// ============================================================
// backend/routes/reviewRoutes.js
// BuyUKUsed Review Routes
// ============================================================

const express = require("express");

const router = express.Router();

const {
  getProductReviews,
  getSellerReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  checkUserReview,
} = require("../controllers/reviewController");

// ============================================================
// AUTHENTICATION
// ============================================================

const passport = require("passport");

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
//
// This assumes your Passport JWT strategy is already configured
// in:
// backend/config/passport.js
//
// Public GET routes remain accessible without login.
// POST/PUT/DELETE require authentication.
// ============================================================

const requireAuth = passport.authenticate(
  "jwt",
  {
    session: false,
  }
);

// ============================================================
// ROUTER-LEVEL REQUEST LOGGER
//
// Prints one line per request that reaches this file.
//
// If your 404s appear in Render logs WITHOUT a matching
// "⭐ REVIEW ROUTER:" line, then the request never reached
// this router — the /api/reviews mount in server.js is stale
// or missing.
//
// This middleware runs BEFORE all routes so it fires even
// when a route returns 400/401/404 from within this file.
// ============================================================

router.use((req, res, next) => {
  console.log(
    `⭐ REVIEW ROUTER: ${req.method} ${req.originalUrl}`
  );
  next();
});

// ============================================================
// ROUTER-LEVEL DIAGNOSTIC PING
//
// GET /api/reviews/ping  (no auth, no params)
//
// - 200 → this file loaded correctly on the deployed server
// - 404 → this file was never loaded (mount missing from server.js)
//
// MUST appear BEFORE /:id so the ID handler can't intercept it.
// ============================================================

router.get(
  "/ping",
  (req, res) => {
    const routes =
      Array.isArray(router.stack)
        ? router.stack
            .filter((layer) => layer.route)
            .map((layer) => {
              const method =
                Object.keys(layer.route.methods || {})[0]
                  ?.toUpperCase?.() || "GET";
              return `${method} ${layer.route.path}`;
            })
        : [];

    const hasRootRoute =
      routes.some((r) => r === "GET /");
    const hasProductReviewsRoute =
      routes.some((r) => r === "GET /product");
    const hasSellerReviewsRoute =
      routes.some((r) => r === "GET /seller");
    const hasByIdRoute =
      routes.some((r) => r === "GET /:id");
    const hasCreateRoute =
      routes.some((r) => r === "POST /");
    const hasUpdateRoute =
      routes.some((r) => r === "PUT /:id");
    const hasDeleteRoute =
      routes.some((r) => r === "DELETE /:id");
    const hasCheckRoute =
      routes.some((r) => r === "GET /check");

    res.status(200).json({
      success: true,
      message: "Reviews router is alive",

      routeCount: routes.length,

      hasRootRoute,
      hasProductReviewsRoute,
      hasSellerReviewsRoute,
      hasCheckRoute,
      hasByIdRoute,
      hasCreateRoute,
      hasUpdateRoute,
      hasDeleteRoute,

      routes,

      timestamp:
        new Date().toISOString(),

      hint:
        hasSellerReviewsRoute &&
        hasProductReviewsRoute &&
        hasRootRoute
          ? "✅ Public seller review routes exist. If /api/reviews?sellerId=… still 404s, check that you're hitting the right base URL."
          : "⚠️ One or more public review routes are MISSING. Check that this file ends with `module.exports = router;` and hasn't been replaced by an older version on the server.",
    });
  }
);

// ============================================================
// GET PRODUCT REVIEWS
// ============================================================
//
// GET /api/reviews?productId=...&page=1&limit=10
//
// PUBLIC
// ============================================================

router.get(
  "/",
  (req, res, next) => {
    // If sellerId is supplied without productId,
    // return seller reviews.

    if (
      req.query.sellerId &&
      !req.query.productId
    ) {
      return getSellerReviews(
        req,
        res,
        next
      );
    }

    return getProductReviews(
      req,
      res,
      next
    );
  }
);

// ============================================================
// EXPLICIT PRODUCT REVIEWS
// ============================================================

router.get(
  "/product",
  getProductReviews
);

// ============================================================
// EXPLICIT SELLER REVIEWS
// ============================================================

router.get(
  "/seller",
  getSellerReviews
);

// ============================================================
// CHECK USER REVIEW
// ============================================================
//
// GET /api/reviews/check?type=PRODUCT&productId=...
//
// AUTHENTICATED
// ============================================================

router.get(
  "/check",
  requireAuth,
  checkUserReview
);

// ============================================================
// GET SINGLE REVIEW
// ============================================================
//
// GET /api/reviews/:id
//
// PUBLIC
// ============================================================

router.get(
  "/:id",
  getReviewById
);

// ============================================================
// CREATE REVIEW
// ============================================================
//
// POST /api/reviews
//
// AUTHENTICATED
// ============================================================

router.post(
  "/",
  requireAuth,
  createReview
);

// ============================================================
// UPDATE REVIEW
// ============================================================
//
// PUT /api/reviews/:id
//
// AUTHENTICATED
// ============================================================

router.put(
  "/:id",
  requireAuth,
  updateReview
);

// ============================================================
// DELETE REVIEW
// ============================================================
//
// DELETE /api/reviews/:id
//
// AUTHENTICATED
// ============================================================

router.delete(
  "/:id",
  requireAuth,
  deleteReview
);

// ============================================================
// STARTUP DIAGNOSTIC
//
// Prints once, when the module is first required by
// server.js. You should see this line in Render logs at boot:
//
//   ⭐ reviewRoutes.js: 8 route(s) registered
//
// If the count is 0, the file's routes were never registered
// (usually because `module.exports = router;` is missing or
// the file is being replaced at deploy time by an older copy).
// ============================================================

const routeCount =
  Array.isArray(router.stack)
    ? router.stack.length
    : -1;

console.log(
  `⭐ reviewRoutes.js: ${routeCount} route(s) registered`
);

if (routeCount <= 0) {
  console.warn(
    "⚠️ reviewRoutes.js exported ZERO routes. " +
      "GET /api/reviews will 404 until this file defines routes and ends with `module.exports = router;`."
  );
} else {
  const paths = router.stack
    .filter((layer) => layer.route)
    .map((layer) => {
      const method =
        Object.keys(layer.route.methods || {})[0]
          ?.toUpperCase?.() || "GET";
      return `${method} ${layer.route.path}`;
    });

  console.log(
    "⭐ reviewRoutes.js routes:",
    paths
  );
}

// ============================================================
// EXPORT
// ============================================================

module.exports = router;