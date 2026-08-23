// ============================================================
// backend/routes/messageRoutes.js
// ============================================================

const express = require("express");

const router = express.Router();

const {
  getUserMessages,
  getConversation,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadMessageCount,
  deleteMessage,
} = require("../controllers/messageController");

const { protect } = require("../middleware/auth");

// ============================================================
// AUTHENTICATION
// ============================================================
//
// All message endpoints require a valid JWT.
//
// Frontend sends:
//
// Authorization: Bearer <token>
//
// protect middleware verifies the token and sets:
//
// req.user
// req.userId
// req.auth
//
// ============================================================


// ============================================================
// GET UNREAD MESSAGE COUNT
// GET /api/messages/unread-count
// ============================================================
//
// IMPORTANT:
//
// This MUST come BEFORE:
//
// /:userId
//
// Otherwise Express could interpret:
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
// GET CONVERSATION BETWEEN TWO USERS
// GET /api/messages/conversation/:userId
// ============================================================
//
// This MUST also come BEFORE:
//
// /:userId
//
// Otherwise "conversation" could be interpreted
// as a userId.
//

router.get(
  "/conversation/:userId",
  protect,
  getConversation
);


// ============================================================
// MARK ALL MESSAGES FROM A USER AS READ
// PUT /api/messages/conversation/:userId/read
// ============================================================
//
// IMPORTANT:
//
// This route must come before:
//
// /:id/read
//
// because "conversation" is a fixed route segment.
//

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
// MARK SINGLE MESSAGE AS READ
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
// GET ALL MESSAGES FOR A USER
// GET /api/messages/:userId
// ============================================================
//
// Keep this route AFTER all fixed routes above.
//

router.get(
  "/:userId",
  protect,
  getUserMessages
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;