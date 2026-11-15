// backend/controllers/messageController.js

const mongoose = require("mongoose");
const Message = require("../models/Message");

// ============================================================
// TYPING STATE (in-memory)
//
// Ephemeral — no need to persist. Auto-expires after 5s so
// abandoned typing (tab closed, network drop, crash) self-
// cleans without a cron job.
//
// Key format:   `${receiverId}:${senderId}`
// Value:        { isTyping: true, updatedAt: <ms> }
// ============================================================

const TYPING_TIMEOUT_MS = 5000;

const typingState = new Map();

const cleanupTypingState = () => {
  const now = Date.now();
  for (const [key, state] of typingState.entries()) {
    if (now - state.updatedAt > TYPING_TIMEOUT_MS) {
      typingState.delete(key);
    }
  }
};

// Returns the most recent "typing" partner for the given
// receiver, or null if nobody is typing.
const getTypingForReceiver = (receiverId) => {
  cleanupTypingState();

  let latest = null;
  let latestTs = 0;

  const receiver = String(receiverId);

  for (const [key, state] of typingState.entries()) {
    const [rid, sid] = key.split(":");
    if (rid === receiver && state.isTyping && state.updatedAt > latestTs) {
      latestTs = state.updatedAt;
      latest = { partnerId: sid, isTyping: true };
    }
  }

  return latest;
};

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
  return req.userId || req.user?.id || req.user?._id;
};

// ============================================================
// GET ALL MESSAGES FOR A USER
// GET /api/messages/:userId
//
// ✅ Now supports pagination (?page=&limit=) with sane defaults
// so the 5s poll can't be weaponized by a heavy account.
// ✅ Now returns `typing: { partnerId, isTyping } | null` so
// the frontend can show the "X is typing…" indicator.
// ============================================================

const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = getUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Only allow users to retrieve their own messages.
    // Admins can retrieve another user's messages.
    const isAdmin = req.user?.role === "admin";

    if (
      userId.toString() !== currentUserId.toString() &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // ─── Pagination ────────────────────────────────────────
    // Default to the 500 most recent messages so the 5s poll
    // stays cheap. Callers can pass ?limit= up to 2000.

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 500,
        1
      ),
      2000
    );

    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    };

    // ─── Query ─────────────────────────────────────────────
    // Fetch newest-first so the page window is the *recent*
    // messages, then reverse to ascending for API stability.

    const [messagesDesc, total] = await Promise.all([
      Message.find(filter)
        .populate(
          "sender",
          "name email photoURL profilePicture"
        )
        .populate(
          "receiver",
          "name email photoURL profilePicture"
        )
        .populate(
          "productId",
          "title price image images"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Message.countDocuments(filter),
    ]);

    const messages = messagesDesc.reverse();

    // ─── Typing state for this user ────────────────────────
    const typing = getTypingForReceiver(userId);

    return res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      limit,
      hasMore: skip + messages.length < total,
      messages,
      typing, // ← NEW: { partnerId, isTyping } | null
    });
  } catch (error) {
    console.error(
      "❌ Error fetching user messages:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch messages.",
    });
  }
};

// ============================================================
// GET CONVERSATION BETWEEN TWO USERS
// GET /api/messages/conversation/:userId
//
// ✅ Now returns `typing: { partnerId, isTyping } | null` so
// the ProductDetails chat modal can show the indicator too.
// ============================================================

const getConversation = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const { userId: otherUserId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: currentUserId,
        },
      ],
    })
      .populate(
        "sender",
        "name email photoURL profilePicture"
      )
      .populate(
        "receiver",
        "name email photoURL profilePicture"
      )
      .populate(
        "productId",
        "title image images"
      )
      .sort({
        createdAt: 1,
      });

    // ─── Typing state for this thread ─────────────────────
    // If the OTHER user is typing to the CURRENT user, we
    // surface it. If the current user is typing to the
    // other user, we don't show it back to themselves.
    const typing = getTypingForReceiver(currentUserId);
    const relevantTyping =
      typing && String(typing.partnerId) === String(otherUserId)
        ? typing
        : null;

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
      typing: relevantTyping, // ← NEW
    });
  } catch (error) {
    console.error(
      "❌ Error fetching conversation:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch conversation.",
    });
  }
};

// ============================================================
// SET TYPING STATUS
// POST /api/messages/typing
//
// ✅ NEW endpoint — the frontend has been calling this since
// the typing indicator was added to Messages.jsx. Without a
// handler, those POSTs returned 404 and typing never worked.
// ============================================================

const setTyping = async (req, res) => {
  try {
    const senderId = getUserId(req);

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { receiver, isTyping } = req.body;

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required.",
      });
    }

    if (!isValidObjectId(receiver)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID.",
      });
    }

    if (String(receiver) === String(senderId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot type to yourself.",
      });
    }

    const key = `${String(receiver)}:${String(senderId)}`;

    if (isTyping) {
      typingState.set(key, {
        isTyping: true,
        updatedAt: Date.now(),
      });
    } else {
      typingState.delete(key);
    }

    return res.status(200).json({
      success: true,
      typing: Boolean(isTyping),
    });
  } catch (error) {
    console.error(
      "❌ Error setting typing state:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to set typing state.",
    });
  }
};

