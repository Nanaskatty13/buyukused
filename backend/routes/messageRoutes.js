// ============================================================
// backend/routes/messageRoutes.js
// ============================================================

const express = require("express");

const router = express.Router();

const {
  getMessages,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessageCount,
} = require("../controllers/messageController");

const { protect } = require("../middleware/auth");

// ============================================================
// AUTHENTICATION
// ============================================================
//
// Every message route requires a valid logged-in user.
//
// Expected request header:
// Authorization: Bearer <JWT_TOKEN>
//

// ============================================================
// GET UNREAD MESSAGE COUNT
// GET /api/messages/unread-count
// ============================================================
//
// IMPORTANT:
// This route MUST appear BEFORE /:userId.
//
// Otherwise Express may treat:
//
// /unread-count
//
// as:
//
// /:userId
//
// ============================================================

router.get(
  "/unread-count",
  protect,
  getUnreadMessageCount
);

// ============================================================
// GET ALL MESSAGES FOR A USER
// GET /api/messages/:userId
// ============================================================

router.get(
  "/:userId",
  protect,
  getMessages
);

// ============================================================
// SEND MESSAGE
// POST /api/messages
// ============================================================

router.post(
  "/",
  protect,
  sendMessage
);

// ============================================================
// MARK MESSAGE AS READ
// PUT /api/messages/:id/read
// ============================================================

router.put(
  "/:id/read",
  protect,
  markMessageAsRead
);

// ============================================================
// DELETE MESSAGE
// DELETE /api/messages/:id
// ============================================================

router.delete(
  "/:id",
  protect,
  deleteMessage
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;