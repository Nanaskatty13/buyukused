// backend/routes/messages.js

const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const { verifyToken } = require("../middleware/auth");

// ============================================================
// HELPERS
// ============================================================

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

// ============================================================
// GET ALL MESSAGES FOR A USER
// GET /api/messages/:userId
// ============================================================

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // --------------------------------------------------------
    // AUTHORIZATION
    // --------------------------------------------------------

    if (
      userId !== req.userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // --------------------------------------------------------
    // GET MESSAGES
    // --------------------------------------------------------

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate(
        "sender",
        "name email photoURL avatar"
      )
      .populate(
        "receiver",
        "name email photoURL avatar"
      )
      .populate(
        "productId",
        "title image images"
      )
      .sort({
        createdAt: 1,
      });

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(
      "❌ Error fetching messages:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch messages.",
    });
  }
});

// ============================================================
// SEND A MESSAGE
// POST /api/messages
// ============================================================
//
// Supports:
//
// TEXT
// {
//   receiver,
//   message
// }
//
// IMAGE / VIDEO / FILE
// {
//   receiver,
//   message,
//   attachment: {
//     url,
//     type,
//     name,
//     size
//   }
// }
//
// TEXT + IMAGE
// {
//   receiver,
//   message: "Check this out",
//   attachment: {...}
// }
// ============================================================

router.post("/", verifyToken, async (req, res) => {
  try {
    const receiver =
      normalizeString(
        req.body?.receiver
      );

    const productId =
      normalizeString(
        req.body?.productId
      );

    const message =
      normalizeString(
        req.body?.message
      );

    // --------------------------------------------------------
    // ATTACHMENT
    // --------------------------------------------------------

    let attachment = null;

    if (
      req.body?.attachment &&
      typeof req.body.attachment ===
        "object"
    ) {
      const url =
        normalizeString(
          req.body.attachment.url
        );

      const type =
        normalizeString(
          req.body.attachment.type
        );

      const name =
        normalizeString(
          req.body.attachment.name
        );

      const size =
        Number(
          req.body.attachment.size || 0
        );

      if (url) {
        attachment = {
          url,
          type:
            type ||
            "application/octet-stream",
          name,
          size:
            Number.isFinite(size)
              ? size
              : 0,
        };
      }
    }

    // --------------------------------------------------------
    // VALIDATE RECEIVER
    // --------------------------------------------------------

    if (!receiver) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver is required.",
      });
    }

    // --------------------------------------------------------
    // VALIDATE MESSAGE
    // --------------------------------------------------------

    if (
      !message &&
      !attachment
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message or attachment is required.",
      });
    }

    // --------------------------------------------------------
    // CREATE MESSAGE
    // --------------------------------------------------------

    const newMessage =
      new Message({
        sender: req.userId,

        receiver,

        productId:
          productId || null,

        message:
          message || "",

        attachment,
      });

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    await newMessage.save();

    // --------------------------------------------------------
    // POPULATE
    // --------------------------------------------------------

    await newMessage.populate(
      "sender",
      "name email photoURL avatar"
    );

    await newMessage.populate(
      "receiver",
      "name email photoURL avatar"
    );

    await newMessage.populate(
      "productId",
      "title image images"
    );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

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
        "Unable to send message.",
    });
  }
});

// ============================================================
// MARK MESSAGE AS READ
// PUT /api/messages/:id/read
// ============================================================

router.put(
  "/:id/read",
  verifyToken,
  async (req, res) => {
    try {
      const msg =
        await Message.findById(
          req.params.id
        );

      if (!msg) {
        return res.status(404).json({
          success: false,
          message:
            "Message not found.",
        });
      }

      // ------------------------------------------------------
      // ONLY RECEIVER CAN MARK AS READ
      // ------------------------------------------------------

      if (
        msg.receiver.toString() !==
        req.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized.",
        });
      }

      msg.read = true;

      await msg.save();

      return res.json({
        success: true,
        message: msg,
      });
    } catch (error) {
      console.error(
        "❌ Error marking message read:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to mark message as read.",
      });
    }
  }
);

// ============================================================
// DELETE MESSAGE
// DELETE /api/messages/:id
// ============================================================

router.delete(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {
      const msg =
        await Message.findById(
          req.params.id
        );

      if (!msg) {
        return res.status(404).json({
          success: false,
          message:
            "Message not found.",
        });
      }

      // ------------------------------------------------------
      // ONLY SENDER OR RECEIVER CAN DELETE
      // ------------------------------------------------------

      const isSender =
        msg.sender.toString() ===
        req.userId.toString();

      const isReceiver =
        msg.receiver.toString() ===
        req.userId.toString();

      if (
        !isSender &&
        !isReceiver
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized.",
        });
      }

      // ------------------------------------------------------
      // DELETE
      // ------------------------------------------------------

      await msg.deleteOne();

      return res.json({
        success: true,
        message:
          "Message deleted.",
      });
    } catch (error) {
      console.error(
        "❌ Error deleting message:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete message.",
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;