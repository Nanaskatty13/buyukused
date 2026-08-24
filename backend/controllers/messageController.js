// backend/controllers/messageController.js

const mongoose = require("mongoose");
const Message = require("../models/Message");

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
  return req.userId || req.user?.id || req.user?._id;
};

// ─── Populate helper ─────────────────────────────────────────────
const populateSenderReceiver = async (message) => {
  await message.populate(
    "sender",
    "name email profileImage avatar photo isVerified"
  );
  await message.populate(
    "receiver",
    "name email profileImage avatar photo isVerified"
  );
  await message.populate("productId", "title price image images");
  return message;
};

// ============================================================
// GET ALL MESSAGES FOR A USER
// GET /api/messages/:userId
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

    const isAdmin = req.user?.role === "admin";
    if (userId.toString() !== currentUserId.toString() && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email profileImage avatar photo isVerified")
      .populate("receiver", "name email profileImage avatar photo isVerified")
      .populate("productId", "title price image images")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("❌ Error fetching user messages:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch messages.",
    });
  }
};

// ============================================================
// GET CONVERSATION BETWEEN TWO USERS
// GET /api/messages/conversation/:userId
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
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .populate("sender", "name email profileImage avatar photo isVerified")
      .populate("receiver", "name email profileImage avatar photo isVerified")
      .populate("productId", "title price image images")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("❌ Error fetching conversation:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch conversation.",
    });
  }
};

// ============================================================
// SEND MESSAGE (with attachment support)
// POST /api/messages
// ============================================================

const sendMessage = async (req, res) => {
  try {
    const senderId = getUserId(req);
    const { receiver, productId, message, attachment } = req.body;

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

    if (productId && !isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // At least one of message or attachment must be present
    const hasText = typeof message === "string" && message.trim().length > 0;
    const hasAttachment = attachment && attachment.url && attachment.type;

    if (!hasText && !hasAttachment) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or an attachment.",
      });
    }

    if (senderId.toString() === receiver.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself.",
      });
    }

    if (hasText && message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters.",
      });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver,
      productId: productId || undefined,
      message: hasText ? message.trim() : "",
      attachment: hasAttachment ? attachment : null,
      read: false,
    });

    await newMessage.save();
    await populateSenderReceiver(newMessage);

    console.log(`💬 Message sent: ${senderId} → ${receiver}`);

    return res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message.",
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

    if (message.receiver.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to mark this message as read.",
      });
    }

    message.read = true;
    await message.save();

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("❌ Error marking message as read:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark message as read.",
    });
  }
};

// ============================================================
// MARK ALL MESSAGES FROM A USER AS READ
// PUT /api/messages/conversation/:userId/read
// ============================================================

const markConversationAsRead = async (req, res) => {
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

    const result = await Message.updateMany(
      {
        sender: senderId,
        receiver: currentUserId,
        read: false,
      },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount || 0,
      message: "Conversation marked as read.",
    });
  } catch (error) {
    console.error("❌ Error marking conversation as read:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark conversation as read.",
    });
  }
};

// ============================================================
// GET UNREAD MESSAGE COUNT
// GET /api/messages/unread/count
// ============================================================

const getUnreadMessageCount = async (req, res) => {
  try {
    const currentUserId = getUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const count = await Message.countDocuments({
      receiver: currentUserId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("❌ Error getting unread message count:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread message count.",
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

    const isSender = message.sender.toString() === currentUserId.toString();
    const isReceiver = message.receiver.toString() === currentUserId.toString();
    const isAdmin = req.user?.role === "admin";

    if (!isSender && !isReceiver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this message.",
      });
    }

    await message.deleteOne();

    console.log(`🗑️ Message deleted: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete message.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getUserMessages,
  getConversation,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadMessageCount,
  deleteMessage,
};