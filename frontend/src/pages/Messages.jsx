// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');

// ─── GET unread message count ────────────────────────────────
// ✅ Available to any authenticated user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET all messages for a user ─────────────────────────────
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email profileImage')
      .populate('receiver', 'name email profileImage')
      .populate('productId', 'title image price')
      .sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET conversation between two users ──────────────────────
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
      .populate('sender', 'name email profileImage')
      .populate('receiver', 'name email profileImage')
      .populate('productId', 'title image price')
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET all conversations for the logged-in user ────────────
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email profileImage')
      .populate('receiver', 'name email profileImage')
      .populate('productId', 'title image price')
      .sort({ createdAt: -1 });

    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.sender._id.toString() === userId.toString()
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partner: msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender,
          messages: [],
          unread: 0,
          lastMessage: null,
        };
      }
      conversations[partnerId].messages.push(msg);
      if (!msg.isRead && msg.receiver._id.toString() === userId.toString()) {
        conversations[partnerId].unread++;
      }
      // Keep last message (most recent)
      if (!conversations[partnerId].lastMessage ||
          new Date(msg.createdAt) > new Date(conversations[partnerId].lastMessage.createdAt)) {
        conversations[partnerId].lastMessage = msg;
      }
    });

    const result = Object.values(conversations).map(conv => ({
      partner: conv.partner,
      lastMessage: conv.lastMessage,
      unread: conv.unread,
      messages: conv.messages,
    })).sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));

    res.json({ success: true, conversations: result });
  } catch (error) {
    console.error('Error fetching conversations:', error);
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
    if (!mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({ success: false, message: 'Invalid receiver ID' });
    }
    const newMessage = new Message({
      sender: req.user._id,
      receiver,
      message,
      productId: productId || null,
      isRead: false,
    });
    await newMessage.save();
    await newMessage.populate('sender', 'name email profileImage');
    await newMessage.populate('receiver', 'name email profileImage');
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
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── Delete a message (only if user is sender or receiver) ──
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