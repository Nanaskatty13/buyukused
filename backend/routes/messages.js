const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // now returns the verifyToken function
const Message = require('../models/Message');

// ─── GET unread message count ────────────────────────────────
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET all messages for the logged‑in user ──────────────────
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email profileImage avatar photo isVerified')
      .populate('receiver', 'name email profileImage avatar photo isVerified')
      .populate('productId', 'title image price')
      .sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET conversation with another user ──────────────────────
router.get('/conversation/:otherUserId', auth, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .populate('sender', 'name email profileImage avatar photo isVerified')
      .populate('receiver', 'name email profileImage avatar photo isVerified')
      .populate('productId', 'title image price')
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Send a new message ──────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, message, productId } = req.body;
    if (!receiver || !message) {
      return res.status(400).json({ success: false, message: 'Receiver and message are required' });
    }
    const newMessage = new Message({
      sender: req.user._id,
      receiver,
      message,
      productId: productId || null,
      isRead: false,
    });
    await newMessage.save();
    await newMessage.populate('sender', 'name email profileImage avatar photo isVerified');
    await newMessage.populate('receiver', 'name email profileImage avatar photo isVerified');
    await newMessage.populate('productId', 'title image price');
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Mark a message as read ──────────────────────────────────
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    message.isRead = true;
    await message.save();
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Delete a message ────────────────────────────────────────
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    if (message.sender.toString() !== req.user._id.toString() &&
        message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await message.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;