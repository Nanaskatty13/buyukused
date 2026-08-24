// ============================================================
// backend/routes/messages.js
// BuyUKUsed - Message Routes
// ============================================================

const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getUserMessages,
  getConversation,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadMessageCount,
  deleteMessage,
} = require("../controllers/messageController");

// ============================================================
// UNREAD COUNT
// ============================================================
//
// IMPORTANT:
// This route MUST appear before /:userId.
// Navbar.jsx calls:
//
// GET /api/messages/unread-count
//
// ============================================================

router.get(
  "/unread-count",
  auth,
  getUnreadMessageCount
);

// Backward-compatible endpoint.
// Some older frontend code may use /unread/count.
router.get(
  "/unread/count",
  auth,
  getUnreadMessageCount
);

// ============================================================
// CONVERSATION
// ============================================================

// GET /api/messages/conversation/:userId
router.get(
  "/conversation/:userId",
  auth,
  getConversation
);

// PUT /api/messages/conversation/:userId/read
router.put(
  "/conversation/:userId/read",
  auth,
  markConversationAsRead
);

// ============================================================
// SEND MESSAGE
// ============================================================

// POST /api/messages
router.post(
  "/",
  auth,
  sendMessage
);

// ============================================================
// USER MESSAGES
// ============================================================

// GET /api/messages/:userId
router.get(
  "/:userId",
  auth,
  getUserMessages
);

// ============================================================
// MARK ONE MESSAGE AS READ
// ============================================================

// PUT /api/messages/:id/read
router.put(
  "/:id/read",
  auth,
  markMessageAsRead
);

// ============================================================
// DELETE MESSAGE
// ============================================================

// DELETE /api/messages/:id
router.delete(
  "/:id",
  auth,
  deleteMessage
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;