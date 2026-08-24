// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Recipient (the user who will see this notification)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Optional: who triggered this notification (e.g., the viewer)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    link: {
      type: String,
      default: '',
      trim: true,
    },

    type: {
      type: String,
      enum: ['system', 'product_viewed', 'message', 'order_update', 'promotion', 'other'],
      default: 'system',
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);