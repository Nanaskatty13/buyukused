// ============================================================
// backend/routes/messages.js
// BuyUKUsed - Message Routes
// ============================================================

const express = require("express");

const router = express.Router();

// ============================================================
// AUTHENTICATION
// ============================================================

const {
  protect,
} = require("../middleware/auth");

// ============================================================
// MESSAGE CONTROLLER
// ============================================================

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
// AUTHENTICATION FOR ALL MESSAGE ROUTES
// ============================================================

router.use(protect);

// ============================================================
// GET UNREAD MESSAGE COUNT
// ============================================================
//
// Primary endpoint:
//
// GET /api/messages/unread/count
//
// ============================================================

router.get(
  "/unread/count",
  getUnreadMessageCount
);

// ============================================================
// COMPATIBILITY ENDPOINT
// ============================================================
//
// Supports:
//
// GET /api/messages/unread-count
//
// This prevents older frontend code from breaking.
// ============================================================

router.get(
  "/unread-count",
  getUnreadMessageCount
);

// ============================================================
// GET CONVERSATION
// ============================================================
//
// GET /api/messages/conversation/:userId
//
// ============================================================

router.get(
  "/conversation/:userId",
  getConversation
);

// ============================================================
// MARK CONVERSATION AS READ
// ============================================================
//
// PUT /api/messages/conversation/:userId/read
//
// ============================================================

router.put(
  "/conversation/:userId/read",
  markConversationAsRead
);

// ============================================================
// SEND MESSAGE
// ============================================================
//
// POST /api/messages
//
// Body:
//
// {
//   "receiver": "USER_ID",
//   "productId": "PRODUCT_ID",
//   "message": "Is this product still available?"
// }
//
// productId is optional.
//
// ============================================================

router.post(
  "/",
  sendMessage
);

// ============================================================
// MARK ONE MESSAGE AS READ
// ============================================================
//
// PUT /api/messages/:id/read
//
// ============================================================

router.put(
  "/:id/read",
  markMessageAsRead
);

// ============================================================
// DELETE MESSAGE
// ============================================================
//
// DELETE /api/messages/:id
//
// ============================================================

router.delete(
  "/:id",
  deleteMessage
);

// ============================================================
// GET ALL MESSAGES FOR USER
// ============================================================
//
// GET /api/messages/:userId
//
// IMPORTANT:
// This remains AFTER all fixed routes above.
//
// ============================================================

router.get(
  "/:userId",
  getUserMessages
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;