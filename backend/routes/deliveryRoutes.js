// backend/routes/deliveryRoutes.js

const express = require("express");

const router = express.Router();

const deliveryController = require("../controllers/deliveryController");

const {
  authenticate,
  requireRider,
} = require("../middleware/authMiddleware");

// ============================================================
// AUTHENTICATED CUSTOMER / SELLER ACCESS
// ============================================================
//
// Buyers and sellers are both allowed to create delivery
// requests. A seller may need delivery after selling a product.
//
// Authentication is still required.
//
// ============================================================

// ------------------------------------------------------------
// CREATE DELIVERY
// POST /api/deliveries
// ------------------------------------------------------------

router.post(
  "/",
  authenticate,
  deliveryController.createDelivery
);

// ------------------------------------------------------------
// CUSTOMER DELIVERY HISTORY
// GET /api/deliveries/customer
// ------------------------------------------------------------

router.get(
  "/customer",
  authenticate,
  deliveryController.getCustomerDeliveries
);

// ------------------------------------------------------------
// BACKWARD-COMPATIBILITY ALIAS
// GET /api/deliveries/my
//
// For customers/sellers this returns their own deliveries.
// Rider users should use the rider route below.
// ------------------------------------------------------------

router.get(
  "/customer/my",
  authenticate,
  deliveryController.getCustomerDeliveries
);

// ============================================================
// RIDER-ONLY ROUTES
// ============================================================

// ------------------------------------------------------------
// AVAILABLE DELIVERY REQUESTS
// GET /api/deliveries/available
// ------------------------------------------------------------

router.get(
  "/available",
  authenticate,
  requireRider,
  deliveryController.getAvailableDeliveries
);

// ------------------------------------------------------------
// RIDER'S ASSIGNED DELIVERIES
// GET /api/deliveries/my
// ------------------------------------------------------------
//
// IMPORTANT:
// This route is rider-only.
//
// ------------------------------------------------------------

router.get(
  "/my",
  authenticate,
  requireRider,
  deliveryController.getRiderDeliveries
);

// ------------------------------------------------------------
// RIDER AVAILABILITY
// PATCH /api/deliveries/rider/availability
// ------------------------------------------------------------

router.patch(
  "/rider/availability",
  authenticate,
  requireRider,
  deliveryController.toggleRiderAvailability
);

// ------------------------------------------------------------
// ACCEPT DELIVERY
// PATCH /api/deliveries/:id/accept
// ------------------------------------------------------------

router.patch(
  "/:id/accept",
  authenticate,
  requireRider,
  deliveryController.acceptDelivery
);

// ------------------------------------------------------------
// UPDATE DELIVERY STATUS
// PATCH /api/deliveries/:id/status
// ------------------------------------------------------------

router.patch(
  "/:id/status",
  authenticate,
  requireRider,
  deliveryController.updateDeliveryStatus
);

// ------------------------------------------------------------
// UPDATE RIDER LOCATION
// PATCH /api/deliveries/:id/location
// ------------------------------------------------------------

router.patch(
  "/:id/location",
  authenticate,
  requireRider,
  deliveryController.updateRiderLocation
);

// ============================================================
// SHARED AUTHENTICATED ROUTES
// ============================================================

// ------------------------------------------------------------
// GET SINGLE DELIVERY
// GET /api/deliveries/:id
// ------------------------------------------------------------

router.get(
  "/:id",
  authenticate,
  deliveryController.getDelivery
);

// ------------------------------------------------------------
// CANCEL DELIVERY
// PATCH /api/deliveries/:id/cancel
// ------------------------------------------------------------

router.patch(
  "/:id/cancel",
  authenticate,
  deliveryController.cancelDelivery
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;