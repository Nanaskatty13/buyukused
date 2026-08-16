// backend/routes/deliveries.js

const express = require("express");

const {
  createDelivery,
  getAvailableDeliveries,
  acceptDelivery,
  updateDeliveryStatus,
  getMyDeliveries,
  getRiderDeliveries,
  getDelivery,
  toggleRiderAvailability,
} = require("../controllers/deliveryController");

const auth = require("../middleware/auth");

const router = express.Router();

// ============================================================
// DELIVERY REQUESTS
// ============================================================

// Buyer / Seller creates a delivery request
// POST /api/deliveries
router.post(
  "/",
  auth,
  createDelivery
);

// ============================================================
// RIDER DELIVERY REQUESTS
// ============================================================

// Approved + available riders see pending requests
// GET /api/deliveries/available
router.get(
  "/available",
  auth,
  getAvailableDeliveries
);

// Rider's own assigned deliveries
// GET /api/deliveries/rider
router.get(
  "/rider",
  auth,
  getRiderDeliveries
);

// ============================================================
// USER DELIVERY HISTORY
// ============================================================

// Buyer's / Seller's delivery requests
// GET /api/deliveries/my
router.get(
  "/my",
  auth,
  getMyDeliveries
);

// ============================================================
// RIDER AVAILABILITY
// ============================================================

// Rider turns availability ON/OFF
// PATCH /api/deliveries/rider/availability
router.patch(
  "/rider/availability",
  auth,
  toggleRiderAvailability
);

// ============================================================
// SINGLE DELIVERY
// ============================================================

// Get one delivery
// GET /api/deliveries/:id
router.get(
  "/:id",
  auth,
  getDelivery
);

// ============================================================
// ACCEPT DELIVERY
// ============================================================

// Rider accepts delivery
// POST /api/deliveries/:id/accept
router.post(
  "/:id/accept",
  auth,
  acceptDelivery
);

// ============================================================
// UPDATE DELIVERY STATUS
// ============================================================

// Rider updates:
// accepted
// picked_up
// in_transit
// delivered
// cancelled
//
// PATCH /api/deliveries/:id/status
router.patch(
  "/:id/status",
  auth,
  updateDeliveryStatus
);

module.exports = router;