// ============================================================
// backend/routes/favoriteRoutes.js
// ============================================================

const express = require("express");

const router = express.Router();

const {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  getMyFavorites,
  checkFavorite,
  getFavoriteIds,
} = require("../controllers/favoriteController");

// IMPORTANT:
// Change this import path if your authentication middleware
// has a different filename.
const authMiddleware = require("../middleware/authMiddleware");

// ============================================================
// GET ALL MY FAVORITES
// GET /api/favorites
// ============================================================

router.get(
  "/",
  authMiddleware,
  getMyFavorites
);

// ============================================================
// GET FAVORITE PRODUCT IDS
// GET /api/favorites/ids
// ============================================================

router.get(
  "/ids",
  authMiddleware,
  getFavoriteIds
);

// ============================================================
// CHECK ONE PRODUCT
// GET /api/favorites/check/:productId
// ============================================================

router.get(
  "/check/:productId",
  authMiddleware,
  checkFavorite
);

// ============================================================
// ADD FAVORITE
// POST /api/favorites
// Body: { productId }
// ============================================================

router.post(
  "/",
  authMiddleware,
  addFavorite
);

// ============================================================
// TOGGLE FAVORITE
// POST /api/favorites/:productId/toggle
// ============================================================

router.post(
  "/:productId/toggle",
  authMiddleware,
  toggleFavorite
);

// ============================================================
// REMOVE FAVORITE
// DELETE /api/favorites/:productId
// ============================================================

router.delete(
  "/:productId",
  authMiddleware,
  removeFavorite
);

module.exports = router;