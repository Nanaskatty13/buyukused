// ============================================================
// backend/routes/messages.js
// BuyUKUsed - Messaging Routes
// ============================================================

const express = require("express");

const {
  sendMessage,
  getMessages,
  getConversation,
  getConversations,
  getUnreadCount,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
} = require("../controllers/messageController");

const router = express.Router();

// ============================================================
// AUTHENTICATION
// ============================================================

// Your project uses the auth middleware.
// Adjust ONLY this import if your actual middleware exports
// the authentication function under a different name.
const { protect } = require("../middleware/auth");

// ============================================================
// GET ALL MESSAGES FOR CURRENT USER
// GET /api/messages
// ============================================================

router.get(
  "/",
  protect,
  getMessages
);

// ============================================================
// GET ALL CONVERSATIONS
// GET /api/messages/conversations
// ============================================================

router.get(
  "/conversations",
  protect,
  getConversations
);

// ============================================================
// UNREAD COUNT
// ============================================================

// Main endpoint
// GET /api/messages/unread-count

router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

// Compatibility endpoint
// GET /api/messages/unread/count

router.get(
  "/unread/count",
  protect,
  getUnreadCount
);

// ============================================================
// GET CONVERSATION
// GET /api/messages/conversation/:userId
// ============================================================

router.get(
  "/conversation/:userId",
  protect,
  getConversation
);

// ============================================================
// MARK CONVERSATION AS READ
// PUT /api/messages/conversation/:userId/read
// ============================================================

router.put(
  "/conversation/:userId/read",
  protect,
  markConversationAsRead
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
// MARK ONE MESSAGE AS READ
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
// EXPORT
// ============================================================

module.exports = router;