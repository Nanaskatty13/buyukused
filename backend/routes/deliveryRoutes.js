// backend/routes/deliveryRoutes.js

const express = require("express");

const router =
  express.Router();

const deliveryController =
  require("../controllers/deliveryController");

const {
  authenticate,
  requireRider,
  requireCustomer,
} =
  require("../middleware/authMiddleware");

// ============================================================
// CUSTOMER ROUTES
// ============================================================

// Create delivery request
router.post(
  "/",
  authenticate,
  requireCustomer,
  deliveryController.createDelivery
);

// Customer's delivery history
router.get(
  "/customer",
  authenticate,
  requireCustomer,
  deliveryController.getCustomerDeliveries
);

// ============================================================
// RIDER ROUTES
// ============================================================

// Available delivery requests
router.get(
  "/available",
  authenticate,
  requireRider,
  deliveryController.getAvailableDeliveries
);

// Rider's deliveries
router.get(
  "/my",
  authenticate,
  requireRider,
  deliveryController.getMyDeliveries
);

// Rider availability
router.patch(
  "/rider/availability",
  authenticate,
  requireRider,
  deliveryController.updateRiderAvailability
);

// Accept delivery
router.patch(
  "/:id/accept",
  authenticate,
  requireRider,
  deliveryController.acceptDelivery
);

// Update delivery status
router.patch(
  "/:id/status",
  authenticate,
  requireRider,
  deliveryController.updateDeliveryStatus
);

// Update rider location
router.patch(
  "/:id/location",
  authenticate,
  requireRider,
  deliveryController.updateRiderLocation
);

// ============================================================
// SHARED ROUTES
// ============================================================

// Get specific delivery
router.get(
  "/:id",
  authenticate,
  deliveryController.getDelivery
);

// Cancel delivery
router.patch(
  "/:id/cancel",
  authenticate,
  deliveryController.cancelDelivery
);

module.exports =
  router;