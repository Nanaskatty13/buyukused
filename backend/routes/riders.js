// backend/routes/riders.js

const express = require("express");

const router = express.Router();

const riderController =
  require("../controllers/riderController");

// ============================================================
// RIDER REGISTRATION
// ============================================================

router.post(
  "/register",
  riderController.registerRider
);

module.exports = router;