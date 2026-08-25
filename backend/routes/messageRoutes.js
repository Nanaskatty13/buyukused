// ============================================================
// backend/routes/messageRoutes.js
// BuyUKUsed - Message Routes
// ============================================================

"use strict";

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

const {
  protect,
} = require("../middleware/auth");

// ============================================================
// UNREAD MESSAGE COUNT
// GET /api/messages/unread-count
// ============================================================
//
// IMPORTANT:
// This route must be BEFORE /:userId.
//
// Frontend:
// GET /api/messages/unread-count
//
// Authentication:
// Authorization: Bearer <JWT>
// ============================================================

router.get(
  "/unread-count",
  protect,
  getUnreadMessageCount
);

// ============================================================
// BACKWARD COMPATIBILITY
// GET /api/messages/unread/count
// ============================================================

router.get(
  "/unread/count",
  protect,
  getUnreadMessageCount
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
// MARK SINGLE MESSAGE AS READ
// PUT /api/messages/:id/read
// ============================================================
//
// IMPORTANT:
// This comes before /:userId.
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
// Keep this LAST because :userId is dynamic.
// ============================================================

router.get(
  "/:userId",
  protect,
  getUserMessages
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;