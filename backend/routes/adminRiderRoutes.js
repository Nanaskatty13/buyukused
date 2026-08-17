// backend/routes/adminRiderRoutes.js

const express = require("express");

const router = express.Router();

const {
  authenticate,
  requireAdmin,
} = require("../middleware/authMiddleware");

const {
  getRiders,
  getRider,
  getRiderStats,
  approveRider,
  rejectRider,
  activateRider,
  deactivateRider,
} = require("../controllers/adminRiderController");

// ============================================================
// ALL ADMIN RIDER ROUTES REQUIRE AUTH + ADMIN
// ============================================================

router.use(authenticate);
router.use(requireAdmin);

// ============================================================
// RIDER STATISTICS
// IMPORTANT: stats MUST come before /:id
// ============================================================

router.get(
  "/stats",
  getRiderStats
);

// ============================================================
// GET RIDERS
// ============================================================

router.get(
  "/",
  getRiders
);

// ============================================================
// GET RIDER
// ============================================================

router.get(
  "/:id",
  getRider
);

// ============================================================
// APPROVE
// ============================================================

router.patch(
  "/:id/approve",
  approveRider
);

// ============================================================
// REJECT
// ============================================================

router.patch(
  "/:id/reject",
  rejectRider
);

// ============================================================
// ACTIVATE
// ============================================================

router.patch(
  "/:id/activate",
  activateRider
);

// ============================================================
// DEACTIVATE
// ============================================================

router.patch(
  "/:id/deactivate",
  deactivateRider
);

module.exports = router;