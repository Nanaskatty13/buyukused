// ============================================================
// backend/models/Message.js
// BuyUKUsed - Message Model
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// ATTACHMENT SUB-SCHEMA
// ============================================================

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      required: true,
    },

    type: {
      type: String,
      trim: true,
      required: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    size: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// MESSAGE SCHEMA
// ============================================================

const messageSchema = new mongoose.Schema(
  {
    // ==========================================================
    // SENDER
    // ==========================================================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================================
    // RECEIVER
    // ==========================================================

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================================
    // PRODUCT
    // ==========================================================

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },

    // ==========================================================
    // TEXT
    // ==========================================================

    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    // ==========================================================
    // ATTACHMENT
    // ==========================================================

    attachment: {
      type: attachmentSchema,
      default: null,
    },

    // ==========================================================
    // READ STATUS
    // ==========================================================

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

// ============================================================
// VALIDATION
// ============================================================

messageSchema.pre("validate", function (next) {
  const hasText =
    typeof this.message === "string" &&
    this.message.trim().length > 0;

  const hasAttachment =
    this.attachment &&
    typeof this.attachment.url === "string" &&
    this.attachment.url.trim().length > 0;

  if (!hasText && !hasAttachment) {
    return next(
      new Error(
        "Message must contain text or an attachment."
      )
    );
  }

  next();
});

// ============================================================
// INDEXES
// ============================================================

// Conversation lookup
messageSchema.index({
  sender: 1,
  receiver: 1,
  createdAt: 1,
});

// Reverse conversation lookup
messageSchema.index({
  receiver: 1,
  sender: 1,
  createdAt: 1,
});

// Unread messages
messageSchema.index({
  receiver: 1,
  read: 1,
});

// Product conversations
messageSchema.index({
  productId: 1,
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);