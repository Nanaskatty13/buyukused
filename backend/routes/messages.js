const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { verifyToken } = require("../middleware/auth");

// ===== GET ALL MESSAGES FOR A USER =====
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow user to see their own messages (or admin)
    if (userId !== req.userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email photoURL")
      .populate("receiver", "name email photoURL")
      .populate("productId", "title image")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== SEND A MESSAGE =====
router.post("/", verifyToken, async (req, res) => {
  try {
    const { receiver, productId, message } = req.body;

    if (!receiver || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message are required",
      });
    }

    const newMessage = new Message({
      sender: req.userId,
      receiver,
      productId: productId || null,
      message,
    });

    await newMessage.save();

    // Populate sender/receiver for response
    await newMessage.populate("sender", "name email photoURL");
    await newMessage.populate("receiver", "name email photoURL");

    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== MARK MESSAGE AS READ =====
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only receiver can mark as read
    if (msg.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    msg.read = true;
    await msg.save();

    res.json({ success: true, message: msg });
  } catch (err) {
    console.error("Error marking message read:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== DELETE MESSAGE =====
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only sender or receiver can delete
    if (msg.sender.toString() !== req.userId.toString() && msg.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await msg.deleteOne();
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;