// ============================================================
// SEND MESSAGE
// POST /api/messages
// ============================================================

const sendMessage = async (req, res) => {
  try {
    const senderId = getUserId(req);

    const {
      receiver,
      productId,
      message,
    } = req.body;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required.",
      });
    }

    if (!isValidObjectId(receiver)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID.",
      });
    }

    if (
      productId &&
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    const cleanMessage = message.trim();

    // Prevent sending a message to yourself.
    if (
      senderId.toString() ===
      receiver.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot send a message to yourself.",
      });
    }

    // Optional protection against extremely large messages.
    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 5000 characters.",
      });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver,
      productId:
        productId || undefined,
      message: cleanMessage,
      read: false,
    });

    await newMessage.save();

    // ─── Clear typing state for this pair ─────────────────
    // The user just sent a message — they're no longer typing.
    // Without this, the receiver sees "typing…" for up to 5s
    // after the message arrives. WhatsApp clears immediately.
    typingState.delete(`${String(receiver)}:${String(senderId)}`);

    // Populate the message before returning it.
    await newMessage.populate([
      {
        path: "sender",
        select:
          "name email photoURL profilePicture",
      },
      {
        path: "receiver",
        select:
          "name email photoURL profilePicture",
      },
      {
        path: "productId",
        select:
          "title price image images",
      },
    ]);

    console.log(
      `💬 Message sent: ${senderId} → ${receiver}`
    );

    return res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error(
      "❌ Error sending message:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send message.",
    });
  }
};

// ============================================================
// MARK MESSAGE AS READ
// PUT /api/messages/:id/read
// ============================================================

const markMessageAsRead = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const { id } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    // Only the receiver can mark the message as read.
    if (
      message.receiver.toString() !==
      currentUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to mark this message as read.",
      });
    }

    // ─── Idempotent fast-path ────────────────────────────
    // If already read, skip the DB write. This matters a lot
    // because the frontend marks every unread message on
    // thread open — repeated opens used to re-save every row.
    if (message.read) {
      return res.status(200).json({
        success: true,
        message,
        alreadyRead: true,
      });
    }

    message.read = true;

    await message.save();

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(
      "❌ Error marking message as read:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to mark message as read.",
    });
  }
};

// ============================================================
// MARK ALL MESSAGES FROM A USER AS READ
// PUT /api/messages/conversation/:userId/read
// ============================================================

const markConversationAsRead = async (
  req,
  res
) => {
  try {
    const currentUserId = getUserId(req);
    const { userId: senderId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(senderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // ─── Collect the message IDs before updating ──────────
    // The frontend uses these to update its local state in
    // a single pass instead of re-fetching the whole inbox.
    const unreadMessages = await Message.find({
      sender: senderId,
      receiver: currentUserId,
      read: false,
    })
      .select("_id")
      .lean();

    const messageIds = unreadMessages.map((m) => m._id);

    let modifiedCount = 0;

    if (messageIds.length > 0) {
      const result = await Message.updateMany(
        {
          _id: { $in: messageIds },
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );
      modifiedCount = result.modifiedCount || 0;
    }

    return res.status(200).json({
      success: true,
      modifiedCount,
      messageIds, // ← NEW
      message:
        modifiedCount > 0
          ? "Conversation marked as read."
          : "No unread messages in this conversation.",
    });
  } catch (error) {
    console.error(
      "❌ Error marking conversation as read:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to mark conversation as read.",
    });
  }
};

// ============================================================
// GET UNREAD MESSAGE COUNT
// GET /api/messages/unread-count
// ============================================================

const getUnreadMessageCount = async (
  req,
  res
) => {
  try {
    const currentUserId = getUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const count =
      await Message.countDocuments({
        receiver: currentUserId,
        read: false,
      });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "❌ Error getting unread message count:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to get unread message count.",
    });
  }
};

// ============================================================
// DELETE MESSAGE
// DELETE /api/messages/:id
// ============================================================

const deleteMessage = async (req, res) => {
  try {
    const currentUserId = getUserId(req);
    const { id } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    const isSender =
      message.sender.toString() ===
      currentUserId.toString();

    const isReceiver =
      message.receiver.toString() ===
      currentUserId.toString();

    const isAdmin =
      req.user?.role === "admin";

    if (
      !isSender &&
      !isReceiver &&
      !isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this message.",
      });
    }

    await message.deleteOne();

    // ─── Clear any typing state for this pair ─────────────
    // Deleting a message shouldn't leave a stale typing flag.
    typingState.delete(
      `${String(message.receiver)}:${String(message.sender)}`
    );
    typingState.delete(
      `${String(message.sender)}:${String(message.receiver)}`
    );

    console.log(
      `🗑️ Message deleted: ${id}`
    );

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ Error deleting message:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete message.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getUserMessages,
  getConversation,
  setTyping,        // ← NEW
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadMessageCount,
  deleteMessage,
};