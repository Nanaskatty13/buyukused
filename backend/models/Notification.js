const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "system",
        "product_viewed",
        "message",
        "order_update",
        "promotion",
        "other",
      ],
      default: "system",
      index: true,
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

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  read: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  type: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    notificationSchema
  );