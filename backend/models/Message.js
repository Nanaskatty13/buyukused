// backend/models/Message.js

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
    // TEXT MESSAGE
    // ==========================================================

    message: {
      type: String,
      trim: true,
      default: "",
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
//
// A message must contain either text OR an attachment.
//
// This allows:
//   - Text messages
//   - Image messages
//   - Video messages
//   - File messages
//   - Text + image
//   - Text + video
// ============================================================

messageSchema.pre("validate", function (next) {
  const hasText =
    typeof this.message === "string" &&
    this.message.trim().length > 0;

  const hasAttachment =
    this.attachment &&
    this.attachment.url;

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

messageSchema.index({
  sender: 1,
  receiver: 1,
  createdAt: 1,
});

messageSchema.index({
  receiver: 1,
  read: 1,
});

messageSchema.index({
  productId: 1,
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Message ||
  mongoose.model(
    "Message",
    messageSchema
  );