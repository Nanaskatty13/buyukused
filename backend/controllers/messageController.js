// ============================================================
// backend/controllers/messageController.js
// BuyUKUsed - Messaging Controller
// ============================================================

const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const Product = require("../models/Product");

// ============================================================
// HELPERS
// ============================================================

const getAuthenticatedUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.user?.user_id ||
    null
  );
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeId = (value) => {
  if (!value) return null;
  return String(value);
};

const populateMessage = (query) => {
  return query
    .populate("sender", "name email phone profileImage avatar photo")
    .populate("receiver", "name email phone profileImage avatar photo")
    .populate("productId", "title price image images sellerId");
};

// ============================================================
// SEND MESSAGE
// POST /api/messages
// ============================================================

const sendMessage = async (req, res, next) => {
  try {
    const senderId = getAuthenticatedUserId(req);

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      receiver,
      receiverId,
      recipientId,
      productId,
      message,
      text,
      attachment,
    } = req.body;

    const targetReceiver = receiver || receiverId || recipientId;
    const messageText =
      typeof message === "string"
        ? message.trim()
        : typeof text === "string"
          ? text.trim()
          : "";

    // ----------------------------------------------------------
    // Validate receiver
    // ----------------------------------------------------------

    if (!targetReceiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required.",
      });
    }

    if (!isValidObjectId(targetReceiver)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID.",
      });
    }

    if (normalizeId(senderId) === normalizeId(targetReceiver)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself.",
      });
    }

    // ----------------------------------------------------------
    // Verify receiver exists
    // ----------------------------------------------------------

    const receiverUser = await User.findById(targetReceiver)
      .select("_id name email isActive")
      .lean();

    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    if (receiverUser.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This user account is inactive.",
      });
    }

    // ----------------------------------------------------------
    // Validate product if supplied
    // ----------------------------------------------------------

    let validProductId = null;

    if (productId) {
      if (!isValidObjectId(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID.",
        });
      }

      const product = await Product.findById(productId)
        .select("_id title sellerId")
        .lean();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      validProductId = product._id;
    }

    // ----------------------------------------------------------
    // Normalize attachment
    // ----------------------------------------------------------

    let validAttachment = null;

    if (attachment) {
      if (
        typeof attachment !== "object" ||
        !attachment.url ||
        typeof attachment.url !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid attachment.",
        });
      }

      validAttachment = {
        url: attachment.url.trim(),
        type:
          typeof attachment.type === "string"
            ? attachment.type.trim()
            : "file",
        name:
          typeof attachment.name === "string"
            ? attachment.name.trim()
            : "",
        size:
          Number.isFinite(Number(attachment.size))
            ? Number(attachment.size)
            : 0,
      };
    }

    // ----------------------------------------------------------
    // Message must contain text or attachment
    // ----------------------------------------------------------

    if (!messageText && !validAttachment) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or an attachment.",
      });
    }

    // ----------------------------------------------------------
    // Create message
    // ----------------------------------------------------------

    const newMessage = new Message({
      sender: senderId,
      receiver: targetReceiver,
      productId: validProductId,
      message: messageText,
      attachment: validAttachment,
      read: false,
    });

    await newMessage.save();

    // ----------------------------------------------------------
    // Populate response
    // ----------------------------------------------------------

    const populatedMessage = await populateMessage(
      Message.findById(newMessage._id)
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedMessage,
      messageData: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET USER'S MESSAGES
// GET /api/messages
// ============================================================

const getMessages = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const messages = await populateMessage(
      Message.find({
        $or: [
          { sender: userId },
          { receiver: userId },
        ],
      }).sort({ createdAt: -1 })
    ).lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CONVERSATION
// GET /api/messages/conversation/:userId
// ============================================================

const getConversation = async (req, res, next) => {
  try {
    const currentUserId = getAuthenticatedUserId(req);
    const otherUserId = req.params.userId;

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

    const otherUser = await User.findById(otherUserId)
      .select("_id name email phone profileImage avatar photo")
      .lean();

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const messages = await populateMessage(
      Message.find({
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
      }).sort({ createdAt: 1 })
    ).lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
      data: messages,
      user: otherUser,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CONVERSATIONS
// GET /api/messages/conversations
// ============================================================

const getConversations = async (req, res, next) => {
  try {
    const currentUserId = getAuthenticatedUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate(
        "sender",
        "name email profileImage avatar photo"
      )
      .populate(
        "receiver",
        "name email profileImage avatar photo"
      )
      .populate(
        "productId",
        "title price image images"
      )
      .lean();

    const conversationMap = new Map();

    for (const message of messages) {
      const senderId = normalizeId(message.sender?._id);
      const receiverId = normalizeId(message.receiver?._id);

      const otherUser =
        senderId === normalizeId(currentUserId)
          ? message.receiver
          : message.sender;

      if (!otherUser?._id) {
        continue;
      }

      const conversationKey = normalizeId(otherUser._id);

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      if (
        normalizeId(message.receiver?._id) ===
          normalizeId(currentUserId) &&
        message.read === false
      ) {
        conversationMap.get(conversationKey).unreadCount += 1;
      }
    }

    const conversations = Array.from(
      conversationMap.values()
    );

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET UNREAD MESSAGE COUNT
// GET /api/messages/unread-count
// GET /api/messages/unread/count
// ============================================================

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const count = await Message.countDocuments({
      receiver: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      count,
      unreadCount: count,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MARK ONE MESSAGE AS READ
// PUT /api/messages/:id/read
// ============================================================

const markMessageAsRead = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const messageId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const updatedMessage = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiver: userId,
      },
      {
        $set: {
          read: true,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found or you are not authorized to mark it as read.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: updatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MARK CONVERSATION AS READ
// PUT /api/messages/conversation/:userId/read
// ============================================================

const markConversationAsRead = async (req, res, next) => {
  try {
    const currentUserId = getAuthenticatedUserId(req);
    const otherUserId = req.params.userId;

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

    const result = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read.",
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE MESSAGE
// DELETE /api/messages/:id
// ============================================================

const deleteMessage = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const messageId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found or you are not authorized to delete it.",
      });
    }

    await Message.deleteOne({
      _id: messageId,
      sender: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendMessage,
  getMessages,
  getConversation,
  getConversations,
  getUnreadCount,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
};