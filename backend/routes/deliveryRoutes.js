// backend/routes/deliveryRoutes.js

const express = require("express");

const router = express.Router();

const deliveryController = require("../controllers/deliveryController");

const {
  authenticate,
  requireRider,
  requireCustomer,
} = require("../middleware/authMiddleware");

// ============================================================
// CUSTOMER ROUTES
// ============================================================

// ------------------------------------------------------------
// Create delivery request
// POST /api/deliveries
// ------------------------------------------------------------

router.post(
  "/",
  authenticate,
  requireCustomer,
  deliveryController.createDelivery
);

// ------------------------------------------------------------
// Customer's delivery history
// GET /api/deliveries/customer
// ------------------------------------------------------------

router.get(
  "/customer",
  authenticate,
  requireCustomer,
  deliveryController.getCustomerDeliveries
);

// ============================================================
// RIDER ROUTES
// ============================================================

// ------------------------------------------------------------
// Available delivery requests
// GET /api/deliveries/available
// ------------------------------------------------------------

router.get(
  "/available",
  authenticate,
  requireRider,
  deliveryController.getAvailableDeliveries
);

// ------------------------------------------------------------
// Rider's assigned deliveries
// GET /api/deliveries/my
// ------------------------------------------------------------

router.get(
  "/my",
  authenticate,
  requireRider,
  deliveryController.getRiderDeliveries
);

// ------------------------------------------------------------
// Rider availability
// PATCH /api/deliveries/rider/availability
// ------------------------------------------------------------

router.patch(
  "/rider/availability",
  authenticate,
  requireRider,
  deliveryController.toggleRiderAvailability
);

// ------------------------------------------------------------
// Accept delivery
// PATCH /api/deliveries/:id/accept
// ------------------------------------------------------------

router.patch(
  "/:id/accept",
  authenticate,
  requireRider,
  deliveryController.acceptDelivery
);

// ------------------------------------------------------------
// Update delivery status
// PATCH /api/deliveries/:id/status
// ------------------------------------------------------------

router.patch(
  "/:id/status",
  authenticate,
  requireRider,
  deliveryController.updateDeliveryStatus
);

// ------------------------------------------------------------
// Update rider location
// PATCH /api/deliveries/:id/location
// ------------------------------------------------------------

router.patch(
  "/:id/location",
  authenticate,
  requireRider,
  deliveryController.updateRiderLocation
);

// ============================================================
// SHARED ROUTES
// ============================================================

// ------------------------------------------------------------
// Get specific delivery
// GET /api/deliveries/:id
// ------------------------------------------------------------

router.get(
  "/:id",
  authenticate,
  deliveryController.getDelivery
);

// ------------------------------------------------------------
// Cancel delivery
// PATCH /api/deliveries/:id/cancel
// ------------------------------------------------------------

router.patch(
  "/:id/cancel",
  authenticate,
  deliveryController.cancelDelivery
);

module.exports = router;