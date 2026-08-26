// ============================================================
// backend/models/Feedback.js
// BuyUKUsed Seller Feedback Model
// ============================================================

"use strict";

const mongoose = require("mongoose");

// ============================================================
// CONSTANTS
// ============================================================

const FEEDBACK_TYPES = Object.freeze([
  "positive",
  "neutral",
  "negative",
]);

const FEEDBACK_STATUSES = Object.freeze([
  "active",
  "pending",
  "declined",
]);

// ============================================================
// SCHEMA
// ============================================================

const feedbackSchema = new mongoose.Schema(
  {
    // ==========================================================
    // SELLER
    // ==========================================================

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================================
    // BUYER
    // ==========================================================

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================================
    // ORDER
    // ==========================================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    // ==========================================================
    // PRODUCT
    // ==========================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },

    productName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    // ==========================================================
    // FEEDBACK TYPE
    // ==========================================================

    type: {
      type: String,
      enum: FEEDBACK_TYPES,
      required: true,
      index: true,
    },

    // ==========================================================
    // BUYER COMMENT
    // ==========================================================

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // ==========================================================
    // MODERATION
    // ==========================================================

    status: {
      type: String,
      enum: FEEDBACK_STATUSES,
      default: "active",
      index: true,
    },

    // ==========================================================
    // SELLER RESPONSE
    // ==========================================================

    sellerResponse: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    sellerRespondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================================================
// INDEXES
// ============================================================

// All seller feedback
feedbackSchema.index({
  seller: 1,
  status: 1,
  createdAt: -1,
});

// Buyer feedback history
feedbackSchema.index({
  buyer: 1,
  createdAt: -1,
});

// Prevent the same buyer from reviewing the same order twice
feedbackSchema.index(
  {
    buyer: 1,
    seller: 1,
    order: 1,
  },
  {
    unique: true,
  }
);

// ============================================================
// MODEL
// ============================================================

const Feedback =
  mongoose.models.Feedback ||
  mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;